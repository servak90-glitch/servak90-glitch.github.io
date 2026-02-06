/**
 * BLACK MARKET SLICE — управление контрабандой (Phase 6.2)
 * Продажа ресурсов на черном рынке с риском облав
 */

import { SliceCreator } from './types';
import { RegionId } from '../../types';
import type { ResourceType, BlackMarketState, SmugglingQuest } from '../../types';
import { initializeBlackMarket, RAID_THRESHOLDS, RAID_PENALTIES, RISK_DECAY_RATE, SMUGGLING_RESOURCES } from '../../constants/blackMarket';
import { calculateMarketPrice } from '../../services/marketEngine';
import { getActivePerkIds } from '../../services/factionLogic';

export interface BlackMarketActions {
    blackMarkets: Record<RegionId, BlackMarketState>;
    foxReputation: number;

    initializeBlackMarkets: () => void;
    sellToBlackMarket: (regionId: RegionId, resource: ResourceType, amount: number) => boolean;
    updateBlackMarketRisk: (deltaHours: number) => void;
    triggerRaid: (regionId: RegionId) => void;
    generateSmugglingQuest: (regionId: RegionId) => void;
    acceptSmugglingQuest: (regionId: RegionId) => void;
    completeSmugglingQuest: (regionId: RegionId) => void;
}

export const createBlackMarketSlice: SliceCreator<BlackMarketActions> = (set, get) => ({
    blackMarkets: {} as Record<RegionId, BlackMarketState>,
    foxReputation: 0,

    initializeBlackMarkets: () => {
        const regions = [RegionId.RUST_VALLEY, RegionId.CRYSTAL_WASTES, RegionId.IRON_GATES, RegionId.MAGMA_CORE, RegionId.VOID_CHASM];
        const markets: Record<RegionId, BlackMarketState> = {} as any;

        regions.forEach(regionId => {
            markets[regionId] = initializeBlackMarket(regionId);
        });

        set({ blackMarkets: markets });
    },

    sellToBlackMarket: (regionId, resource, amount) => {
        const state = get();
        const market = state.blackMarkets[regionId];

        if (!market || market.status === 'BLOCKED') {
            set(s => ({
                actionLogQueue: [...s.actionLogQueue, {
                    type: 'LOG',
                    msg: 'ЧЕРНЫЙ РЫНОК НЕДОСТУПЕН',
                    color: 'text-red-400'
                }]
            }));
            return false;
        }

        const marketResource = market.availableResources.find(r => r.resource === resource);
        if (!marketResource) return false;

        const available = state.resources[resource] || 0;
        if (available < amount) return false;

        // ДИНАМИЧЕСКИЕ ЦЕНЫ: Используем реальные цены из marketEngine
        const priceInfo = calculateMarketPrice(resource, regionId, [], getActivePerkIds(state.reputation));

        // Черный рынок покупает дороже рынка
        const totalPrice = Math.floor(priceInfo.finalPrice * marketResource.priceMultiplier * amount);
        const addedRisk = marketResource.riskPerUnit * amount;
        const newRisk = Math.min(100, market.currentRisk + addedRisk);

        set(s => ({
            resources: {
                ...s.resources,
                [resource]: available - amount,
                credits: (s.resources.credits || 0) + totalPrice
            },
            blackMarkets: {
                ...s.blackMarkets,
                [regionId]: { ...market, currentRisk: newRisk }
            },
            foxReputation: Math.min(100, s.foxReputation + Math.floor(addedRisk * 0.5)),
            actionLogQueue: [...s.actionLogQueue, {
                type: 'LOG',
                msg: `ПРОДАНО: ${amount} ${resource} за ${totalPrice} CR (+${addedRisk.toFixed(1)}% риск)`,
                color: 'text-amber-400',
                icon: '🦊'
            }]
        }));

        if (newRisk >= RAID_THRESHOLDS.RAID) {
            // Bonus 3: Untouchable (100 Rep) -> 15% chance to avoid raid
            const avoidChance = state.foxReputation >= 100 ? 0.15 : 0;
            if (Math.random() > avoidChance) {
                setTimeout(() => (get() as any).triggerRaid(regionId), 100);
            } else {
                set(s => ({
                    actionLogQueue: [...s.actionLogQueue, {
                        type: 'LOG',
                        msg: `СЕТЬ ЛИСЫ СКРЫЛА ВАС ОТ ОБЛАВЫ!`,
                        color: 'text-emerald-400 font-bold',
                        icon: '🦊'
                    }]
                }));
            }
        }

        return true;
    },

    updateBlackMarketRisk: (deltaHours) => {
        const state = get();
        const updatedMarkets = { ...state.blackMarkets };
        let hasChanges = false;
        const gameTime = state.gameTime;

        Object.entries(updatedMarkets).forEach(([regionId, market]) => {
            const rid = regionId as RegionId;

            // Bonus 1: Shadow Network (25 Rep) -> +20% decay
            const decayMult = state.foxReputation >= 25 ? 1.2 : 1.0;

            // Decay risk
            if (market.currentRisk > 0) {
                updatedMarkets[rid] = {
                    ...market,
                    currentRisk: Math.max(0, market.currentRisk - RISK_DECAY_RATE * deltaHours * decayMult)
                };
                hasChanges = true;
            }

            // Unblock
            if (market.status === 'BLOCKED') {
                const timeSinceRaid = gameTime - market.lastRaidTime;
                // Bonus 2: Inside Man (50 Rep) -> -30% block duration
                const blockDuration = state.foxReputation >= 50 ? RAID_PENALTIES.blockDuration * 0.7 : RAID_PENALTIES.blockDuration;

                if (timeSinceRaid >= blockDuration) {
                    updatedMarkets[rid] = {
                        ...market,
                        status: 'AVAILABLE',
                        currentRisk: 0
                    };
                    hasChanges = true;
                }
            }

            // Periodic Quest Generation (every 48h)
            const timeSinceLastQuest = gameTime - market.lastQuestGenTime;
            if (!market.activeQuest && timeSinceLastQuest >= 48 * 3600 && market.status === 'AVAILABLE') {
                // We'll generate a quest in a direct way or call generateSmugglingQuest inland
                // For simplicity in tick, we just mark it for generation or do it here
                (get() as any).generateSmugglingQuest(rid);
            }

            // Check Quest Expiration
            if (market.activeQuest && market.activeQuest.status === 'ACTIVE' && gameTime > market.activeQuest.expiryTime) {
                updatedMarkets[rid] = {
                    ...market,
                    activeQuest: { ...market.activeQuest, status: 'EXPIRED' }
                };
                hasChanges = true;
            }
        });

        if (hasChanges) {
            set({ blackMarkets: updatedMarkets });
        }
    },

    triggerRaid: (regionId) => {
        const state = get();
        const market = state.blackMarkets[regionId];

        if (!market) return;

        // Bonus 2: Inside Man (50 Rep) -> -30% credit penalty
        const creditPenalty = state.foxReputation >= 50 ? RAID_PENALTIES.credits * 0.7 : RAID_PENALTIES.credits;

        set(s => ({
            resources: {
                ...s.resources,
                credits: Math.max(0, (s.resources.credits || 0) - creditPenalty)
            },
            blackMarkets: {
                ...s.blackMarkets,
                [regionId]: {
                    ...market,
                    status: 'BLOCKED',
                    currentRisk: 0,
                    lastRaidTime: s.gameTime
                }
            },
            foxReputation: Math.max(0, s.foxReputation + RAID_PENALTIES.foxReputation),
            actionLogQueue: [...s.actionLogQueue, {
                type: 'LOG',
                msg: `⚠️ ОБЛАВА В ${regionId}! ШТРАФ: ${creditPenalty} CR`,
                color: 'text-red-500 font-bold',
                icon: '🚨'
            }]
        }));

        const factions = ['CORPORATE', 'SCIENCE', 'REBELS'];
        factions.forEach(factionId => {
            (state as any).addReputation?.(factionId, -RAID_PENALTIES.reputation);
        });
    },

    generateSmugglingQuest: (regionId) => {
        const state = get();
        const market = state.blackMarkets[regionId];
        if (!market || market.activeQuest) return;

        // Pick random resource from smuggling list
        const categories: (keyof typeof SMUGGLING_RESOURCES)[] = ['LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK'];
        const cat = categories[Math.floor(Math.random() * categories.length)];
        const resources = SMUGGLING_RESOURCES[cat];
        const resource = resources[Math.floor(Math.random() * resources.length)];

        // Random amount 50-200
        const amount = 50 + Math.floor(Math.random() * 150);
        // Рассчитываем награду на основе динамической цены
        const priceInfo = calculateMarketPrice(resource, regionId, [], getActivePerkIds(state.reputation));
        const rewardCredits = Math.floor(priceInfo.finalPrice * (1.5 + Math.random() * 0.5) * amount);
        const rewardFoxRep = 10 + Math.floor(Math.random() * 15); // Снижено с 20-50

        const quest: SmugglingQuest = {
            id: `sq_${regionId}_${state.gameTime}`,
            resource,
            amount,
            targetRegion: regionId,
            rewardCredits,
            rewardFoxRep,
            expiryTime: state.gameTime + 72 * 3600, // 72 hours
            status: 'ACTIVE'
        };

        set(s => ({
            blackMarkets: {
                ...s.blackMarkets,
                [regionId]: { ...market, activeQuest: quest, lastQuestGenTime: s.gameTime }
            }
        }));
    },

    acceptSmugglingQuest: (regionId) => {
        // Quest is automatic for now, but we can add acceptance logic if needed
        // For simplicity, generateSmugglingQuest already makes it ACTIVE
    },

    completeSmugglingQuest: (regionId) => {
        const state = get();
        const market = state.blackMarkets[regionId];
        if (!market || !market.activeQuest || market.activeQuest.status !== 'ACTIVE') return;

        const { resource, amount, rewardCredits, rewardFoxRep } = market.activeQuest;
        const available = state.resources[resource] || 0;

        if (available < amount) {
            set(s => ({
                actionLogQueue: [...s.actionLogQueue, {
                    type: 'LOG',
                    msg: `НЕДОСТАТОЧНО РЕСУРСОВ ДЛЯ ЗАКАЗА (${available}/${amount})`,
                    color: 'text-red-400'
                }]
            }));
            return;
        }

        set(s => ({
            resources: {
                ...s.resources,
                [resource]: available - amount,
                credits: (s.resources.credits || 0) + rewardCredits
            },
            blackMarkets: {
                ...s.blackMarkets,
                [regionId]: { ...market, activeQuest: { ...market.activeQuest, status: 'COMPLETED' } }
            },
            foxReputation: Math.min(100, s.foxReputation + rewardFoxRep),
            actionLogQueue: [...s.actionLogQueue, {
                type: 'LOG',
                msg: `ЗАКАЗ ЛИСЫ ВЫПОЛНЕН! +${rewardCredits} CR, +${rewardFoxRep} FOX REP`,
                color: 'text-purple-400 font-bold',
                icon: '🦊'
            }]
        }));
    }
});
