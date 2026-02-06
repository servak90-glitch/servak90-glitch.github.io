
import { LocalizedString, Language } from './core';
import { ResourceType, Resources } from './resources';
import { RegionId } from './world'; // Будет создан далее

export type ZoneLicense = 'green' | 'yellow' | 'red';
export type PermitType = 'temporary' | 'permanent';

export interface License {
    zone: ZoneLicense;
    acquiredAt: number;
}

export interface Permit {
    regionId: RegionId;
    type: PermitType;
    expirationDate: number | null;
}

export interface ReputationTier {
    tier: 1 | 2 | 3 | 4 | 5;
    min: number;
    max: number;
    name: string;
    discount: number;
}

export type FactionId = 'CORPORATE' | 'SCIENCE' | 'REBELS';

export interface FactionPerk {
    id: string;
    levelRequired: number;
    name: LocalizedString;
    description: LocalizedString;
    effectType: 'MARKET' | 'LOGISTICS' | 'SCANNER' | 'COMBAT' | 'PASSIVE';
    value?: number;
}

export interface FactionDef {
    id: FactionId;
    name: string;
    description: string;
    perks: FactionPerk[];
}

export interface ReputationState {
    [key: string]: number; // FactionId -> value
}

export interface MarketPrice {
    resource: keyof Resources;
    basePrice: number;
    regionalModifier: number;
    temporalModifier: number;
    finalPrice: number;
}

export interface MarketTransaction {
    type: 'buy' | 'sell';
    resource: keyof Resources;
    amount: number;
    pricePerUnit: number;
    totalCost: number;
    regionId: RegionId;
    timestamp: number;
}

export type CaravanTier = '1star' | '2star' | '3star';
export type CaravanStatus = 'in_transit' | 'completed' | 'lost';

export interface Caravan {
    id: string;
    tier: CaravanTier;
    fromBaseId: string;
    toBaseId: string;
    cargo: Partial<Resources>;
    cargoWeight: number;
    departureTime: number;
    arrivalTime: number;
    status: CaravanStatus;
    lossChance: number;
}

export interface CaravanUnlock {
    tier: CaravanTier;
    unlocked: boolean;
    unlockedAt?: number;
}

// Квесты
export type QuestStatus = 'available' | 'active' | 'completed' | 'failed';
export type QuestType = 'DELIVERY' | 'COLLECTION' | 'EXPLORATION' | 'COMBAT' | 'STORY';
export type QuestObjectiveType = 'COLLECT' | 'DELIVER' | 'REACH_DEPTH' | 'DEFEAT_BOSS' | 'BUILD_BASE' | 'TRAVEL_TO';

export interface QuestObjective {
    id: string;
    description: LocalizedString;
    type: QuestObjectiveType;
    target: string;
    required: number;
    current: number;
}

export type QuestRewardType = 'RESOURCE' | 'REPUTATION' | 'UNLOCK' | 'BLUEPRINT' | 'XP';

export interface QuestReward {
    type: QuestRewardType;
    target: string;
    amount?: number;
}

export interface Quest {
    id: string;
    title: LocalizedString;
    description: LocalizedString;
    status: QuestStatus;
    type: QuestType;
    objectives: QuestObjective[];
    rewards: QuestReward[];
    factionId?: FactionId;
    prerequisites?: string[];
    expiresAt?: number;
}

// Госзаказы
export type ContractStatus = 'available' | 'active' | 'completed' | 'failed' | 'expired';
export type ContractTier = 'STANDARD' | 'PRIORITY' | 'CRITICAL';

export interface ContractRequirement {
    resource: ResourceType;
    amount: number;
    delivered: number;
}

export interface StateContract {
    id: string;
    factionId: FactionId;
    tier: ContractTier;
    title: LocalizedString;
    description: LocalizedString;
    requirements: ContractRequirement[];
    rewards: {
        credits: number;
        reputation: number;
        blueprint?: string;
        bonus?: Partial<Resources>;
    };
    minReputationLevel: number;
    timeLimit?: number;
    exclusive?: boolean;
    status: ContractStatus;
    acceptedAt?: number;
    expiresAt: number;
    generatedAt: number;
    failurePenalty?: {
        reputation: number;
        credits?: number;
    };
}

// Черный рынок
export type BlackMarketStatus = 'AVAILABLE' | 'RAID_RISK' | 'BLOCKED';
export type SmugglingCategory = 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';

export interface BlackMarketResource {
    resource: ResourceType;
    category: SmugglingCategory;
    priceMultiplier: number;
    riskPerUnit: number;
    demandLevel: number;
}

export interface SmugglingQuest {
    id: string;
    resource: ResourceType;
    amount: number;
    targetRegion: RegionId;
    rewardCredits: number;
    rewardFoxRep: number;
    expiryTime: number;
    status: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
}

export interface BlackMarketState {
    regionId: RegionId;
    status: BlackMarketStatus;
    availableResources: BlackMarketResource[];
    currentRisk: number;
    lastRaidTime: number;
    foxReputation: number;
    activeQuest: SmugglingQuest | null;
    lastQuestGenTime: number;
}

/** @deprecated */
export enum QuestIssuer { CORP = 'CORP', SCIENCE = 'SCIENCE', REBELS = 'REBELS' }
/** @deprecated */
export interface QuestRequirement { type: 'RESOURCE' | 'XP' | 'TECH' | 'DEPTH'; target: string; amount: number; }
