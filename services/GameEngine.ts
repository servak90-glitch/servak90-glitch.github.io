/**
 * GameEngine — основной игровой цикл
 * 
 * Рефакторировано в версии 3.0:
 * - Логика разбита на подсистемы в services/systems/
 * - tick() теперь оркестрирует подсистемы
 */

import { GameState, VisualEvent, Resources, ResourceType, GameCommand } from '../types';
import { calculateStats, recalculateCargoWeight } from './gameMath';
import { calculateTotalMass } from './mathEngine';
import { narrativeManager } from './narrativeManager';
import { BIOMES } from '../constants';

import { getActivePerkIds } from './factionLogic';
import {
    processEffects,
    processAnalyzer,
    processEvents,
    processHeat,
    processShield,
    processDrilling,
    processCombat,
    processEntities,
    processHazards,
    processTravel,
    applyResourceChanges,
    ResourceChanges
} from './systems';
import { calculateChronosTime } from './systems/TimeSystem';
import { processDrones, processRegeneration } from './systems/DroneSystem';
import { tunnelAtmosphere } from './systems/TunnelAtmosphere';
import { abilitySystem } from './systems/AbilitySystem';
import { expeditionSystem } from './systems/ExpeditionSystem';
import { raidSystem } from './systems/RaidSystem';
import { economySystem } from './systems/EconomySystem';
import { EventTrigger, PlayerBase, DefenseUnitType } from '../types';
import { DEFENSE_UNITS } from '../constants/defenseUnits';

export class GameEngine {
    tick(state: GameState, dt: number, timestamp: number): {
        partialState: Partial<GameState>,
        events: VisualEvent[],
        commands: GameCommand[]
    } {
        const visualEvents: VisualEvent[] = [];
        const commands: GameCommand[] = [];

        // === КРИТИЧЕСКОЕ ПОВРЕЖДЕНИЕ: СМЕРТЬ ===
        if (state.integrity <= 0 && !state.isGodMode) {
            const stats = calculateStats(state.drill, state.skillLevels, state.equippedArtifacts, state.inventory, state.depth, state.activeEffects, state.operatorId, state.hiredCrewIds);
            const reducedResources = Object.keys(state.resources).reduce((acc, key) => {
                acc[key as keyof Resources] = Math.floor(state.resources[key as keyof Resources] * 0.7);
                return acc;
            }, {} as Resources);

            visualEvents.push({ type: 'LOG', msg: "!!! КРИТИЧЕСКОЕ ПОВРЕЖДЕНИЕ КОРПУСА !!!", color: "text-red-600 font-black bg-red-950/50" });
            visualEvents.push({ type: 'LOG', msg: ">> АВАРИЙНЫЙ СБРОС...", color: "text-red-400" });

            return {
                partialState: {
                    integrity: stats.integrity,
                    heat: 0,
                    depth: Math.max(0, state.depth - 50),
                    resources: reducedResources,
                    isDrilling: false,
                    currentBoss: null,
                    combatMinigame: null,
                    shieldCharge: 0,
                },
                events: visualEvents,
                commands: []
            };
        }

        // === ВЫЧИСЛЕНИЕ СТАТОВ ===
        const stats = calculateStats(state.drill, state.skillLevels, state.equippedArtifacts, state.inventory, state.depth, state.activeEffects, state.operatorId, state.hiredCrewIds);
        if (state.isGodMode) {
            // В режиме бога — полное HP
            state = { ...state, integrity: stats.integrity };
        }

        // === CHRONOS PROTOCOL: TIME TICK ===
        // dt is in seconds. 1 real second = 1 game minute = 60 game seconds.
        // So we multiply dt by 60 to get game seconds.
        const gameSecondsPassed = dt * 60;
        const newGameTime = (state.gameTime || 0) + gameSecondsPassed;
        const chronos = calculateChronosTime(newGameTime);

        // === СБОР ИЗМЕНЕНИЙ ОТ ПОДСИСТЕМ ===
        const resourceChanges: ResourceChanges = {};
        const inventoryUpdates: Record<string, any> = {};
        const activePerks = getActivePerkIds(state.reputation);

        // 1. Эффекты (баффы/дебаффы)
        const effectsResult = processEffects(state, dt);
        visualEvents.push(...effectsResult.events);
        const activeEffects = effectsResult.update.activeEffects;

        // 2. Анализатор артефактов
        const analyzerResult = processAnalyzer(state);
        visualEvents.push(...analyzerResult.events);
        Object.assign(inventoryUpdates, analyzerResult.inventoryChanges);

        // 3. Случайные события
        const eventsResult = processEvents(state, stats);
        visualEvents.push(...eventsResult.events);
        if (eventsResult.update.resourceChanges) {
            Object.assign(resourceChanges, eventsResult.update.resourceChanges);
        }

        // COOLING MANAGER moved to separate high-frequency loop

        // 4. Щит
        const shieldResult = processShield(state, dt);

        // 5. Нагрев/Охлаждение
        const heatResult = processHeat(state, stats, activeEffects, dt);
        visualEvents.push(...heatResult.events);

        // 6. Бурение и добыча
        const drillResult = processDrilling(
            state,
            stats,
            activeEffects,
            heatResult.update.isDrilling,
            heatResult.update.isOverheated,
            dt,
            activePerks,
            { isInfiniteFuel: state.isInfiniteFuel, isZeroWeight: state.isZeroWeight }
        );
        visualEvents.push(...drillResult.events);
        Object.assign(resourceChanges, drillResult.resourceChanges);

        // 7. Бой с боссами
        const combatResult = processCombat(
            state,
            stats,
            shieldResult.isShielding,
            heatResult.update.isOverheated,
            dt
        );
        visualEvents.push(...combatResult.events);
        Object.assign(inventoryUpdates, combatResult.newInventoryItems);
        if (combatResult.questUpdates) {
            combatResult.questUpdates.forEach(upd => {
                // В будущем переведем на команды, пока передаем через стейт если нужно
                // Но лучше через команды:
                commands.push({ type: 'QUEST_OBJECTIVE_UPDATE', questId: 'AUTO', objectiveId: upd.target, value: 1 });
            });
        }

        // 8. Летающие объекты
        const entityResult = processEntities({
            ...state,
            currentBoss: combatResult.update.currentBoss,
            combatMinigame: combatResult.update.combatMinigame,
            isCoolingGameActive: heatResult.update.isCoolingGameActive
        });
        visualEvents.push(...entityResult.events);

        // 9. Регенерация и дроны
        // [PHASE 5 OPTIMIZATION] Throttle non-critical systems to 30 ticks (~0.5s)
        const isSlowTick = state.eventCheckTick % 30 === 0;
        let activeExpeditions = state.activeExpeditions;

        // 10. [PHASE 3] Economy Recovery (Saturation & Raid Risk)
        const deltaHours = gameSecondsPassed / 3600;
        const economyUpdates = economySystem.processEconomyRecovery(state, deltaHours);

        if (isSlowTick) {
            // [MODULAR] Expedition Update
            let hasChanges = false;
            const updated = state.activeExpeditions.map(ex => {
                const newVal = expeditionSystem.checkStatus(ex);
                if (newVal !== ex) hasChanges = true;
                return newVal;
            });
            if (hasChanges) activeExpeditions = updated;

            // [MODULAR] Commands for side systems
            commands.push({ type: 'CHECK_CARAVANS' });
            commands.push({ type: 'CHECK_QUESTS' });
            commands.push({ type: 'CHECK_CONTRACT_EXPIRATION' });
            commands.push({ type: 'GENERATE_CONTRACTS' });

            // [PHASE 6.2] Black Market
            if (!state.blackMarkets || Object.keys(state.blackMarkets).length === 0) {
                commands.push({ type: 'INITIALIZE_BLACK_MARKET' });
            }
            commands.push({ type: 'UPDATE_BLACK_MARKET_RISK', deltaHours: deltaHours * 30 });
        }

        // [RAID SYSTEM] Check every 3600 ticks (~6 min) - v4.1.3 balance
        // Only if player has bases
        let playerBases = state.playerBases || [];
        const nowMs = timestamp;

        // 11. [PHASE 4] Base Construction & Defense Production
        let basesChanged = false;
        playerBases = playerBases.map(base => {
            let baseUpdated = false;
            let updatedBase = { ...base };

            // Construction
            if (updatedBase.status === 'building' && nowMs >= updatedBase.constructionCompletionTime) {
                updatedBase.status = 'active';
                baseUpdated = true;
                basesChanged = true;
                visualEvents.push({ type: 'LOG', msg: `🏢 БАЗА В ${updatedBase.regionId.toUpperCase()} ПОСТРОЕНА!`, color: 'text-green-400 font-bold' });
                commands.push({ type: 'PLAY_SOUND', sfx: 'LOG' });
            }

            // Production Queue
            const queue = updatedBase.productionQueue ?? [];
            const completedJobs = queue.filter(job => nowMs >= job.completionTime);
            if (completedJobs.length > 0) {
                const newDefense = { ...(updatedBase.defense ?? { integrity: 100, shields: 0, infantry: 0, drones: 0, turrets: 0 }) };
                completedJobs.forEach(job => {
                    if (job.unitType === 'infantry') newDefense.infantry++;
                    else if (job.unitType === 'drone') newDefense.drones++;
                    else if (job.unitType === 'turret') newDefense.turrets++;
                    else if (job.unitType === 'shield_gen') newDefense.shields = 100;
                });
                updatedBase.defense = newDefense;
                updatedBase.productionQueue = queue.filter(job => nowMs < job.completionTime);
                baseUpdated = true;
                basesChanged = true;
                visualEvents.push({ type: 'LOG', msg: '🛡️ ПРОИЗВОДСТВО ОБОРОНЫ ЗАВЕРШЕНО!', color: 'text-green-400 font-bold' });
                commands.push({ type: 'PLAY_SOUND', sfx: 'LOG' });
            }

            return baseUpdated ? updatedBase : base;
        });

        // [RAID SYSTEM] ВРЕМЕННО ОТКЛЮЧЕНО v4.1.3
        // ПРИЧИНА: Рейды происходят 2-3 раза в секунду несмотря на все исправления
        // TODO: Полностью пересмотреть архитектуру системы рейдов
        /*
        const RAID_INTERVAL_MS = 6 * 60 * 1000; // 6 минут в миллисекундах
        const timeSinceLastRaid = nowMs - (state.lastRaidCheck || 0);
    
        if (timeSinceLastRaid >= RAID_INTERVAL_MS && playerBases.length > 0) {
            const raidResult = raidSystem.processBaseRaids(
                playerBases,
                state.reputation['REBELS'] || 0,
                state.isDrilling ? EventTrigger.DRILLING : EventTrigger.GLOBAL_MAP_ACTIVE
            );
    
            if (raidResult.updatedBases !== playerBases) {
                playerBases = raidResult.updatedBases;
                visualEvents.push(...raidResult.events);
            }
    
            inventoryUpdates['lastRaidCheck'] = nowMs;
        }
        */


        let integrity = eventsResult.update.integrity ?? heatResult.update.integrity ?? combatResult.update.integrity ?? state.integrity;
        let heat = eventsResult.update.heat ?? heatResult.update.heat;

        let depth = eventsResult.update.depth ?? drillResult.update.depth; // Event jump takes priority over drill? Or Add?

        // Wait, drillResult adds depth based on state.depth.
        // If event added depth instantaneously, does drillResult account for it?
        // drillResult uses `state.depth + ...`.
        // If event happens SAME TICK, we should combine.
        // But simpler to just take max or prioritize event jump.
        if (eventsResult.update.depth) {
            depth = Math.max(depth, eventsResult.update.depth);
        }

        // [BALANCING] Overload Heat Generation (+10/sec)
        const isOverloadActive = abilitySystem.getState('OVERLOAD').isActive;
        if (isOverloadActive) {
            heat += 10 * dt;
        }

        integrity = processRegeneration(state, stats, integrity);
        const droneResult = processDrones(state, stats, integrity, heat);
        if (droneResult.integrity !== undefined) integrity = droneResult.integrity;
        if (droneResult.integrity !== undefined) integrity = droneResult.integrity;
        if (droneResult.heat !== undefined) heat = droneResult.heat;

        // 10. Случайные опасности (Hazards)
        const hazardResult = processHazards({
            ...state,
            heat, // Use current accumulated heat
            integrity, // Use current accumulated integrity
            depth
        }, stats, dt, activePerks);
        if (hazardResult.update.integrity !== undefined) integrity = hazardResult.update.integrity;
        if (hazardResult.update.heat !== undefined) heat = hazardResult.update.heat;
        visualEvents.push(...hazardResult.events);

        // 11. Перемещение (Travel)
        const travelResult = processTravel(state);
        visualEvents.push(...travelResult.events);

        // === HAZARD TRIGGERS (Visual Effects) ===
        // Detect hazards from logs for visual triggers (Temporary coupling until VisualEvent supports explicit hazards)
        hazardResult.events.forEach(e => {
            if (e.type === 'LOG') {
                if (e.msg.includes('ОБВАЛ')) tunnelAtmosphere.triggerHazard('CAVE_IN', 0.5);
                if (e.msg.includes('ГАЗОВЫЙ')) tunnelAtmosphere.triggerHazard('GAS_POCKET', 0.5);
                if (e.msg.includes('МАГМАТИЧЕСКИЙ')) tunnelAtmosphere.triggerHazard('MAGMA_FLOW', 0.8);
            }
        });

        // 1. GAS_POCKET event triggers green mist
        const gasEvent = eventsResult.update.eventQueue.find(e => e.id === 'GAS_POCKET');
        if (gasEvent) {
            tunnelAtmosphere.triggerHazard('GAS_POCKET', 0.7);
        }

        // 2. Overheat triggers magma glow
        if (heat >= 90 && !state.isOverheated) {
            tunnelAtmosphere.triggerHazard('MAGMA_FLOW', heat / 100);
        }

        // 3. Deep drilling (>30000m) random magma
        if (depth > 30000 && Math.random() < 0.002) {
            tunnelAtmosphere.triggerHazard('MAGMA_FLOW', 0.3);
        }

        // 4. Boss attack triggers screen shake
        if (combatResult.update.currentBoss && state.currentBoss) {
            // Check if boss just attacked (bossAttackTick reset)
            if (combatResult.update.bossAttackTick === 0 && state.bossAttackTick > 0) {
                const bossIntensity = combatResult.update.currentBoss.damage / 50;
                tunnelAtmosphere.triggerHazard('CAVE_IN', Math.min(1, bossIntensity));
            }
        }

        // 5. Tectonic event triggers cave-in
        const tectonicEvent = eventsResult.update.eventQueue.find(e => e.id === 'TECTONIC_SHIFT');
        if (tectonicEvent) {
            tunnelAtmosphere.triggerHazard('CAVE_IN', 0.8);
        }

        // === ЗВУК И НАРРАТИВ ===
        const narrativeContext = {
            depth,
            heat,
            integrity,
            biome: "Unknown",
            eventActive: eventsResult.update.eventQueue.length > 0,
            afkTime: (Date.now() - state.lastInteractTime) / 1000
        };
        const aiState = narrativeManager.getAIState(narrativeContext);
        const currentBiome = state.selectedBiome
            ? BIOMES.find(b => (typeof b.name === 'string' ? b.name : b.name.EN) === state.selectedBiome) || BIOMES[0]
            : BIOMES.slice().reverse().find(b => depth >= b.depth) || BIOMES[0];

        // audioEngine.update moved to GameStore

        // NARRATIVE TICK (Time based)
        const NARRATIVE_INTERVAL = 10.0; // Seconds
        let narrativeTick = (state.narrativeTick || 0) + dt;

        if (narrativeTick >= NARRATIVE_INTERVAL) {
            narrativeTick = 0;
            const log = narrativeManager.generateLog(narrativeContext);
            if (log) {
                visualEvents.push({ type: 'LOG', msg: log.msg, color: log.color });
            }
        }

        // === ABILITY SYSTEM UPDATE ===
        // Update cooldowns and durations
        abilitySystem.update(dt);
        // AbilitySystem.update takes dt. 
        // Let's check AbilitySystem.ts:
        // update(dt: number): void { ... state.cooldownRemaining -= dt * 1000; ... }
        // So it expects dt in SECONDS.
        // Wait, "state.cooldownRemaining -= dt * 1000" implies dt is seconds and we convert to ms.
        // So passing dt (seconds) is correct.

        const activeAbilities = abilitySystem.getAllStates();


        // === ОБЪЕДИНЕНИЕ ИНВЕНТАРЯ ===
        let newInventory = state.inventory;
        if (Object.keys(inventoryUpdates).length > 0) {
            newInventory = { ...state.inventory, ...inventoryUpdates };
        }

        // === ПРИМЕНЕНИЕ РЕСУРСОВ ===
        const newResources = applyResourceChanges(state.resources, resourceChanges);

        // === ФИНАЛЬНОЕ СОСТОЯНИЕ ===
        return {
            partialState: {
                // ... (existing)
                activeAbilities, // Add this
                playerBases, // Updated bases from Raids

                // Chronos
                gameTime: newGameTime,
                chronos,

                // Тепло
                heat,
                isOverheated: heatResult.update.isOverheated,
                isCoolingGameActive: heatResult.update.isCoolingGameActive,
                heatStabilityTimer: heatResult.update.heatStabilityTimer,

                // Щит
                shieldCharge: shieldResult.shieldCharge,
                isShielding: shieldResult.isShielding,

                // Бурение
                depth, // Updated from event or drill
                isDrilling: (drillResult.update.isDrilling !== undefined ? drillResult.update.isDrilling : heatResult.update.isDrilling),
                forgeUnlocked: drillResult.update.forgeUnlocked,
                cityUnlocked: drillResult.update.cityUnlocked,
                skillsUnlocked: drillResult.update.skillsUnlocked,
                storageLevel: drillResult.update.storageLevel as 0 | 1 | 2,

                // Side Tunnel Progress (Phase 3.2)
                ...(drillResult.update.sideTunnel !== undefined ? { sideTunnel: drillResult.update.sideTunnel } : {}),

                // Ресурсы и HP
                resources: newResources,
                currentCargoWeight: calculateTotalMass(state.drill, newResources, state.equipmentInventory).payload,
                integrity,
                xp: (combatResult.update.xp ?? state.xp), // Combat XP updates

                // === БОЙ И СУЩНОСТИ (КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ) ===
                currentBoss: combatResult.update.currentBoss,
                combatMinigame: combatResult.update.combatMinigame,
                bossAttackTick: combatResult.update.bossAttackTick,
                lastBossDepth: combatResult.update.lastBossDepth,
                minigameCooldown: combatResult.update.minigameCooldown,
                flyingObjects: entityResult.update.flyingObjects,

                // События
                eventQueue: eventsResult.update.eventQueue,
                eventCheckTick: eventsResult.update.eventCheckTick,
                recentEventIds: eventsResult.update.recentEventIds,
                eventCooldowns: eventsResult.update.eventCooldowns,
                eventLastTriggerDay: eventsResult.update.eventLastTriggerDay,

                // Эффекты и анализатор
                activeEffects,
                analyzer: analyzerResult.update.analyzer,
                inventory: newInventory,

                // Нарратив
                narrativeTick,
                aiState,

                // Codex: добавляем побежденного босса
                ...(combatResult.defeatedBossCodexId && !state.defeatedBosses.includes(combatResult.defeatedBossCodexId)
                    ? { defeatedBosses: [...state.defeatedBosses, combatResult.defeatedBossCodexId] }
                    : {}),

                // Let's add activeExpeditions if changed
                ...(isSlowTick ? { activeExpeditions } : {}),

                // Перемещение
                ...travelResult.update,

                // PERFORMANCE: Pre-calculated stats
                stats: stats,

                // Экономика
                ...economyUpdates
            },
            events: visualEvents,
            commands
        };
    }
}

export const gameEngine = new GameEngine();
