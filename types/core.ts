
export enum View {
    DRILL = 'DRILL',
    CITY = 'CITY',
    FORGE = 'FORGE',
    SKILLS = 'SKILLS',
    CODEX = 'CODEX',
    COMBAT = 'COMBAT',
    GLOBAL_MAP = 'GLOBAL_MAP'
}

export type Language = 'RU' | 'EN';
export type LocalizedString = { RU: string; EN: string };

export interface DialogueChoice {
    text: LocalizedString;
    nextId?: string;
    onSelect?: () => void;
    requirement?: (state: any) => boolean; // Использование any для избежания циклической зависимости от GameState
}

export interface DialogueNode {
    id: string;
    characterName: LocalizedString;
    portraitPath: string;
    text: LocalizedString;
    choices: DialogueChoice[];
    isEnd?: boolean;
}

export interface DialogueState {
    currentNodeId: string;
    nodes: Record<string, DialogueNode>;
    onClose?: () => void;
}

export enum OperatorId {
    GEOLOGIST = 'geologist',
    SOLDIER = 'soldier',
    MECHANIC = 'mechanic'
}

export enum CrewId {
    ZIB = 'zib',
    GROG = 'grog',
    REX = 'rex'
}

export interface GameSettings {
    musicVolume: number;
    sfxVolume: number;
    drillVolume: number;
    musicMuted: boolean;
    sfxMuted: boolean;
    drillMuted: boolean;
    language: Language;
    graphicsQuality: 'low' | 'medium' | 'high';
}

export interface ChronosTime {
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
    weeks: number;
    months: number;
    totalHours: number;
    totalDays: number;
}

export enum EventTrigger {
    DRILLING = 'drilling',
    TRAVELING = 'traveling',
    TRAVEL = 'travel',
    BASE_VISIT = 'base_visit',
    MARKET_UPDATE = 'market_update',
    COMBAT = 'combat',
    GLOBAL_MAP_ACTIVE = 'global_map_active',
    CARAVAN_TRAVELING = 'caravan_traveling',
    STUCK_IN_SPACE = 'stuck_in_space',
    BASE_RAID = 'base_raid'
}

export type EventType = 'NOTIFICATION' | 'CHOICE' | 'WARNING' | 'ANOMALY' | 'ARTIFACT' | 'BUFF' | 'QUEST' | 'COMBAT_EVENT' | 'MARKET_EVENT' | 'DELAY';

export enum EventActionId {
    TECTONIC_HOLD = 'tectonic_hold',
    TECTONIC_PUSH = 'tectonic_push',
    POD_LASER = 'pod_laser',
    POD_HACK = 'pod_hack',
    ACCEPT_FLUCTUATION = 'accept_fluctuation',
    REJECT_FLUCTUATION = 'reject_fluctuation',
    AI_TRUST = 'ai_trust',
    AI_REBOOT = 'ai_reboot',
    PURGE_NANOMITES = 'purge_nanomites',
    CRYSTAL_ABSORB = 'crystal_absorb',
    TUNNEL_SAFE = 'tunnel_safe',
    TUNNEL_RISKY = 'tunnel_risky',
    BLACK_MARKET_BUY = 'black_market_buy',
    BLACK_MARKET_REFUSE = 'black_market_refuse',
    RESCUE_ACCEPT = 'rescue_accept',
    RESCUE_REFUSE = 'rescue_refuse',
    PIRATE_FIGHT = 'pirate_fight',
    PIRATE_BRIBE = 'pirate_bribe',
    WRECK_LOOT = 'wreck_loot',
    WRECK_IGNORE = 'wreck_ignore',
    BASE_DEFEND = 'base_defend',
    BASE_SURRENDER = 'base_surrender',
    ENCOUNTER_INVESTIGATE = 'encounter_investigate',
    ENCOUNTER_IGNORE = 'encounter_ignore',
    TUNNEL_CRYSTAL = 'tunnel_crystal',
    TUNNEL_MINE = 'tunnel_mine',
    TUNNEL_NEST = 'tunnel_nest'
}

export interface EventOption {
    label: LocalizedString;
    actionId: EventActionId | string;
    risk?: LocalizedString;
}

export interface ChronosChance {
    chance: number;
    period: 'hour' | 'day';
    interval?: number;
}

export enum LogCategory {
    SYSTEM = 'SYSTEM',
    DIALOG = 'DIALOG',
    LORE = 'LORE',
    TUTORIAL = 'TUTORIAL'
}

export type VisualEffectType = 'NONE' | 'GLOW_PURPLE' | 'GLOW_GOLD' | 'GLITCH_RED' | 'MATRIX_GREEN' | 'FROST_BLUE' | 'FIRE_BURST' | 'EMP_SHOCK';

export interface LogEntry {
    id: string;
    timestamp: number;
    realTimestamp: number;
    category: LogCategory;
    title: string;
    content: string;
    isRead: boolean;
    metadata?: any;
}

export type VisualEvent =
    | { type: 'LOG'; msg: string; color?: string; icon?: string; timestamp?: boolean; detail?: string }
    | { type: 'TEXT'; x?: number; y?: number; position?: 'CENTER' | 'TOP_CENTER'; text: string; style?: 'DAMAGE' | 'RESOURCE' | 'CRIT' | 'HEAL' | 'INFO' | 'EVADE' | 'BLOCKED'; color?: string }
    | { type: 'PARTICLE'; x?: number; y?: number; position?: 'CENTER' | 'DRILL_TIP'; color: string; kind: 'DEBRIS' | 'SPARK' | 'SMOKE'; count: number }
    | { type: 'BOSS_HIT' }
    | { type: 'SOUND'; sfx: 'LOG' | 'GLITCH' | 'ACHIEVEMENT' | 'RAID_ALARM' | 'RAID_SUCCESS' | 'RAID_FAILURE' | 'MARKET_TRADE' }
    | { type: 'SCREEN_SHAKE'; intensity: number; duration: number }
    | { type: 'VISUAL_EFFECT'; option: any }
    | { type: 'PREDICTION'; eventTitle: string; eventType: string; timeRemaining: number; detailLevel: 'BASIC' | 'MEDIUM' | 'FULL' };

export type GameCommand =
    | { type: 'GENERATE_CONTRACTS' }
    | { type: 'CHECK_CONTRACT_EXPIRATION' }
    | { type: 'CHECK_CARAVANS' }
    | { type: 'CHECK_QUESTS' }
    | { type: 'INITIALIZE_BLACK_MARKET' }
    | { type: 'UPDATE_BLACK_MARKET_RISK', deltaHours: number }
    | { type: 'COMPLETE_TRAVEL' }
    | { type: 'SAVE_GAME' }
    | { type: 'QUEST_OBJECTIVE_UPDATE', questId: string, objectiveId: string, value: number }
    | { type: 'PLAY_SOUND', sfx: 'LOG' | 'CLICK' | 'LASER' | 'GLITCH' };
