
export enum View {
  DRILL = 'DRILL',
  CITY = 'CITY',
  FORGE = 'FORGE',
  SKILLS = 'SKILLS',
  ARTIFACTS = 'ARTIFACTS',
  CODEX = 'CODEX',
  COMBAT = 'COMBAT'
}

export type Language = 'RU' | 'EN';

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  musicMuted: boolean;
  sfxMuted: boolean;
  language: Language;
}

export interface Resources {
  clay: number;
  stone: number;
  copper: number;
  iron: number;
  silver: number;
  gold: number;
  titanium: number;
  uranium: number;
  nanoSwarm: number;
  ancientTech: number;
  rubies: number;
  emeralds: number;
  diamonds: number;
}

export type ResourceType = keyof Resources;

export enum ArtifactRarity {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  ANOMALOUS = 'ANOMALOUS'
}

export type ItemRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Godly';

export type VisualEffectType = 'NONE' | 'GLOW_PURPLE' | 'GLOW_GOLD' | 'GLITCH_RED' | 'MATRIX_GREEN' | 'FROST_BLUE';

export type DrillFX =
  | 'pixel_sparks_brown'
  | 'blue_glint'
  | 'fractal_rainbow_trail'
  | 'white_hole_distortion'
  | 'static_noise_overlay'
  | 'golden_aura_vfx'
  | 'infinite_loop_glow'
  | 'none';

export interface ArtifactDefinition {
  id: string;
  name: string;
  description: string;
  loreDescription: string;
  rarity: ArtifactRarity;
  icon: string;
  basePrice: number;
  scrapAmount: number;
  visualEffect?: VisualEffectType;
  allowedBiomes?: string[];

  effectDescription: string;
  modifiers: {
    heatGenPct?: number;
    resourceMultPct?: number;
    drillSpeedPct?: number;
    clickPowerPct?: number;
    luckPct?: number;
    shopDiscountPct?: number;
  };
}

export interface InventoryItem {
  instanceId: string;
  defId: string;
  acquiredAt: number;
  isIdentified: boolean;
  isEquipped: boolean;
}

// --- DRILL PARTS ---

export enum DrillSlot {
  BIT = 'bit',
  ENGINE = 'engine',
  COOLING = 'cooling',
  HULL = 'hull',
  LOGIC = 'logic',
  CONTROL = 'control',
  GEARBOX = 'gearbox',
  POWER = 'power',
  ARMOR = 'armor'
}

export interface BaseDrillPart {
  id: string;
  name: string;
  tier: number;
  rarity: ItemRarity;
  description: string;
  cost: Partial<Resources>;
}

export interface DrillPart extends BaseDrillPart {
  baseStats: {
    damage: number;
    energyCost: number;
  };
  fxId?: DrillFX;
}

export interface EnginePart extends BaseDrillPart {
  baseStats: {
    speed: number;
    energyCost: number;
  };
}

export interface CoolerPart extends BaseDrillPart {
  baseStats: {
    cooling: number;
    energyCost: number;
  };
}

export interface HullPart extends BaseDrillPart {
  baseStats: {
    maxIntegrity: number;
    regen: number;
    slots: number;
    heatCap: number;
  };
}

export interface LogicPart extends BaseDrillPart {
  baseStats: {
    critChance: number;
    luck: number;
    energyCost: number;
    predictionTime?: number;
  };
}

export interface ControlPart extends BaseDrillPart {
  baseStats: {
    clickMultiplier: number;
    ventSpeed: number;
    energyCost: number;
  };
}

export interface GearboxPart extends BaseDrillPart {
  baseStats: {
    torque: number;
    energyCost: number;
  };
}

export interface PowerCorePart extends BaseDrillPart {
  baseStats: {
    energyOutput: number;
    droneEfficiency: number;
  };
}

export interface ArmorPart extends BaseDrillPart {
  baseStats: {
    defense: number;
    hazardResist: number;
    energyCost: number;
  };
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
}

export type FusionConditionType = 'ZERO_HEAT' | 'MAX_HEAT' | 'DEPTH_REACHED' | 'NO_DAMAGE';

export interface FusionCondition {
  type: FusionConditionType;
  target: number;
  description: string;
}

export interface MergeRecipe {
  id: string;
  resultId: string;
  componentAId: string;
  componentBId: string;
  catalyst: {
    resource: ResourceType;
    amount: number;
  };
  condition?: FusionCondition;
  description: string;
}

export type HazardType = 'NONE' | 'CORROSION' | 'MAGNETIC' | 'HEAT_REFLECTION' | 'RADIATION' | 'VOID_PRESSURE';

export interface Biome {
  name: string;
  depth: number;
  resource: ResourceType;
  color: string;
  description: string;
  hub?: string;
  hazard: HazardType;
  hazardLevel: number;
  gemResource?: 'rubies' | 'emeralds' | 'diamonds';
}

export enum BossType {
  WORM = 'WORM',
  CORE = 'CORE',
  CONSTRUCT = 'CONSTRUCT',
  SWARM = 'SWARM'
}

// --- COMBAT MINIGAMES ---
export type CombatMinigameType = 'TIMING' | 'MEMORY' | 'MASH' | 'ALIGN' | 'GLYPH' | 'WIRES';

export interface Boss {
  id: string;
  name: string;
  type: BossType;
  color: string;
  maxHp: number;
  currentHp: number;
  damage: number;
  attackSpeed: number;
  description: string;
  isMob?: boolean;
  reward: {
    xp: number;
    resources: Partial<Resources>;
    guaranteedArtifactRarity?: ArtifactRarity;
  };
  phases: number[];
  isInvulnerable?: boolean;
  minigameWeakness: CombatMinigameType;
}

export type EventType = 'NOTIFICATION' | 'CHOICE' | 'WARNING' | 'ANOMALY' | 'ARTIFACT';

export interface EventOption {
  label: string;
  actionId: string;
  risk?: string;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  weight: number;
  options?: EventOption[];
  biomes?: string[];
  minDepth?: number;
  rewardArtifactDefId?: string;
  forceArtifactDrop?: boolean;
  effectId?: string;

  // HARDCORE FIELDS
  instantDamage?: number; // 0.0 - 1.0 (% of Max Integrity)
  instantDepth?: number;  // Meters added
  instantXp?: number;     // XP added
  instantHeat?: number;   // Heat added
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
  };
}

export enum QuestIssuer {
  CORP = 'CORP',
  SCIENCE = 'SCIENCE',
  REBELS = 'REBELS'
}

export interface QuestRequirement {
  type: 'RESOURCE' | 'XP' | 'TECH' | 'DEPTH';
  target: string;
  amount: number;
}

export interface QuestReward {
  type: 'RESOURCE' | 'XP' | 'TECH';
  target: string;
  amount: number;
}

export interface Quest {
  id: string;
  issuer: QuestIssuer;
  title: string;
  description: string;
  requirements: QuestRequirement[];
  rewards: QuestReward[];
  deadline?: number;
}

export type SkillCategory = 'CORTEX' | 'MOTOR' | 'VISUAL' | 'CHRONOS';

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;

  position: { x: number; y: number };
  requiredParent?: string;
  requiredDepth?: number;

  getBonusText: (level: number) => string;
}

export interface AnalyzerState {
  activeItemInstanceId: string | null;
  timeLeft: number;
  maxTime: number;
}

export interface FlyingObject {
  id: string;
  x: number;
  y: number;
  type: 'GEODE_SMALL' | 'GEODE_LARGE' | 'SATELLITE_DEBRIS';
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
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
  name: string;
  description: string;
  baseCost: Partial<Resources>;
  costMultiplier: number;
  maxLevel: number;
  effectDescription: (level: number) => string;
  color: string;
}

// --- NARRATIVE ENGINE TYPES ---
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

// --- VISUAL PROPS ---
export type PropType = 'FOSSIL' | 'PIPE' | 'CRYSTAL' | 'RUIN' | 'TECH_DEBRIS';

export interface TunnelPropDef {
  type: PropType;
  minDepth: number;
  maxDepth: number;
  chance: number;
  color: string;
}

// --- ACTIVE COOLING (RHYTHM) ---
export interface CoolingState {
  isActive: boolean;
  pulseSize: number; // 0.5 to 1.5
  targetSize: number; // 1.0 is perfect
  perfectWindow: number; // +/- 0.1
  goodWindow: number; // +/- 0.3
  combo: number;
  lastVentResult?: 'PERFECT' | 'GOOD' | 'MISS' | 'COOLDOWN';
  cooldownTimer: number;
}

export interface GameState {
  cooling: CoolingState;
  depth: number;
  resources: Resources;
  heat: number;
  integrity: number;

  // [DEV_CONTEXT: SHIELD]
  shieldCharge: number; // 0-100
  maxShieldCharge: number; // 100
  isShielding: boolean;

  drill: DrillState;

  skillLevels: Record<string, number>;

  /** @deprecated Use inventory instead */
  artifacts: string[];
  inventory: Record<string, InventoryItem>;
  equippedArtifacts: string[];
  discoveredArtifacts: string[];
  analyzer: AnalyzerState;

  activeQuests: Record<string, Quest>;
  lastQuestRefresh: number;

  totalDrilled: number;
  xp: number;
  level: number;
  activeEffects: ActiveEffect[];
  eventQueue: GameEvent[];
  recentEventIds: string[];
  flyingObjects: FlyingObject[];

  currentBoss: Boss | null;
  lastBossDepth: number;

  activeDrones: DroneType[];
  droneLevels: Record<DroneType, number>;

  storageLevel: 0 | 1 | 2;
  forgeUnlocked: boolean;
  cityUnlocked: boolean;
  skillsUnlocked: boolean;

  // NARRATIVE STATE
  aiState: AIState;

  // SETTINGS
  settings: GameSettings;

  // BIOME
  selectedBiome: string | null;

  // [DEV_CONTEXT: GOD_MODE]
  debugUnlocked: boolean;
  isGodMode: boolean;
  isInfiniteCoolant: boolean;
  isOverdrive: boolean;
  isDebugUIOpen: boolean;

  // [DEV_CONTEXT: ENGINE STATE]
  isDrilling: boolean;
  isOverheated: boolean;
  isBroken: boolean;
  isCoolingGameActive: boolean;

  // Timers & Ticks
  heatStabilityTimer: number;
  bossAttackTick: number;
  lastInteractTime: number;
  narrativeTick: number;
  eventCheckTick: number;

  combatMinigame: { active: boolean; type: CombatMinigameType; difficulty: number } | null;
}

export type VisualEvent =
  | { type: 'LOG'; msg: string; color?: string }
  | { type: 'TEXT'; x: number; y: number; text: string; style?: 'DAMAGE' | 'RESOURCE' | 'CRIT' | 'HEAL' | 'INFO' | 'EVADE' }
  | { type: 'PARTICLE'; x: number; y: number; color: string; kind: 'DEBRIS' | 'SPARK' | 'SMOKE'; count: number }
  | { type: 'BOSS_HIT' }
  | { type: 'SOUND'; sfx: 'LOG' | 'GLITCH' | 'ACHIEVEMENT' };
