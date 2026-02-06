
import { LocalizedString, OperatorId, CrewId } from './core';
import { ResourceType, Resources } from './resources';

export interface OperatorDefinition {
    id: OperatorId;
    name: LocalizedString;
    lore: LocalizedString;
    visuals: LocalizedString;
    passiveBonus: LocalizedString;
    uniqueTrait: LocalizedString;
    portraitPath: string;
    stats: {
        predictionTime?: number;
        maxHullPct?: number;
        damageReductionPct?: number;
        heatCapAdd?: number;
        coolingEfficiencyPct?: number;
        craftingCostReductionPct?: number;
        luckPct?: number;
        gemDropChancePct?: number;
        rareResourceChancePct?: number;
        hazardRiskReductionPct?: number;
        consumableSaveChancePct?: number;
    };
}

export interface CrewDefinition {
    id: CrewId;
    name: LocalizedString;
    lore: LocalizedString;
    visuals: LocalizedString;
    effectDesc: LocalizedString;
    portraitPath: string;
    cost: {
        credits: number;
        upkeepPercent?: number;
        upkeepResources?: Partial<Resources>;
        periodicCredits?: number;
    };
    stats: {
        droneSpeedPct?: number;
        shieldChargeSpeedPct?: number;
        cargoCapacityPct?: number;
        drillTorquePct?: number;
        critChancePct?: number;
        evasionPct?: number;
        bossDamagePct?: number;
        rareResourceChancePct?: number;
        hazardRiskReductionPct?: number;
        consumableSaveChancePct?: number;
    };
}

export type SkillCategory = 'CORTEX' | 'MOTOR' | 'VISUAL' | 'CHRONOS';

export interface SkillDefinition {
    id: string;
    name: LocalizedString;
    description: LocalizedString;
    category: SkillCategory;
    maxLevel: number;
    baseCost: number;
    costMultiplier: number;
    position: { x: number; y: number };
    requiredParent?: string;
    requiredDepth?: number;
    getBonusText: (level: number) => string;
}

export enum DroneType {
    COLLECTOR = 'COLLECTOR',
    COOLER = 'COOLER',
    BATTLE = 'BATTLE',
    REPAIR = 'REPAIR',
    MINER = 'MINER'
}

export interface DroneDefinition {
    id: DroneType;
    name: LocalizedString;
    description: LocalizedString;
    baseCost: Partial<Resources>;
    costMultiplier: number;
    maxLevel: number;
    effectDescription: (level: number) => LocalizedString;
    color: string;
}

export type ExpeditionDifficulty = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';

export interface Expedition {
    id: string;
    difficulty: ExpeditionDifficulty;
    riskChance: number;
    droneCount: number;
    resourceTarget: ResourceType;
    startTime: number;
    duration: number;
    status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
    rewards?: Partial<Resources>;
    lostDrones?: number;
    log: string[];
}

export type AIState = 'LUCID' | 'MANIC' | 'DEPRESSED' | 'BROKEN';

export interface NarrativeContext {
    depth: number;
    heat: number;
    integrity: number;
    biome: string;
    eventActive: boolean;
    afkTime: number;
}

export interface LogFragment {
    id: string;
    text: string;
    tags: string[];
    weight: number;
}
