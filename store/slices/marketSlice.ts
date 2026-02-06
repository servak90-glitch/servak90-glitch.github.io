/**
 * MARKET SLICE — управление рыночными транзакциями
 * Phase 2: buy/sell в Station базах
 */

import { SliceCreator } from './types';
import type { MarketTransaction, Resources } from '../../types';
import { calculateMarketPrice, calculateSellRevenue } from '../../services/marketEngine';
import { recalculateCargoWeight, calculateStats } from '../../services/gameMath';
import { audioEngine } from '../../services/audioEngine';
import { BLACK_MARKET_ITEMS } from '../../constants/blackMarket';

export interface MarketActions {
    marketTransactionHistory: MarketTransaction[];

    buyFromMarket: (resource: keyof Resources, amount: number) => void;
    sellToMarket: (resource: keyof Resources, amount: number) => void;
    sellSmuggled: (resource: keyof Resources, amount: number) => void; // Механика Лисы
    buyBlackMarketItem: (itemId: string) => void;
}

import { getActivePerkIds } from '../../services/factionLogic';
import { economySystem } from '../../services/systems/EconomySystem';

export const createMarketSlice: SliceCreator<MarketActions> = (set, get) => ({
    marketTransactionHistory: [],

    buyFromMarket: (resource, amount) => {
        const state = get();

        // Рынок доступен через Терминал Хаба (глобальный доступ)

        const activePerks = getActivePerkIds(state.reputation);

        // Расчёт цены
        const stats = calculateStats(state.drill, state.skillLevels, state.equippedArtifacts, state.inventory, state.depth, [], state.operatorId, state.hiredCrewIds);
        const price = calculateMarketPrice(resource, state.currentRegion, [], activePerks);

        // Apply Artifact Discount
        const discountMult = Math.max(0.1, 1 - (stats.artifactMods.shopDiscountPct / 100));
        const totalCost = price.finalPrice * amount * discountMult;

        // Проверки
        if (state.resources.credits < totalCost) {
            audioEngine.playUIError();
            console.warn(`❌ Недостаточно credits (нужно ${totalCost}, есть ${state.resources.credits})`);
            return;
        }

        // Транзакция
        audioEngine.playMarketTrade();
        set((state) => {
            const newResources = {
                ...state.resources,
                credits: state.resources.credits - totalCost,
                [resource]: (state.resources[resource] || 0) + amount,
            };

            return {
                resources: newResources,
                currentCargoWeight: recalculateCargoWeight(newResources),
                marketTransactionHistory: [
                    ...state.marketTransactionHistory,
                    {
                        type: 'buy',
                        resource,
                        amount,
                        pricePerUnit: price.finalPrice,
                        totalCost,
                        regionId: state.currentRegion,
                        timestamp: Date.now(),
                    },
                ],
            };
        });

        console.log(`✅ Куплено ${amount} ${resource} за ${totalCost} credits`);
    },

    sellToMarket: (resource, amount) => {
        const state = get();

        // Проверка блокировки (Облава)
        if (economySystem.isMarketBlocked(state)) {
            audioEngine.playUIError();
            set(s => ({ actionLogQueue: [...s.actionLogQueue, { type: 'LOG', msg: '🚨 РЫНОК ЗАБЛОКИРОВАН ПОСЛЕ ОБЛАВЫ!', color: 'text-red-500 font-bold' }] }));
            return;
        }

        // Проверка наличия ресурсов
        if ((state.resources[resource] || 0) < amount) {
            audioEngine.playUIError();
            console.warn(`❌ Недостаточно ${resource} (нужно ${amount}, есть ${state.resources[resource] || 0})`);
            return;
        }

        const activePerks = getActivePerkIds(state.reputation);
        const category = economySystem.getCategory(resource as any);
        const saturationMult = economySystem.calculateSaturationMult(state, state.currentRegion, category);

        // Расчёт выручки (с учетом насыщения)
        const { sellPrice, totalRevenue } = calculateSellRevenue(resource, amount, state.currentRegion, [], activePerks, saturationMult);

        // Транзакция
        audioEngine.playMarketTrade();
        set((state) => {
            const newResources = {
                ...state.resources,
                credits: state.resources.credits + totalRevenue,
                [resource]: (state.resources[resource] || 0) - amount,
            };

            // Обновление насыщения
            const newSaturation = { ...state.marketSaturation };
            const regionSat = { ...(newSaturation[state.currentRegion] || {}) };
            regionSat[category] = (regionSat[category] || 0) + amount;
            newSaturation[state.currentRegion] = regionSat;

            return {
                resources: newResources,
                currentCargoWeight: recalculateCargoWeight(newResources),
                marketSaturation: newSaturation,
                marketTransactionHistory: [
                    ...state.marketTransactionHistory,
                    {
                        type: 'sell',
                        resource,
                        amount,
                        pricePerUnit: sellPrice,
                        totalCost: totalRevenue,
                        regionId: state.currentRegion,
                        timestamp: Date.now(),
                    },
                ],
            };
        });

        if (saturationMult < 1.0) {
            console.log(`📉 Цена снижена из-за насыщения категории ${category}: x${saturationMult.toFixed(2)}`);
        }
    },

    /**
     * Контрабанда (Механика Лисы)
     * Код готов, но будет активирован позже в UI.
     */
    sellSmuggled: (resource, amount) => {
        const state = get();

        // Проверка блокировки (Облава)
        if (economySystem.isMarketBlocked(state)) {
            audioEngine.playUIError();
            return;
        }

        if ((state.resources[resource] || 0) < amount) {
            audioEngine.playUIError();
            return;
        }

        const activePerks = getActivePerkIds(state.reputation);
        // Лиса покупает по 70% ВСЕГДА (без учета насыщения, но ниже номинала)
        const { totalRevenue } = calculateSellRevenue(resource, amount, state.currentRegion, [], activePerks, 0.875); // 0.8 * 0.875 = 0.7

        const riskGain = economySystem.calculateRaidProgress(totalRevenue);
        const newRaidRisk = state.raidRisk + riskGain;
        const isRaidTriggered = Math.random() < (newRaidRisk / 100);

        audioEngine.playMarketTrade(); // TODO: добавить более "теневой" звук

        set(s => {
            const newRes = { ...s.resources, credits: s.resources.credits + totalRevenue, [resource]: s.resources[resource] - amount };
            const logs = [];

            if (isRaidTriggered) {
                // Облава! Блокируем рынок (30 игровых часов)
                const blockedUntil = s.gameTime + 30 * 3600;
                logs.push({ type: 'LOG', msg: '🚨 ОБЛАВА! РЫНОК ЗАБЛОКИРОВАН НА 30 ЧАСОВ!', color: 'text-red-500 font-bold' });
                logs.push({ type: 'VISUAL_EFFECT', option: 'GLITCH_RED' });
                return {
                    resources: newRes,
                    currentCargoWeight: recalculateCargoWeight(newRes),
                    raidRisk: 0, // Сброс после облавы
                    marketBlockedUntil: blockedUntil,
                    actionLogQueue: [...s.actionLogQueue, ...logs]
                };
            }

            return {
                resources: newRes,
                currentCargoWeight: recalculateCargoWeight(newRes),
                raidRisk: newRaidRisk,
                actionLogQueue: [...s.actionLogQueue, { type: 'LOG', msg: `🦊 СДЕЛКА С ЛИСОЙ: +${totalRevenue} кр. (Риск: ${newRaidRisk.toFixed(1)}%)`, color: 'text-orange-400' }]
            };
        });
    },

    buyBlackMarketItem: (itemId: string) => {
        const state = get();
        const item = BLACK_MARKET_ITEMS.find(i => i.id === itemId);
        if (!item) return;

        // Check stock (if implemented globally, currently static constant so stock doesn't deplete per save)
        // For MVP, allow infinite or check if already bought if blueprint
        if (item.type === 'BLUEPRINT' && item.targetId && state.unlockedBlueprints.includes(item.targetId)) {
            audioEngine.playUIError();
            return;
        }

        // Check costs
        for (const cost of item.cost) {
            if ((state.resources[cost.resource] || 0) < cost.amount) {
                audioEngine.playUIError();
                return; // Not enough resources
            }
        }

        // Deduct resources
        audioEngine.playMarketTrade(); // Or a specific darker sound

        set(state => {
            const newResources = { ...state.resources };
            item.cost.forEach(c => {
                newResources[c.resource] = (newResources[c.resource] || 0) - c.amount;
            });

            const updates: Partial<any> = { resources: newResources };
            const visuals: any[] = [];

            // Apply Reward
            if (item.type === 'BLUEPRINT' && item.targetId) {
                updates.unlockedBlueprints = [...state.unlockedBlueprints, item.targetId];
                visuals.push({ type: 'LOG', msg: `📜 BLUEPRINT UNLOCKED: ${item.name}`, color: 'text-purple-400' });
            } else if (item.type === 'RESOURCE' && item.targetId) {
                // Parse targetId e.g. "nanoSwarm_1000"
                const [res, amtStr] = item.targetId.split('_');
                const amt = parseInt(amtStr);
                if (res && amt) {
                    newResources[res as keyof Resources] = (newResources[res as keyof Resources] || 0) + amt;
                    visuals.push({ type: 'LOG', msg: `📦 SMUGGLED: ${amt} ${res}`, color: 'text-green-400' });
                }
            } else if (item.type === 'GADGET') {
                if (item.targetId === 'consumable_shield_50') {
                    updates.shieldCharge = Math.min(state.maxShieldCharge, state.shieldCharge + 50);
                    visuals.push({ type: 'LOG', msg: `🛡️ SHIELD BOOSTED`, color: 'text-cyan-400' });
                } else if (item.targetId === 'consumable_heat_vent') {
                    updates.heat = 0;
                    visuals.push({ type: 'LOG', msg: `❄️ EMERGENCY VENTING`, color: 'text-cyan-400' });
                }
            }

            visuals.push({ type: 'VISUAL_EFFECT', option: 'GLITCH_RED' });

            return {
                ...updates,
                currentCargoWeight: recalculateCargoWeight(newResources), // Cargo might change
                actionLogQueue: [...state.actionLogQueue, ...visuals]
            }
        });
    },

    exchangeResourceForFuel: (resource, amount) => {
        const state = get();

        // Исключаем топливо и кредиты из обмена
        const excludedResources: string[] = ['coal', 'oil', 'gas', 'rubies', 'emeralds', 'diamonds', 'credits'];
        if (excludedResources.includes(resource as string)) {
            audioEngine.playUIError();
            console.warn(`❌ ${resource} нельзя обменять на топливо`);
            return;
        }

        // Проверка наличия ресурсов
        if ((state.resources[resource] || 0) < amount) {
            audioEngine.playUIError();
            console.warn(`❌ Недостаточно ${resource} (нужно ${amount}, есть ${state.resources[resource] || 0})`);
            return;
        }

        // Курс обмена: 10 ресурсов = 5 угля
        const coalReceived = Math.floor((amount / 10) * 5);

        if (coalReceived === 0) {
            audioEngine.playUIError();
            console.warn(`❌ Минимум 10 единиц для обмена`);
            return;
        }

        // Транзакция
        audioEngine.playMarketTrade();
        set((state) => {
            const newResources = {
                ...state.resources,
                [resource]: (state.resources[resource] || 0) - amount,
                coal: (state.resources.coal || 0) + coalReceived,
            };

            return {
                resources: newResources,
                currentCargoWeight: recalculateCargoWeight(newResources),
            };
        });

        console.log(`✅ Обменяно ${amount} ${resource} на ${coalReceived} угля`);
    }
});
