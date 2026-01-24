/**
 * CitySlice — действия связанные с городом
 */

import { SliceCreator, pushLog } from './types';
import { Resources, ResourceType, VisualEvent } from '../../types';
import { calculateStats, getResourceLabel, calculateRepairCost, recalculateCargoWeight } from '../../services/gameMath';
import { audioEngine } from '../../services/audioEngine';
import { createEffect } from '../../services/eventRegistry';
import { canCraftRecipe, getRecipeById } from '../../constants/fuelRecipes';
import { ARTIFACTS } from '../../services/artifactRegistry';
import { ArtifactRarity } from '../../types';

export interface CityActions {
    tradeCity: (cost: Partial<Resources>, reward: Partial<Resources>) => void;
    healCity: () => void;
    repairHull: () => void;
    buyCityBuff: (cost: number, res: ResourceType, effectId: string) => void;
    gambleResources: (gameType: 'DICE' | 'ROULETTE' | 'SHELLS' | 'SLOTS', res: ResourceType, amount: number) => { won: boolean, bonusMsg?: string, rewardAmt?: number, rewardRes?: ResourceType };
    gambleVIP: (type: 'XP' | 'ARTIFACT') => { won: boolean; msg: string; rewardAmt?: number; rewardRes?: ResourceType; rewardArtifactId?: string };
    craftFuel: (recipeId: string) => void;
}

export const createCitySlice: SliceCreator<CityActions> = (set, get) => ({
    tradeCity: (cost, reward) => {
        const s = get();
        const canAfford = Object.entries(cost).every(([k, v]) => s.resources[k as ResourceType] >= (v as number));
        if (canAfford) {
            const newRes = { ...s.resources };
            Object.entries(cost).forEach(([k, v]) => newRes[k as ResourceType] -= (v as number));
            Object.entries(reward).forEach(([k, v]) => {
                if (k === 'XP') set({ xp: s.xp + (v as number) });
                else newRes[k as ResourceType] += (v as number);
            });
            set({
                resources: newRes,
                currentCargoWeight: recalculateCargoWeight(newRes)
            });
            audioEngine.playClick();
        }
    },

    healCity: () => {
        const s = get();

        // Проверка кулдауна для бесплатного охлаждения (глубина < 1000м)
        const isPaidCooling = s.depth >= 1000;  // CITY_SERVICE.PAID_COOLING_DEPTH

        if (!isPaidCooling) {
            const now = Date.now();
            const timeSinceLastUse = now - (s.freeCoolingLastUsed || 0);
            const cooldownRemaining = 150000 - timeSinceLastUse;  // CITY_SERVICE.FREE_COOLING_COOLDOWN_MS

            if (cooldownRemaining > 0) {
                // На кулдауне - показать ошибку
                const secondsRemaining = Math.ceil(cooldownRemaining / 1000);
                const minutes = Math.floor(secondsRemaining / 60);
                const seconds = secondsRemaining % 60;
                const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

                const errorEvent: VisualEvent = {
                    type: 'LOG',
                    msg: `⏱️ ОХЛАЖДЕНИЕ НА КУЛДАУНЕ: ${timeStr}`,
                    color: 'text-yellow-500'
                };
                set({ actionLogQueue: pushLog(s, errorEvent) });
                audioEngine.playUIError();
                return;
            }

            // Обновить timestamp последнего использования
            set({ heat: 0, freeCoolingLastUsed: now });
        } else {
            // Платное охлаждение - просто сбросить heat
            set({ heat: 0 });
        }

        audioEngine.playLog();
    },

    repairHull: () => {
        const s = get();
        const stats = calculateStats(s.drill, s.skillLevels, s.equippedArtifacts, s.inventory, s.depth);
        const { resource, cost } = calculateRepairCost(s.depth, s.integrity, stats.integrity);

        if (cost <= 0) return;

        if (s.resources[resource] >= cost) {
            const newRes = { ...s.resources, [resource]: s.resources[resource] - cost };
            set({
                integrity: stats.integrity,
                resources: newRes,
                currentCargoWeight: recalculateCargoWeight(newRes)
            });
            audioEngine.playLog();
        } else {
            const errorEvent: VisualEvent = {
                type: 'LOG',
                msg: `НЕДОСТАТОЧНО РЕСУРСОВ: ${getResourceLabel(resource)}`,
                color: 'text-red-500'
            };
            set({ actionLogQueue: pushLog(s, errorEvent) });
        }
    },

    buyCityBuff: (cost, res, effectId) => {
        const s = get();
        if (s.resources[res] >= cost) {
            const newRes = { ...s.resources, [res]: s.resources[res] - cost };
            const effect = createEffect(effectId);
            if (effect) {
                const event: VisualEvent = {
                    type: 'LOG',
                    msg: `ЭФФЕКТ: ${effect.name}`,
                    color: 'text-cyan-400'
                };
                set({
                    resources: newRes,
                    currentCargoWeight: recalculateCargoWeight(newRes),
                    activeEffects: [...s.activeEffects, effect],
                    actionLogQueue: pushLog(s, event)
                });
            }
        }
    },

    gambleResources: (gameType, res, amount) => {
        const s = get();
        if (s.resources[res] < amount) return { won: false };

        let winChance = 0.45;
        let payoutMult = 1.0; // Добавочный множитель (выигрыш = ставка + ставка * payoutMult)
        let bonusMsg = "";
        let rewardRes: ResourceType = res;
        let creditsReward = 0;

        const roll = Math.random();

        switch (gameType) {
            case 'DICE':
                winChance = 0.45;
                payoutMult = 1.0;
                break;
            case 'ROULETTE': // Сейсмическая рулетка (Ставка: Камень)
                winChance = 0.05; // 5% общий шанс
                if (roll < 0.005) { // Джекпот 0.5%
                    creditsReward = 250;
                    bonusMsg = "JACKPOT! 250 CREDITS FOUND!";
                } else if (roll < 0.02) {
                    creditsReward = 50;
                    bonusMsg = "Converted to 50 Credits!";
                } else if (roll < 0.05) {
                    payoutMult = 4.0;
                    bonusMsg = "Epic success! x5 Stone!";
                }
                break;
            case 'SHELLS': // Напёрстки с топливом (Ставка: Глина)
                winChance = 0.05;
                if (roll < 0.05) {
                    rewardRes = ResourceType.GAS;
                    amount = 10; // Фиксированный выигрыш газа
                    payoutMult = 0; // Не добавляем к ставке
                    bonusMsg = "GAS CANISTER FOUND!";
                }
                amount = 500; // Фиксированная ставка для shells если пришла глина
                break;
            case 'SLOTS': // Автомат (Ставка: Железо)
                winChance = 0.05;
                if (roll < 0.05) {
                    creditsReward = 20;
                    bonusMsg = "SLOT MACHINE PAYOUT: 20 CREDITS";
                }
                break;
        }

        const won = roll < winChance;
        const newRes = { ...s.resources };

        if (won) {
            let finalRewardAmt = Math.floor(amount * payoutMult);
            let finalRewardRes = rewardRes;

            if (creditsReward > 0) {
                newRes.credits += creditsReward;
                finalRewardAmt = creditsReward;
                finalRewardRes = ResourceType.CREDITS;
            } else if (gameType === 'SHELLS') {
                newRes[rewardRes] += amount;
                finalRewardAmt = amount;
                finalRewardRes = ResourceType.GAS;
            } else {
                newRes[res] += finalRewardAmt;
            }

            const msg = bonusMsg || `ВЫИГРЫШ! +${finalRewardAmt} ${getResourceLabel(finalRewardRes).RU}`;
            set({ resources: newRes, currentCargoWeight: recalculateCargoWeight(newRes), actionLogQueue: pushLog(s, { type: 'LOG', msg, color: 'text-green-500' }) });
            audioEngine.playAchievement();
            return { won: true, bonusMsg, rewardAmt: finalRewardAmt, rewardRes: finalRewardRes };
        } else {
            // Проигрыш - только списываем ставку если еще не списали (через вычитание)
            // Но мы читаем текущий, так что надо просто вычесть
            newRes[res] -= (gameType === 'SHELLS' && res === ResourceType.CLAY) ? 500 : amount;
            set({ resources: newRes, currentCargoWeight: recalculateCargoWeight(newRes), actionLogQueue: pushLog(s, { type: 'LOG', msg: `ПРОИГРЫШ... -${amount} ${getResourceLabel(res).RU}`, color: 'text-red-500' }) });
            return { won: false, rewardAmt: amount, rewardRes: res };
        }
    },

    gambleVIP: (type) => {
        const s = get();
        const cost = type === 'XP' ? 750 : 2500;

        if (s.resources.credits < cost) return { won: false, msg: 'НЕДОСТАТОЧНО КРЕДИТОВ' };

        let result: { won: boolean; msg: string; rewardAmt?: number; rewardRes?: ResourceType; rewardArtifactId?: string } = {
            won: false,
            msg: 'ПОЛНЫЙ КРАХ'
        };

        const roll = Math.random();
        const newRes = { ...s.resources, credits: s.resources.credits - cost };

        if (type === 'XP') {
            if (roll < 0.65) {
                set({ resources: newRes, actionLogQueue: pushLog(s, { type: 'LOG', msg: `VIP LOSS: -${cost} Credits`, color: 'text-red-600' }) });
            } else if (roll < 0.90) {
                result = { won: true, rewardAmt: 100, msg: 'ЧАСТИЧНЫЙ УСПЕХ', rewardRes: 'XP' as any };
            } else if (roll < 0.99) {
                result = { won: true, rewardAmt: 750, msg: 'КРУПНЫЙ ВЫИГРЫШ', rewardRes: 'XP' as any };
            } else {
                result = { won: true, rewardAmt: 3000, msg: 'JACKPOT: КОРПОРАТИВНЫЙ ОПЫТ', rewardRes: 'XP' as any };
            }
        } else {
            let targetRarity: ArtifactRarity = ArtifactRarity.COMMON;
            if (roll < 0.88) targetRarity = ArtifactRarity.COMMON;
            else if (roll < 0.98) targetRarity = ArtifactRarity.RARE;
            else if (roll < 0.998) targetRarity = ArtifactRarity.EPIC;
            else targetRarity = ArtifactRarity.LEGENDARY;

            const pool = ARTIFACTS.filter(a => a.rarity === targetRarity);
            const def = pool[Math.floor(Math.random() * pool.length)];

            const artifactName = typeof def.name === 'string' ? def.name : (def.name as any).RU;
            result = { won: true, msg: `НАЙДЕНО: ${artifactName.toUpperCase()}`, rewardArtifactId: def.id };
        }

        if (result.won) {
            audioEngine.playAchievement();
            if (result.rewardRes === 'XP' as any) {
                set({
                    xp: s.xp + result.rewardAmt!,
                    resources: newRes,
                    actionLogQueue: pushLog(s, { type: 'LOG', msg: `VIP WIN: +${result.rewardAmt} XP`, color: 'text-yellow-400' })
                });
            } else if (result.rewardArtifactId) {
                const newId = Math.random().toString(36).substr(2, 9);
                const newItem = {
                    instanceId: newId,
                    defId: result.rewardArtifactId,
                    acquiredAt: Date.now(),
                    isIdentified: true,
                    isEquipped: false
                };
                set({
                    resources: newRes,
                    inventory: { ...s.inventory, [newId]: newItem as any },
                    actionLogQueue: pushLog(s, { type: 'LOG', msg: `VIP REWARD: ${result.msg}`, color: 'text-purple-400' })
                });
            }
        } else {
            audioEngine.playUIError();
            set({ resources: newRes });
        }

        return result;
    },

    // === FUEL CRAFTING ===
    craftFuel: (recipeId) => {
        const s = get();
        const recipe = getRecipeById(recipeId);

        if (!recipe) return;

        // Проверка ресурсов
        if (!canCraftRecipe(recipe, s.resources)) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: `НЕДОСТАТОЧНО ${getResourceLabel(recipe.input.resource).toUpperCase()}!`,
                color: 'text-red-500'
            };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        // Крафт
        const newRes = { ...s.resources };
        newRes[recipe.input.resource] -= recipe.input.amount;
        newRes[recipe.output.resource] += recipe.output.amount;

        const successEvent: VisualEvent = {
            type: 'LOG',
            msg: `⚗️ ${recipe.name}: +${recipe.output.amount} ${getResourceLabel(recipe.output.resource).toUpperCase()}`,
            color: 'text-cyan-400'
        };

        set({
            resources: newRes,
            currentCargoWeight: recalculateCargoWeight(newRes),
            actionLogQueue: pushLog(s, successEvent)
        });

        audioEngine.playClick();
    }
});
