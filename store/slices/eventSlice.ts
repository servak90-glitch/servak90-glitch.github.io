import { SliceCreator } from './types';
import { calculateStats } from '../../services/gameMath';
import { audioEngine } from '../../services/audioEngine';
import { rollArtifact } from '../../services/artifactRegistry';
import { createEffect, EVENTS } from '../../services/eventRegistry';
import { InventoryItem, VisualEvent, GameState, GameEvent, EventTrigger, EventActionId } from '../../types';
import { calculateRaidOutcome } from '../../services/raidService';
import { sideTunnelSystem } from '../../services/systems/SideTunnelSystem';

export interface EventActions {
    handleEventOption: (optionId?: string | EventActionId) => void;
    completeCombatMinigame: (success: boolean) => void;
    setCoolingGame: (active: boolean) => void;
    forceVentHeat: (amount: number) => void;
    triggerOverheat: () => void;
    pushEvent: (event: GameEvent) => void;
    rollEventByTrigger: (trigger: EventTrigger) => GameEvent | null;
}

import { getActivePerkIds } from '../../services/factionLogic';

export const createEventSlice: SliceCreator<EventActions> = (set, get) => ({
    handleEventOption: (optionId) => {
        const s = get();
        const event = s.eventQueue[0];
        if (!event) return;

        const newQueue = s.eventQueue.slice(1);
        const updates: Partial<GameState> = { eventQueue: newQueue };
        const logs: VisualEvent[] = [];
        const activePerks = getActivePerkIds(s.reputation);

        const grantArtifact = () => {
            const def = rollArtifact(s.depth, calculateStats(s.drill, s.skillLevels, s.equippedArtifacts, s.inventory, s.depth).luck, s.selectedBiome || undefined);
            const id = Math.random().toString(36).substr(2, 9);
            const newItem: InventoryItem = { instanceId: id, defId: def.id, acquiredAt: Date.now(), isIdentified: false, isEquipped: false };
            const newInv = { ...s.inventory, [id]: newItem };
            updates.inventory = newInv;
            if (s.storageLevel === 0) updates.storageLevel = 1;
            logs.push({ type: 'LOG', msg: 'ПОЛУЧЕН АРТЕФАКТ: ???', color: 'text-purple-400 font-bold' });
            logs.push({ type: 'SOUND', sfx: 'ACHIEVEMENT' });
        };

        if (optionId) {
            audioEngine.playClick();
            switch (optionId) {
                case EventActionId.TECTONIC_HOLD:
                    updates.integrity = Math.max(0, s.integrity - 30);
                    logs.push({ type: 'TEXT', x: window.innerWidth / 2, y: window.innerHeight / 2, text: '-30 HP', style: 'DAMAGE' });
                    logs.push({ type: 'LOG', msg: '>> УДЕРЖАНИЕ: ПОВРЕЖДЕНИЕ ОБШИВКИ', color: 'text-red-500' });
                    break;
                case EventActionId.TECTONIC_PUSH:
                    updates.depth = s.depth + 1500;
                    updates.heat = Math.min(100, s.heat + 40);
                    logs.push({ type: 'LOG', msg: '>> ФОРСАЖ: ГЛУБИНА +1500м', color: 'text-orange-400' });
                    break;
                case EventActionId.POD_LASER:
                    if (Math.random() > 0.5) {
                        logs.push({ type: 'LOG', msg: '>> ЛАЗЕР УНИЧТОЖИЛ СОДЕРЖИМОЕ', color: 'text-red-400' });
                    } else {
                        const r = { ...s.resources };
                        r.ancientTech += 20;
                        updates.resources = r;
                        logs.push({ type: 'LOG', msg: '>> ВСКРЫТИЕ: +20 ANCIENT TECH', color: 'text-green-400' });
                    }
                    break;
                case EventActionId.POD_HACK: {
                    const rh = { ...s.resources };
                    rh.ancientTech += 5;
                    updates.resources = rh;
                    logs.push({ type: 'LOG', msg: '>> ДЕШИФРОВКА: +5 ANCIENT TECH', color: 'text-green-400' });
                    break;
                }
                case EventActionId.ACCEPT_FLUCTUATION: {
                    const eff = createEffect('QUANTUM_FLUCTUATION_EFFECT', 1) as any;
                    if (eff) updates.activeEffects = [...s.activeEffects, { ...eff, id: eff.id + '_' + Date.now() }];
                    updates.heat = 90;
                    logs.push({ type: 'LOG', msg: '>> РИСК ПРИНЯТ: РЕСУРСЫ x5', color: 'text-purple-400' });
                    break;
                }
                case EventActionId.REJECT_FLUCTUATION:
                    logs.push({ type: 'LOG', msg: '>> СТАБИЛИЗАЦИЯ ВЫПОЛНЕНА', color: 'text-zinc-400' });
                    break;
                case EventActionId.AI_TRUST:
                    updates.depth = s.depth + 3000;
                    updates.heat = Math.min(100, s.heat + 20);
                    logs.push({ type: 'LOG', msg: '>> МАРШРУТ ИИ: +3000м', color: 'text-cyan-400' });
                    break;
                case EventActionId.AI_REBOOT:
                    updates.heat = 0;
                    logs.push({ type: 'LOG', msg: '>> ПЕРЕЗАГРУЗКА: ОХЛАЖДЕНИЕ', color: 'text-blue-400' });
                    break;
                case EventActionId.PURGE_NANOMITES: {
                    const rn = { ...s.resources };
                    rn.nanoSwarm += 50;
                    updates.resources = rn;
                    logs.push({ type: 'LOG', msg: '>> ОЧИСТКА: +50 NANO SWARM', color: 'text-green-400' });
                    break;
                }
                case EventActionId.CRYSTAL_ABSORB: {
                    const rc = { ...s.resources };
                    rc.diamonds += 2;
                    updates.resources = rc;
                    updates.heat = Math.min(100, s.heat + 50);
                    logs.push({ type: 'LOG', msg: '>> ПОГЛОЩЕНИЕ: +2 АЛМАЗА', color: 'text-cyan-400' });
                    break;
                }
                // SIDE TUNNEL ACTIONS (Phase 3.2)
                case EventActionId.TUNNEL_SAFE:
                case EventActionId.TUNNEL_RISKY:
                case EventActionId.TUNNEL_CRYSTAL:
                case EventActionId.TUNNEL_MINE:
                case EventActionId.TUNNEL_NEST: {
                    const result = sideTunnelSystem.resolveTunnel(optionId, s, activePerks);
                    updates.resources = result.updates.resources;
                    if (result.updates.inventory) updates.inventory = result.updates.inventory;
                    if (result.updates.integrity !== undefined) updates.integrity = result.updates.integrity;
                    if (result.updates.storageLevel) updates.storageLevel = result.updates.storageLevel;

                    logs.push(...result.logs);
                    break;
                }
                case EventActionId.BASE_DEFEND: {
                    const base = s.playerBases.find(b => b.status === 'active' || b.status === 'under_attack');
                    if (!base) break;

                    // Fallback для старых баз без defense
                    const baseDefense = base.defense ?? {
                        integrity: 100,
                        shields: 0,
                        infantry: 0,
                        drones: 0,
                        turrets: 0
                    };

                    // Расчет силы атаки (зависит от региона или глубины, тут упростим)
                    const attackPower = 20 + Math.random() * 50;
                    const result = calculateRaidOutcome(base, attackPower);

                    // Обновление базы
                    const updatedBases = s.playerBases.map(b => b.id === base.id ? {
                        ...b,
                        defense: {
                            integrity: Math.max(0, baseDefense.integrity - result.damageDealt),
                            infantry: Math.max(0, baseDefense.infantry - result.unitsLost.infantry),
                            drones: Math.max(0, baseDefense.drones - result.unitsLost.drones),
                            turrets: Math.max(0, baseDefense.turrets - result.unitsLost.turrets),
                            shields: 0 // Щиты садятся после боя
                        },
                        storedResources: Object.keys(b.storedResources).reduce((acc: any, res) => {
                            acc[res] = Math.max(0, (b.storedResources[res as keyof typeof b.storedResources] || 0) - (result.resourceLoss[res as keyof typeof result.resourceLoss] || 0));
                            return acc;
                        }, {}),
                        status: baseDefense.integrity - result.damageDealt <= 0 ? 'damaged' as const : 'active' as const
                    } : b);

                    updates.playerBases = updatedBases;
                    logs.push({ type: 'LOG', msg: result.report.RU, color: result.success ? 'text-green-400' : 'text-red-500 font-bold' });
                    if (!result.success) {
                        logs.push({ type: 'LOG', msg: `💥 Потеряно юнитов и ресурсов во время прорыва!`, color: 'text-red-400' });
                    }
                    audioEngine.playExplosion();
                    break;
                }
                case EventActionId.BASE_SURRENDER: {
                    const base = s.playerBases.find(b => b.status === 'active' || b.status === 'under_attack');
                    if (!base) break;

                    const updatedBases = s.playerBases.map(b => b.id === base.id ? {
                        ...b,
                        storedResources: Object.keys(b.storedResources).reduce((acc: any, res) => {
                            acc[res] = Math.floor((b.storedResources[res as keyof typeof b.storedResources] || 0) * 0.5); // Теряем половину
                            return acc;
                        }, {}),
                        status: 'active' as const
                    } : b);

                    updates.playerBases = updatedBases;
                    logs.push({ type: 'LOG', msg: '🏳️ База сдалась. Половина ресурсов со складов передана грабителям.', color: 'text-yellow-500' });
                    break;
                }
            }
        }
        else {
            if (event.effectId) {
                const effect = createEffect(event.effectId, 1) as any;
                if (effect) {
                    updates.activeEffects = [...s.activeEffects, { ...effect, id: effect.id + '_' + Date.now() }];
                    logs.push({ type: 'LOG', msg: `>> НАЛОЖЕН ЭФФЕКТ: ${effect.name} `, color: 'text-yellow-400' });
                }
            }
            if (event.forceArtifactDrop) {
                grantArtifact();
            }
        }

        set({ ...updates, actionLogQueue: [...s.actionLogQueue, ...logs] });
    },

    completeCombatMinigame: (success) => {
        const s = get();
        set({ combatMinigame: null });

        if (s.currentBoss) {
            if (success) {
                const newBoss = {
                    ...s.currentBoss,
                    currentHp: s.currentBoss.currentHp - (s.currentBoss.maxHp * 0.25),
                    isInvulnerable: false
                };
                set({ currentBoss: newBoss });
                audioEngine.playExplosion();
            } else {
                const newBoss = { ...s.currentBoss, isInvulnerable: false };
                set({
                    integrity: Math.max(0, s.integrity - 20),
                    currentBoss: newBoss
                });
                audioEngine.playAlarm();
            }
        }
    },

    setCoolingGame: (active) => set({ isCoolingGameActive: active }),
    forceVentHeat: (amount) => set(s => ({ heat: Math.max(0, s.heat - amount) })),
    triggerOverheat: () => set(s => {
        const dmg = Math.ceil(s.drill.hull.baseStats.maxIntegrity * 0.2);
        return {
            heat: 100,
            isOverheated: true,
            integrity: Math.max(0, s.integrity - dmg),
            isCoolingGameActive: false
        };
    }),

    pushEvent: (event: GameEvent) => {
        set(s => ({ eventQueue: [...s.eventQueue, event] }));
    },

    rollEventByTrigger: (trigger: EventTrigger) => {
        const s = get();
        const available = EVENTS.filter(e => e.triggers?.includes(trigger));
        if (available.length === 0) return null;

        // Простой weighted random
        const totalWeight = available.reduce((acc, e) => acc + (e.weight || 10), 0);
        let roll = Math.random() * totalWeight;
        for (const e of available) {
            roll -= (e.weight || 10);
            if (roll <= 0) return e;
        }
        return available[0];
    }
});
