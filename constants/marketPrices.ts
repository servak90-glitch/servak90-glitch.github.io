import { ResourceType } from '../types';
import type { RegionId } from '../types';

/**
 * Региональные модификаторы цен для Dynamic Market
 * 
 * Логика: Ресурс ДЕШЕВЛЕ там, где его много добывается.
 * ДОРОЖЕ там, где редок.
 */
export const REGIONAL_PRICE_MODIFIERS: Record<ResourceType, Record<RegionId, number>> = {
    [ResourceType.CLAY]: {
        rust_valley: 1.11,
        crystal_wastes: 1.06,
        iron_gates: 1.13,
        magma_core: 1.18,
        void_chasm: 1.22,
    },
    [ResourceType.STONE]: {
        rust_valley: 1.05,
        crystal_wastes: 1,
        iron_gates: 1.03,
        magma_core: 1.08,
        void_chasm: 1.14,
    },
    [ResourceType.COPPER]: {
        rust_valley: 1.09,
        crystal_wastes: 1.05,
        iron_gates: 0.98,
        magma_core: 1.07,
        void_chasm: 1.12,
    },
    [ResourceType.IRON]: {
        rust_valley: 1.08,
        crystal_wastes: 1.05,
        iron_gates: 0.96,
        magma_core: 1.03,
        void_chasm: 1.07,
    },
    [ResourceType.SILVER]: {
        rust_valley: 1.17,
        crystal_wastes: 1.11,
        iron_gates: 1.03,
        magma_core: 1.01,
        void_chasm: 1.09,
    },
    [ResourceType.GOLD]: {
        rust_valley: 1.14,
        crystal_wastes: 1.1,
        iron_gates: 1.08,
        magma_core: 1,
        void_chasm: 1.06,
    },
    [ResourceType.TITANIUM]: {
        rust_valley: 1.22,
        crystal_wastes: 1.18,
        iron_gates: 1.15,
        magma_core: 1.09,
        void_chasm: 1.06,
    },
    [ResourceType.URANIUM]: {
        rust_valley: 1.24,
        crystal_wastes: 1.19,
        iron_gates: 1.17,
        magma_core: 1.12,
        void_chasm: 1.08,
    },
    [ResourceType.NANOSWARM]: {
        rust_valley: 1.25,
        crystal_wastes: 1.24,
        iron_gates: 1.22,
        magma_core: 1.18,
        void_chasm: 1.11,
    },
    [ResourceType.ANCIENTTECH]: {
        rust_valley: 1.24,
        crystal_wastes: 1.19,
        iron_gates: 1.17,
        magma_core: 1.12,
        void_chasm: 1.08,
    },
    [ResourceType.RUBIES]: {
        rust_valley: 1.19,
        crystal_wastes: 1.06,
        iron_gates: 1.1,
        magma_core: 1.01,
        void_chasm: 1.15,
    },
    [ResourceType.EMERALDS]: {
        rust_valley: 1.16,
        crystal_wastes: 1.06,
        iron_gates: 1.13,
        magma_core: 1.14,
        void_chasm: 1.12,
    },
    [ResourceType.DIAMONDS]: {
        rust_valley: 1.24,
        crystal_wastes: 1.17,
        iron_gates: 1.19,
        magma_core: 1.12,
        void_chasm: 1.08,
    },
    [ResourceType.COAL]: {
        rust_valley: 1,
        crystal_wastes: 1.05,
        iron_gates: 0.95,
        magma_core: 0.93,
        void_chasm: 1.07,
    },
    [ResourceType.OIL]: {
        rust_valley: 1.08,
        crystal_wastes: 1,
        iron_gates: 0.96,
        magma_core: 0.92,
        void_chasm: 1.04,
    },
    [ResourceType.GAS]: {
        rust_valley: 1.11,
        crystal_wastes: 1.05,
        iron_gates: 1.01,
        magma_core: 0.98,
        void_chasm: 0.95,
    },
    [ResourceType.ICE]: {
        rust_valley: 1.1,
        crystal_wastes: 0.98,
        iron_gates: 1.03,
        magma_core: 1.02,
        void_chasm: 0.96,
    },
    [ResourceType.SCRAP]: {
        rust_valley: 0.92,
        crystal_wastes: 1.04,
        iron_gates: 0.96,
        magma_core: 1,
        void_chasm: 1.08,
    },
    [ResourceType.CREDITS]: {
        rust_valley: 1,
        crystal_wastes: 1,
        iron_gates: 1,
        magma_core: 1,
        void_chasm: 1,
    },
    [ResourceType.REPAIRKIT]: {
        rust_valley: 1.06,
        crystal_wastes: 1.1,
        iron_gates: 1.01,
        magma_core: 1.15,
        void_chasm: 1.19,
    },
    [ResourceType.COOLANTPASTE]: {
        rust_valley: 1.08,
        crystal_wastes: 1,
        iron_gates: 1.04,
        magma_core: 0.92,
        void_chasm: 0.96,
    },
    [ResourceType.ADVANCEDCOOLANT]: {
        rust_valley: 1.14,
        crystal_wastes: 1.07,
        iron_gates: 1.1,
        magma_core: 1.01,
        void_chasm: 0.98,
    },
};

/**
 * Получить региональный модификатор для ресурса
 */
export function getRegionalModifier(resource: ResourceType, regionId: RegionId): number {
    return REGIONAL_PRICE_MODIFIERS[resource]?.[regionId] || 1.0;
}

/**
 * Комиссия при ПРОДАЖЕ ресурсов на рынке (20%)
 */
export const MARKET_SELL_FEE = 0.20;
