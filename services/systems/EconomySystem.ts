import { GameState, RegionId, ResourceType, PlayerBase } from '../../types';
import {
    ResourceCategory,
    RESOURCE_TO_CATEGORY,
    BASE_QUOTAS,
    BASE_QUOTA_MULTIPLIERS,
    QUOTA_RECOVERY_PER_HOUR,
    MIN_SATURATION_PRICE_MULT,
    SMUGGLING_CONFIG
} from '../../constants/economy';

/**
 * СИСТЕМА ЭКОНОМИКИ (Market Saturation & Recovery)
 */
export const economySystem = {
    /**
     * Получить категорию для ресурса
     */
    getCategory(resource: ResourceType): ResourceCategory {
        return RESOURCE_TO_CATEGORY[resource] || ResourceCategory.COMMON;
    },

    /**
     * Рассчитать эффективную квоту для региона и категории
     * Учитывает тип базы в регионе.
     */
    calculateEffectiveQuota(state: GameState, regionId: RegionId, category: ResourceCategory): number {
        const baseQuota = BASE_QUOTAS[category];

        // Находим базу игрока в этом регионе
        const base = state.playerBases.find(b => b.regionId === regionId && b.status === 'active');
        const multiplier = base ? BASE_QUOTA_MULTIPLIERS[base.type] : 1.0;

        return baseQuota * multiplier;
    },

    /**
     * Рассчитать множитель насыщения (Saturation Multiplier)
     * Чем больше продано сверх квоты, тем ниже цена.
     */
    calculateSaturationMult(state: GameState, regionId: RegionId, category: ResourceCategory): number {
        const quota = this.calculateEffectiveQuota(state, regionId, category);
        const currentSaturation = (state.marketSaturation[regionId] && state.marketSaturation[regionId][category]) || 0;

        if (currentSaturation <= quota) return 1.0;

        // Формула: Quota / CurrentSaturation
        const mult = quota / currentSaturation;
        return Math.max(MIN_SATURATION_PRICE_MULT, mult);
    },

    /**
     * Проверка, заблокирован ли рынок (Облава)
     */
    isMarketBlocked(state: GameState): boolean {
        return state.marketBlockedUntil > state.gameTime;
    },

    /**
     * Процесс восстановления квот (Recovery)
     * Вызывается раз в игровой час.
     */
    processEconomyRecovery(state: GameState, deltaHours: number): Partial<GameState> {
        const saturation = { ...state.marketSaturation };
        let changed = false;

        // 1. Восстановление квот
        for (const regionId in saturation) {
            const regionData = { ...saturation[regionId] };
            let regionChanged = false;

            for (const category in regionData) {
                const currentVal = regionData[category];
                if (currentVal > 0) {
                    const quota = this.calculateEffectiveQuota(state, regionId as RegionId, category as ResourceCategory);
                    const recoveryAmount = quota * QUOTA_RECOVERY_PER_HOUR * deltaHours;

                    regionData[category] = Math.max(0, currentVal - recoveryAmount);
                    regionChanged = true;
                    changed = true;
                }
            }
            if (regionChanged) {
                saturation[regionId] = regionData;
            }
        }

        // 2. Снижение риска облавы
        let newRaidRisk = state.raidRisk;
        if (newRaidRisk > 0) {
            newRaidRisk = Math.max(0, newRaidRisk - SMUGGLING_CONFIG.RAID_RISK_DECAY_PER_HOUR * deltaHours);
            changed = true;
        }

        if (!changed) return {};

        return {
            marketSaturation: saturation,
            raidRisk: newRaidRisk
        };
    },

    /**
     * Расчет риска и ролл облавы при продаже Лисе
     */
    calculateRaidProgress(revenue: number): number {
        return (revenue / 1000) * SMUGGLING_CONFIG.RAID_RISK_PER_1000;
    }
};
