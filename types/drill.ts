
import { LocalizedString, VisualEffectType } from './core';
import { ResourceType, Resources } from './resources';

export enum DrillSlot {
    BIT = 'bit',
    ENGINE = 'engine',
    COOLING = 'cooling',
    HULL = 'hull',
    LOGIC = 'logic',
    CONTROL = 'control',
    GEARBOX = 'gearbox',
    POWER = 'power',
    ARMOR = 'armor',
    SHIELD = 'shield',
    CARGO_BAY = 'cargoBay'
}

export interface RPGModifiers {
    gemDropChancePct: number;
    luckPct: number;
    predictionTime: number;
    maxHullPct: number;
    damageReductionPct: number;
    heatCapAdd: number;
    coolingEfficiencyPct: number;
    craftingCostReductionPct: number;
    drillSpeedBasePct: number;
    cargoCapacityPct: number;
    drillTorquePct: number;
    critChancePct: number;
    evasionPct: number;
    bossDamagePct: number;
    shieldChargeSpeedPct: number;
    droneSpeedPct: number;
    rareResourceChancePct: number;
    hazardRiskReductionPct: number;
    consumableSaveChancePct: number;
}

export interface Stats {
    energyProd: number;
    energyCons: number;
    energyEfficiency: number;
    totalDamage: number;
    totalSpeed: number;
    totalCooling: number;
    torque: number;
    critChance: number;
    luck: number;
    predictionTime: number;
    clickMult: number;
    ventSpeed: number;
    defense: number;
    evasion: number;
    hazardResist: number;
    integrity: number;
    regen: number;
    droneEfficiency: number;
    drillingEfficiency: number;
    ambientHeat: number;
    requiredTier: number;
    totalCargoCapacity?: number;
    skillMods: Record<string, number>;
    artifactMods: Record<string, number>;
    shieldEfficiency?: number;
    maxShield?: number;
    shieldRechargeMult?: number;
    activeDrones: number;
    rpgMods: RPGModifiers;
    miningSpeedMultiplier?: number;
    coolingMultiplier?: number;
}

export type DrillFX =
    | 'pixel_sparks_brown'
    | 'blue_glint'
    | 'fractal_rainbow_trail'
    | 'white_hole_distortion'
    | 'static_noise_overlay'
    | 'golden_aura_vfx'
    | 'infinite_loop_glow'
    | 'none';

export interface InventoryItem {
    instanceId: string;
    defId: string;
    acquiredAt: number;
    isIdentified: boolean;
    isEquipped: boolean;
}

export interface BaseDrillPart {
    id: string;
    iconPath?: string;
    name: LocalizedString;
    tier: number;
    rarity: ItemRarity;
    description: LocalizedString;
    cost: Partial<Resources>;
    blueprintId?: string;
    mass?: number;
}

export interface DrillPart extends BaseDrillPart {
    baseStats: { damage: number; energyCost: number; };
    fxId?: DrillFX;
}

export interface EnginePart extends BaseDrillPart {
    baseStats: { speed: number; energyCost: number; };
}

export interface CoolerPart extends BaseDrillPart {
    baseStats: { cooling: number; energyCost: number; };
}

export interface HullPart extends BaseDrillPart {
    baseStats: { maxIntegrity: number; regen: number; slots: number; cargoCapacity: number; heatCap: number; };
}

export interface LogicPart extends BaseDrillPart {
    baseStats: { critChance: number; luck: number; energyCost: number; predictionTime?: number; };
}

export interface ControlPart extends BaseDrillPart {
    baseStats: { clickMultiplier: number; ventSpeed: number; energyCost: number; };
}

export interface GearboxPart extends BaseDrillPart {
    baseStats: { torque: number; energyCost: number; };
}

export interface PowerCorePart extends BaseDrillPart {
    baseStats: { energyOutput: number; droneEfficiency: number; };
}

export interface ArmorPart extends BaseDrillPart {
    baseStats: { defense: number; hazardResist: number; energyCost: number; };
}

export interface ShieldPart extends BaseDrillPart {
    baseStats: { maxShield: number; efficiency: number; rechargeMult: number; energyCost: number; };
}

export interface CargoBayPart extends BaseDrillPart {
    baseStats: { cargoCapacity: number; energyCost: number; };
}

export interface DrillState {
    [DrillSlot.BIT]: DrillPart;
    [DrillSlot.ENGINE]: EnginePart;
    [DrillSlot.COOLING]: CoolerPart;
    [DrillSlot.HULL]: HullPart;
    [DrillSlot.LOGIC]: LogicPart;
    [DrillSlot.CONTROL]: ControlPart;
    [DrillSlot.GEARBOX]: GearboxPart;
    [DrillSlot.POWER]: PowerCorePart;
    [DrillSlot.ARMOR]: ArmorPart;
    [DrillSlot.SHIELD]: ShieldPart;
    [DrillSlot.CARGO_BAY]: CargoBayPart;
}

export interface CraftingJob {
    id: string;
    partId: string;
    slotType: DrillSlot;
    startTime: number;
    completionTime: number;
    status: 'in_progress' | 'ready_to_collect';
}

export interface EquipmentItem {
    instanceId: string;
    partId: string;
    slotType: DrillSlot;
    tier: number;
    acquiredAt: number;
    isEquipped: boolean;
    scrapValue: number;
}

export type FusionConditionType = 'ZERO_HEAT' | 'MAX_HEAT' | 'DEPTH_REACHED' | 'NO_DAMAGE';

export interface FusionCondition {
    type: FusionConditionType;
    target: number;
    description: LocalizedString;
}

export interface MergeRecipe {
    id: string;
    resultId: string;
    componentAId: string;
    componentBId: string;
    catalyst: { resource: ResourceType; amount: number; };
    condition?: FusionCondition;
    description: LocalizedString;
}

export type ItemRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Godly';
