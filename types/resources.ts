
export enum ResourceType {
    CLAY = 'clay',
    STONE = 'stone',
    COPPER = 'copper',
    IRON = 'iron',
    SILVER = 'silver',
    GOLD = 'gold',
    TITANIUM = 'titanium',
    URANIUM = 'uranium',
    NANO_SWARM = 'nanoSwarm',
    ANCIENT_TECH = 'ancientTech',
    RUBIES = 'rubies',
    EMERALDS = 'emeralds',
    DIAMONDS = 'diamonds',
    COAL = 'coal',
    OIL = 'oil',
    GAS = 'gas',
    ICE = 'ice',
    SCRAP = 'scrap',
    CREDITS = 'credits',
    VOID_MATTER = 'voidMatter',
    CHRONO_SHARDS = 'chronoShards',
    REPAIR_KIT = 'repairKit',
    COOLANT_PASTE = 'coolantPaste',
    ADVANCED_COOLANT = 'advancedCoolant'
}

export type Resources = {
    [key in ResourceType]: number;
};

export enum ArtifactRarity {
    COMMON = 'COMMON',
    RARE = 'RARE',
    EPIC = 'EPIC',
    LEGENDARY = 'LEGENDARY',
    ANOMALOUS = 'ANOMALOUS'
}

import { LocalizedString, VisualEffectType } from './core';

export interface ArtifactDefinition {
    id: string;
    name: LocalizedString;
    description: LocalizedString;
    loreDescription: LocalizedString;

    rarity: ArtifactRarity;
    icon: string;
    basePrice: number;
    scrapAmount: number;
    visualEffect?: VisualEffectType;
    allowedBiomes?: string[];

    effectDescription: LocalizedString;

    modifiers: {
        heatGenPct?: number;
        resourceMultPct?: number;
        drillSpeedPct?: number;
        clickPowerPct?: number;
        luckPct?: number;
        shopDiscountPct?: number;
        shieldEfficiencyPct?: number;
        droneSpeedPct?: number;
        hazardResist?: number;
    };
}
