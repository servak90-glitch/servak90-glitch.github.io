import { Resources, ResourceType } from './resources';
import { RegionId, Biome, SideTunnelState, TravelState, FlyingObject } from './world';
import { ZoneLicense, Permit, MarketTransaction, Caravan, CaravanUnlock, FactionId, ReputationState, Quest, StateContract, BlackMarketState } from './economy';
import { PlayerBase } from './base';
import { ActiveAbilityState, Boss, CombatMinigame } from './combat';
import { DrillState, Stats, CraftingJob, EquipmentItem } from './drill';
import { DroneType, Expedition, AIState, LogFragment } from './rpg';
import { DialogueState, GameSettings, ChronosTime, LogEntry, VisualEvent, OperatorId, CrewId } from './core';

// Re-using some structures to avoid duplication
export interface GameEvent {
    id: string;
    title: import('./core').LocalizedString;
    description: import('./core').LocalizedString;
    type: import('./core').EventType;
    chronosChance?: import('./core').ChronosChance;
    options?: import('./core').EventOption[];
    biomes?: string[];
    minDepth?: number;
    rewardArtifactDefId?: string;
    forceArtifactDrop?: boolean;
    effectId?: string;
    imageUrl?: string;
    weight?: number;
    instantDamage?: number;
    instantDepth?: number;
    instantXp?: number;
    instantHeat?: number;
    triggers?: import('./core').EventTrigger[];
    probabilityModel?: any;
    conditionalChance?: (state: GameState) => number;
    depthModifier?: (depth: number) => number;
    instantResource?: any;
    caravanEffect?: any;
    baseEffect?: any;
    cooldown?: number;
}

export interface ActiveEffect {
    id: string;
    name: string;
    description: string;
    duration: number;
    type: 'BUFF' | 'DEBUFF' | 'NEUTRAL' | 'ANOMALY';
    modifiers: {
        heatGenMultiplier?: number;
        coolingDisabled?: boolean;
        resourceMultiplier?: number;
        drillSpeedMultiplier?: number;
        clickPowerMultiplier?: number;
        autoClickDisabled?: boolean;
        heatInstability?: boolean;
        consumableDropMultiplier?: number;
    };
}

export interface GameState {
    gameTime: number;
    timeMultiplier: number;
    chronos: ChronosTime;
    depth: number;
    resources: Resources;
    heat: number;
    integrity: number;
    currentCargoWeight: number;
    currentRegion: RegionId;

    globalReputation: number;
    unlockedLicenses: ZoneLicense[];
    activePermits: Partial<Record<RegionId, Permit>>;

    playerBases: PlayerBase[];

    marketTransactionHistory: MarketTransaction[];
    caravans: Caravan[];
    caravanUnlocks: CaravanUnlock[];

    activeAbilities: ActiveAbilityState[];

    unlockedBlueprints: string[];

    shieldCharge: number;
    maxShieldCharge: number;
    isShielding: boolean;

    drill: DrillState;

    skillLevels: Record<string, number>;

    /** @deprecated */
    artifacts: string[];
    inventory: Record<string, any>; // Simplified for now to avoid circular if using InventoryItem from drill
    equippedArtifacts: string[];
    discoveredArtifacts: string[];
    analyzer: {
        activeItemInstanceId: string | null;
        timeLeft: number;
        maxTime: number;
    };

    activeQuests: Quest[];
    completedQuestIds: string[];
    failedQuestIds: string[];
    lastQuestRefresh: number;
    reputation: ReputationState;

    totalDrilled: number;
    xp: number;
    level: number;
    activeEffects: ActiveEffect[];
    eventQueue: GameEvent[];
    recentEventIds: string[];
    eventCooldowns: Record<string, number>;
    pendingPredictions: Array<{ event: GameEvent; triggerTime: number; predictionShown: boolean }>;
    flyingObjects: FlyingObject[];

    currentBoss: Boss | null;
    lastBossDepth: number;

    activeDrones: DroneType[];
    droneLevels: Record<DroneType, number>;
    activeExpeditions: Expedition[];
    defeatedBosses: string[];

    operatorId: OperatorId | null;
    unlockedOperators: OperatorId[];
    hiredCrewIds: CrewId[];
    crewLoyalty: Record<string, number>;

    activeDialogue: DialogueState | null;

    storageLevel: 0 | 1 | 2;
    forgeUnlocked: boolean;
    cityUnlocked: boolean;
    skillsUnlocked: boolean;

    consumables: {
        repairKit: number;
        coolantPaste: number;
        advancedCoolant: number;
    };

    aiState: AIState;
    settings: GameSettings;
    selectedBiome: string | null;

    debugUnlocked: boolean;
    isGodMode: boolean;
    isInfiniteCoolant: boolean;
    isInfiniteFuel: boolean;
    isInfiniteEnergy: boolean;
    isZeroWeight: boolean;
    isOverdrive: boolean;
    isDebugUIOpen: boolean;

    isDrilling: boolean;
    isOverheated: boolean;
    isBroken: boolean;
    isCoolingGameActive: boolean;

    heatStabilityTimer: number;
    bossAttackTick: number;
    lastInteractTime: number;
    narrativeTick: number;
    eventCheckTick: number;
    eventLastTriggerDay: Record<string, number>;
    marketSaturation: Record<string, Record<string, number>>;
    raidRisk: number;
    marketBlockedUntil: number;

    combatMinigame: CombatMinigame | null;
    minigameCooldown: number;

    craftingQueue: CraftingJob[];
    equipmentInventory: EquipmentItem[];
    travel: TravelState | null;
    sideTunnel: SideTunnelState | null;
    freeCoolingLastUsed: number;
    lastRaidCheck: number;

    stats: Stats;
    logEntries: LogEntry[];

    activeContracts: StateContract[];
    availableContracts: StateContract[];
    completedContractIds: string[];
    lastContractGeneration: number;

    blackMarkets: Record<RegionId, BlackMarketState>;
    foxReputation: number;
}

// VisualEvent moved to core.ts
