/**
 * CombatSystem — управление боссами и боем
 * 
 * Отвечает за:
 * - Атаки боссов
 * - Уворот (evasion)
 * - Блок щитом
 * - Спавн мини-игр
 * - Смерть боссов и награды
 */

import { GameState, VisualEvent, Stats, ResourceType, InventoryItem, Boss, CombatMinigame } from '../../types';
import { ARTIFACTS } from '../artifactRegistry';
import { generateBoss } from '../bossRegistry';
import { audioEngine } from '../audioEngine';
import { ResourceChanges } from './types';

export interface CombatUpdate {
    currentBoss: Boss | null;
    combatMinigame: CombatMinigame | null;
    bossAttackTick: number;
    lastBossDepth: number;
    integrity?: number;
    xp?: number;
}

export interface CombatResult {
    update: CombatUpdate;
    resourceChanges: ResourceChanges;
    newInventoryItems: Record<string, InventoryItem>;
    events: VisualEvent[];
}

/**
 * Обработка боссов и боя
 */
export function processCombat(
    state: GameState,
    stats: Stats,
    isShielding: boolean,
    isOverheated: boolean
): CombatResult {
    const events: VisualEvent[] = [];
    const resourceChanges: ResourceChanges = {};
    const newInventoryItems: Record<string, InventoryItem> = {};

    let currentBoss = state.currentBoss;
    let combatMinigame = state.combatMinigame;
    let bossAttackTick = state.bossAttackTick;
    let lastBossDepth = state.lastBossDepth;
    let integrity = state.integrity;
    let xp = state.xp;

    if (currentBoss) {
        bossAttackTick++;

        // Атака босса
        if (bossAttackTick >= currentBoss.attackSpeed && !state.isBroken && !combatMinigame) {
            bossAttackTick = 0;

            // Уворот
            let effectiveEvasion = stats.evasion;
            if (isOverheated) effectiveEvasion *= 0.5;

            if (Math.random() * 100 < effectiveEvasion) {
                // Успешный уворот
                events.push({
                    type: 'TEXT',
                    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
                    y: typeof window !== 'undefined' ? window.innerHeight / 2 - 100 : 250,
                    text: 'MISS',
                    style: 'EVADE'
                });
            } else {
                // Получение урона
                let dmg = Math.max(1, currentBoss.damage * (1 - stats.defense / 100));

                if (isShielding) {
                    dmg = Math.ceil(dmg * 0.2); // 80% снижение
                    events.push({
                        type: 'TEXT',
                        x: typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
                        y: typeof window !== 'undefined' ? window.innerHeight / 2 - 100 : 250,
                        text: 'BLOCKED',
                        style: 'HEAL'
                    });
                } else {
                    if (dmg > 5) events.push({ type: 'BOSS_HIT' });
                }

                if (!state.isGodMode) integrity -= dmg;
            }
        }

        // Спавн мини-игры взлома
        if (!combatMinigame && !currentBoss.isInvulnerable) {
            if (Math.random() < 0.01) {
                combatMinigame = {
                    active: true,
                    type: currentBoss.minigameWeakness,
                    difficulty: Math.floor(state.level / 5) + 1
                };
                currentBoss = { ...currentBoss, isInvulnerable: true };
                events.push({ type: 'LOG', msg: ">>> ВЗЛОМ СИСТЕМ ЗАЩИТЫ...", color: "text-cyan-400 font-bold" });
                audioEngine.playGlitch();
            }
        }

        // Смерть босса
        if (currentBoss.currentHp <= 0) {
            events.push({
                type: 'LOG',
                msg: `${currentBoss.isMob ? 'ВРАГ' : 'БОСС'} УНИЧТОЖЕН`,
                color: "text-green-500 font-black"
            });
            xp += currentBoss.reward.xp;

            // Награда ресурсами
            for (const [k, v] of Object.entries(currentBoss.reward.resources)) {
                resourceChanges[k as ResourceType] = (resourceChanges[k as ResourceType] || 0) + v;
            }

            // Гарантированный артефакт
            if (currentBoss.reward.guaranteedArtifactRarity) {
                const pool = ARTIFACTS.filter(a => a.rarity === currentBoss!.reward.guaranteedArtifactRarity);
                if (pool.length) {
                    const def = pool[Math.floor(Math.random() * pool.length)];
                    const newInstanceId = Math.random().toString(36).substr(2, 9);
                    const newItem: InventoryItem = {
                        instanceId: newInstanceId,
                        defId: def.id,
                        acquiredAt: Date.now(),
                        isIdentified: false,
                        isEquipped: false
                    };
                    newInventoryItems[newInstanceId] = newItem;
                    events.push({
                        type: 'LOG',
                        msg: `>> ОБНАРУЖЕН АРТЕФАКТ: ???`,
                        color: "text-purple-400 font-bold animate-pulse"
                    });
                }
            }

            lastBossDepth = currentBoss.isMob ? lastBossDepth : Math.floor(state.depth);
            currentBoss = null;
            combatMinigame = null;
        }
    } else if (state.depth > 200 && (state.depth - lastBossDepth) >= 500 && Math.random() < 0.005) {
        // Спавн нового босса
        currentBoss = generateBoss(state.depth, "Unknown");
        events.push({
            type: 'LOG',
            msg: `!!! ВНИМАНИЕ: ${currentBoss.description} !!!`,
            color: "text-red-500 font-bold"
        });
    }

    return {
        update: {
            currentBoss,
            combatMinigame,
            bossAttackTick,
            lastBossDepth,
            integrity: integrity !== state.integrity ? integrity : undefined,
            xp: xp !== state.xp ? xp : undefined
        },
        resourceChanges,
        newInventoryItems,
        events
    };
}
