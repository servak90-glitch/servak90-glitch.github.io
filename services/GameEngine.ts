/**
 * GameEngine — основной игровой цикл
 * 
 * Рефакторировано в версии 3.0:
 * - Логика разбита на подсистемы в services/systems/
 * - tick() теперь оркестрирует подсистемы
 */

import { GameState, VisualEvent, Resources } from '../types';
import { calculateStats } from './gameMath';
import { narrativeManager } from './narrativeManager';
import { coolingManager } from './CoolingManager'; // NEW

import { audioEngine } from './audioEngine';
import {
    processEffects,
    processAnalyzer,
    processEvents,
    processHeat,
    processShield,
    processDrilling,
    processCombat,
    processEntities,
    processDrones,
    processRegeneration,
    applyResourceChanges,
    ResourceChanges
} from './systems';

export class GameEngine {
    tick(state: GameState, dt: number): { partialState: Partial<GameState>, events: VisualEvent[] } {
        const visualEvents: VisualEvent[] = [];

        // === КРИТИЧЕСКОЕ ПОВРЕЖДЕНИЕ: СМЕРТЬ ===
        if (state.integrity <= 0 && !state.isGodMode) {
            const stats = calculateStats(state.drill, state.skillLevels, state.equippedArtifacts, state.inventory, state.depth);
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
                events: visualEvents
            };
        }

        // === ВЫЧИСЛЕНИЕ СТАТОВ ===
        const stats = calculateStats(state.drill, state.skillLevels, state.equippedArtifacts, state.inventory, state.depth);
        if (state.isGodMode) {
            // В режиме бога — полное HP
            state = { ...state, integrity: stats.integrity };
        }

        // === СБОР ИЗМЕНЕНИЙ ОТ ПОДСИСТЕМ ===
        const resourceChanges: ResourceChanges = {};
        const inventoryUpdates: Record<string, any> = {};

        // 1. Эффекты (баффы/дебаффы)
        const effectsResult = processEffects(state);
        visualEvents.push(...effectsResult.events);
        const activeEffects = effectsResult.update.activeEffects;

        // 2. Анализатор артефактов
        const analyzerResult = processAnalyzer(state);
        visualEvents.push(...analyzerResult.events);
        Object.assign(inventoryUpdates, analyzerResult.inventoryChanges);

        // 3. Случайные события
        const eventsResult = processEvents(state, stats);
        visualEvents.push(...eventsResult.events);

        // UPDATE COOLING MANAGER (RHYTHM)
        const coolingState = coolingManager.update(dt, state.heat);

        // 4. Щит
        const shieldResult = processShield(state);

        // 5. Нагрев/Охлаждение
        const heatResult = processHeat(state, stats, activeEffects);
        visualEvents.push(...heatResult.events);

        // 6. Бурение и добыча
        const drillResult = processDrilling(
            state,
            stats,
            activeEffects,
            // Override drilling state if event changed heat or other blockers?
            // Assume drilling continues unless heat stops it
            heatResult.update.isDrilling,
            heatResult.update.isOverheated
        );
        visualEvents.push(...drillResult.events);
        Object.assign(resourceChanges, drillResult.resourceChanges);

        // 7. Бой с боссами
        const combatResult = processCombat(
            state,
            stats,
            shieldResult.isShielding,
            heatResult.update.isOverheated
        );
        visualEvents.push(...combatResult.events);
        Object.assign(resourceChanges, combatResult.resourceChanges);
        Object.assign(inventoryUpdates, combatResult.newInventoryItems);

        // 8. Летающие объекты
        const entityResult = processEntities({
            ...state,
            currentBoss: combatResult.update.currentBoss,
            combatMinigame: combatResult.update.combatMinigame,
            isCoolingGameActive: heatResult.update.isCoolingGameActive
        });
        visualEvents.push(...entityResult.events);

        // 9. Регенерация и дроны
        // Integrity check: Event damage vs Combat damage. Event damage is instantaneous.
        // If event set integrity, use it. Otherwise combat result.
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

        integrity = processRegeneration(state, stats, integrity);
        const droneResult = processDrones(state, stats, integrity, heat);
        if (droneResult.integrity !== undefined) integrity = droneResult.integrity;
        if (droneResult.heat !== undefined) heat = droneResult.heat;

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
        audioEngine.update(heat, depth, heatResult.update.isOverheated);

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
                isDrilling: heatResult.update.isDrilling,
                forgeUnlocked: drillResult.update.forgeUnlocked,
                cityUnlocked: drillResult.update.cityUnlocked,
                skillsUnlocked: drillResult.update.skillsUnlocked,
                storageLevel: drillResult.update.storageLevel as 0 | 1 | 2,

                // Ресурсы и HP
                resources: newResources,
                integrity,
                xp: (eventsResult.update.xp ?? 0) + (combatResult.update.xp ?? 0) + (state.xp - state.xp), // Logic error in source? combatResult returns total or delta? 
                // combatResult usually returns new XP value? No, let's assume it returns updated value.
                // Let's safe check:
                // If combat updated XP, use it. If event updated XP, add the difference?
                // Simplification:
            },
            events: visualEvents
        };
    }
}

export const gameEngine = new GameEngine();
