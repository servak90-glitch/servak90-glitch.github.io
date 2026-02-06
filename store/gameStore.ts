/**
 * GameStore — централизованное состояние игры
 * 
 * Рефакторировано в версии 3.0:
 * - Действия разбиты на слайсы в store/slices/
 * - Этот файл объединяет слайсы и содержит core логику
 */

import { create } from 'zustand';
import {
    GameState, View, Resources, RegionId, EventTrigger,
    PlayerBase, BaseType, BaseStatus, DefenseUnitType, DefenseProductionJob,
    AbilityType, VisualEvent, DrillSlot, DroneType, DialogueState, BaseModuleType,
    GameCommand
} from '../types';
import {
    BITS, ENGINES, COOLERS, HULLS, LOGIC_CORES, CONTROL_UNITS,
    GEARBOXES, POWER_CORES, ARMORS, SHIELD_GENERATORS, CARGO_BAYS
} from '../constants.tsx';
import { gameEngine } from '../services/GameEngine';
// Cooling imported removed
import { calculateStats } from '../services/gameMath';
import { audioEngine } from '../services/audioEngine';

import { abilitySystem } from '../services/systems/AbilitySystem';
import { damageBossWeakPoint } from '../services/systems/CombatSystem';

// Слайсы
import {
    createDrillSlice, DrillActions,
    createCitySlice, CityActions,
    createInventorySlice, InventoryActions,
    createUpgradeSlice, UpgradeActions,
    createEntitySlice, EntityActions,
    createSettingsSlice, SettingsActions,
    createExpeditionSlice, ExpeditionActions,
    createFactionSlice, FactionActions,
    createAdminSlice, AdminActions,
    createEventSlice, EventActions,
    createTravelSlice, TravelActions,
    createLicenseSlice, LicenseActions,
    createBaseSlice, BaseActions,
    createMarketSlice, MarketActions,
    createCaravanSlice, CaravanActions,
    createQuestSlice, QuestActions,
    createCraftSlice, CraftActions,
    createLogbookSlice, LogbookSlice,
    createOperatorSlice, OperatorActions,
    createContractSlice, ContractActions,
    createBlackMarketSlice, BlackMarketActions
} from './slices';
import { GAME_VERSION } from '../constants';

// ВАЖНО: В Node.js среде (валидатор) может быть несколько инстансов стора из-за путей.
// Используем globalThis как синглтон.
declare global {
    var _gameStore: any;
}

interface CoreActions {
    enterGame: () => void;
    exitToMenu: () => void;
    tick: (dt: number) => VisualEvent[];
    resetProgress: () => void;
    manualSave: () => void;
    manualLoad: () => boolean;
    exportSaveString: () => string;
    importSaveString: (str: string) => boolean;
}





// Полный тип store
export interface GameStore extends GameState,
    CoreActions, EventActions, AdminActions,
    DrillActions, CityActions, InventoryActions,
    UpgradeActions, EntityActions, SettingsActions, ExpeditionActions, FactionActions, TravelActions, LicenseActions, BaseActions,
    MarketActions, CaravanActions, QuestActions, CraftActions, LogbookSlice, OperatorActions, ContractActions, BlackMarketActions {
    isGameActive: boolean;
    activeView: View;
    actionLogQueue: VisualEvent[];
    activateAbility: (id: AbilityType) => void;
    damageWeakPoint: (wpId: string) => void;
    addLog: (msg: string, color?: string, icon?: string, detail?: string) => void;

    startDialogue: (state: DialogueState) => void;
    chooseDialogueOption: (choiceIndex: number) => void;
    closeDialogue: () => void;
}

// === НАЧАЛЬНОЕ СОСТОЯНИЕ ===

const INITIAL_STATE: GameState = {
    gameTime: 0,
    timeMultiplier: 1,
    chronos: { seconds: 0, minutes: 0, hours: 0, days: 1, weeks: 1, months: 1, totalHours: 0, totalDays: 0 },
    depth: 0,
    heat: 0,
    integrity: 100,
    currentCargoWeight: 0,  // [CARGO SYSTEM] Начальный вес груза
    currentRegion: RegionId.RUST_VALLEY,  // [GLOBAL MAP] Стартовый регион
    shieldCharge: 100,
    maxShieldCharge: 100,
    isShielding: false,
    resources: {
        clay: 0, stone: 0, copper: 0, iron: 0, silver: 0, gold: 0,
        titanium: 0, uranium: 0, nanoSwarm: 0, ancientTech: 0,
        rubies: 0, emeralds: 0, diamonds: 0,
        // Fuel (MVP)
        coal: 200, oil: 0, gas: 0, ice: 0,  // [REBALANCE] Уменьшено с 500 до 200
        scrap: 0,  // NEW: Phase 2.2 - для разборки equipment
        credits: 0,  // NEW: Phase 2.3 - основная валюта
        repairKit: 0,
        coolantPaste: 0,
        advancedCoolant: 0,
        voidMatter: 0,
        chronoShards: 0
    },
    stats: {
        energyProd: 0, energyCons: 0, energyEfficiency: 1, totalDamage: 0, totalSpeed: 0, totalCooling: 0, torque: 0,
        critChance: 0, luck: 0, predictionTime: 0, clickMult: 1, ventSpeed: 1, defense: 0, evasion: 0,
        hazardResist: 0, integrity: 100, regen: 0, droneEfficiency: 1, drillingEfficiency: 1, ambientHeat: 0,
        requiredTier: 1, skillMods: {}, artifactMods: {}, totalCargoCapacity: 5000,
        // RPG System
        activeDrones: 0,
        rpgMods: {
            gemDropChancePct: 0, luckPct: 0, predictionTime: 0, maxHullPct: 0, damageReductionPct: 0,
            heatCapAdd: 0, coolingEfficiencyPct: 0, craftingCostReductionPct: 0, drillSpeedBasePct: 0,
            cargoCapacityPct: 0, drillTorquePct: 0, critChancePct: 0, evasionPct: 0, bossDamagePct: 0,
            shieldChargeSpeedPct: 0, droneSpeedPct: 0, rareResourceChancePct: 0, hazardRiskReductionPct: 0,
            consumableSaveChancePct: 0
        }
    },
    drill: {
        [DrillSlot.BIT]: BITS[0],
        [DrillSlot.ENGINE]: ENGINES[0],
        [DrillSlot.COOLING]: COOLERS[0],
        [DrillSlot.HULL]: HULLS[0],
        [DrillSlot.LOGIC]: LOGIC_CORES[0],
        [DrillSlot.CONTROL]: CONTROL_UNITS[0],
        [DrillSlot.GEARBOX]: GEARBOXES[0],
        [DrillSlot.POWER]: POWER_CORES[0],
        [DrillSlot.ARMOR]: ARMORS[0],
        [DrillSlot.SHIELD]: SHIELD_GENERATORS[0],
        [DrillSlot.CARGO_BAY]: CARGO_BAYS[0]
    },
    skillLevels: {},
    artifacts: [],
    inventory: {},
    equippedArtifacts: [null, null, null, null] as (string | null)[],
    discoveredArtifacts: [],
    analyzer: { activeItemInstanceId: null, timeLeft: 0, maxTime: 0 },
    activeQuests: [],
    completedQuestIds: [],
    failedQuestIds: [],
    lastQuestRefresh: 0,
    totalDrilled: 0,
    xp: 0,
    level: 1,
    activeEffects: [],
    eventQueue: [],
    recentEventIds: [],
    eventCooldowns: {},

    // === RPG SYSTEM STATE (Phase 5) ===
    operatorId: null,
    unlockedOperators: [],
    hiredCrewIds: [],
    crewLoyalty: {},

    activeDialogue: null,

    pendingPredictions: [],
    flyingObjects: [],
    unlockedBlueprints: [],
    sideTunnel: null,
    currentBoss: null,
    lastBossDepth: 0,
    activeDrones: [],
    droneLevels: { [DroneType.COLLECTOR]: 0, [DroneType.COOLER]: 0, [DroneType.BATTLE]: 0, [DroneType.REPAIR]: 0, [DroneType.MINER]: 0 },
    storageLevel: 0,
    forgeUnlocked: false,
    cityUnlocked: true,  // [REBALANCE] Глобальная карта доступна сразу
    skillsUnlocked: false,

    // === PHASE 3: CONSUMABLES ===
    consumables: {
        repairKit: 0,
        coolantPaste: 0,
        advancedCoolant: 0
    },

    // NARRATIVE STATE
    aiState: 'LUCID',
    narrativeTick: 0,

    // SETTINGS
    // SETTINGS
    settings: { musicVolume: 0.5, sfxVolume: 0.5, drillVolume: 0.5, musicMuted: false, sfxMuted: false, drillMuted: false, language: 'RU', graphicsQuality: 'high' },
    selectedBiome: null,
    debugUnlocked: false,
    isGodMode: false,
    isInfiniteCoolant: false,
    isInfiniteFuel: false,
    isInfiniteEnergy: false,
    isZeroWeight: false,
    // === PHASE 2.3: TRAVEL ===
    travel: null,
    isOverdrive: false,
    isDebugUIOpen: false,
    isDrilling: false,
    isOverheated: false,
    isBroken: false,
    isCoolingGameActive: false,
    heatStabilityTimer: 0,
    bossAttackTick: 0,
    lastInteractTime: Date.now(),

    eventCheckTick: 0,
    combatMinigame: null,
    activeAbilities: [],
    activeExpeditions: [],
    defeatedBosses: [], // Список побежденных боссов для Codex

    // [DEV_CONTEXT: SHIELD],
    minigameCooldown: 0,
    reputation: { CORPORATE: 0, SCIENCE: 0, REBELS: 0 },

    // === LICENSES & PERMITS ===
    globalReputation: 0,
    unlockedLicenses: ['green'],  // стартовая лицензия
    activePermits: {
        [RegionId.RUST_VALLEY]: {
            regionId: RegionId.RUST_VALLEY,
            type: 'permanent',
            expirationDate: null
        }
    },

    // === PLAYER BASES ===
    playerBases: [],

    // === PHASE 2: MARKET & CARAVANS ===
    marketTransactionHistory: [],
    caravans: [],
    caravanUnlocks: [
        { tier: '1star', unlocked: false },
        { tier: '2star', unlocked: false },
        { tier: '3star', unlocked: false },
    ],

    // === PHASE 2.1: CRAFTING QUEUE ===
    craftingQueue: [],  // Пустая очередь крафта

    // === PHASE 2.2: UNIFIED INVENTORY ===
    equipmentInventory: [],  // Пустой инвентарь equipment

    // === PHASE 4: FREE COOLING COOLDOWN ===
    freeCoolingLastUsed: 0,  // Изначально доступно

    // === PHASE 4.1: RAID TIMER ===
    lastRaidCheck: 0,  // Изначально рейды доступны
    eventLastTriggerDay: {}, // История срабатывания событий

    // === PHASE 2.3: ECONOMY & MARKET SATURATION ===
    marketSaturation: {},
    raidRisk: 0,
    marketBlockedUntil: 0,

    // === PHASE 6: STATE CONTRACTS (Госзаказы) ===
    activeContracts: [],
    availableContracts: [],
    completedContractIds: [],
    lastContractGeneration: 0,

    // === PHASE 6.2: BLACK MARKET (Черный рынок) ===
    blackMarkets: {} as Record<RegionId, any>,
    foxReputation: 0,

    logEntries: []
};

// === ПЕРСИСТЕНТНОСТЬ ===

const PERSISTENT_KEYS: (keyof GameState)[] = [
    'depth', 'resources', 'heat', 'integrity', 'xp', 'level', 'drill',
    'inventory', 'equippedArtifacts', 'discoveredArtifacts', 'skillLevels',
    'activeQuests', 'completedQuestIds', 'failedQuestIds', 'settings', 'droneLevels', 'activeDrones',
    'forgeUnlocked', 'cityUnlocked', 'skillsUnlocked', 'storageLevel',
    'lastBossDepth', 'analyzer', 'debugUnlocked', 'selectedBiome',
    'activeEffects', 'eventQueue', 'recentEventIds', 'lastQuestRefresh',
    'shieldCharge', 'currentCargoWeight', 'currentRegion',
    'globalReputation', 'unlockedLicenses', 'activePermits', 'playerBases',
    'marketTransactionHistory', 'caravans', 'caravanUnlocks',  // Phase 2
    'craftingQueue',  // Phase 2.1
    'equipmentInventory',  // Phase 2.2
    'consumables', // NEW: Phase 3
    'unlockedBlueprints',
    'freeCoolingLastUsed',  // Phase 4: Free cooling cooldown
    'gameTime', 'chronos', 'eventLastTriggerDay',
    'logEntries', // Logbook persistence
    'operatorId', 'unlockedOperators', 'hiredCrewIds', 'crewLoyalty', // RPG persistence
    'activeContracts', 'availableContracts', 'completedContractIds', 'lastContractGeneration', // Phase 6: State Contracts
    'blackMarkets', 'foxReputation' // Phase 6.2: Black Market
];

const createSnapshot = (state: GameState): Partial<GameState> => {
    const snapshot: any = {};
    PERSISTENT_KEYS.forEach(key => {
        snapshot[key] = state[key];
    });
    snapshot.version = GAME_VERSION;
    return snapshot;
};

const sanitizeAndMerge = (initial: GameState, saved: any): GameState => {
    if (!saved) return initial;

    const merged: any = { ...initial };

    const deepKeys: (keyof GameState)[] = ['resources', 'settings', 'droneLevels', 'skillLevels', 'chronos', 'eventLastTriggerDay', 'blackMarkets'];
    const arrayKeys: (keyof GameState)[] = [
        'inventory', 'equippedArtifacts', 'discoveredArtifacts',
        'activeQuests', 'completedQuestIds', 'failedQuestIds',
        'activeEffects', 'eventQueue', 'recentEventIds', 'activeDrones',
        'playerBases', 'caravans', 'caravanUnlocks', 'artifacts',
        'activeContracts', 'availableContracts', 'completedContractIds'  // Phase 6
    ];
    const primitiveKeys: (keyof GameState)[] = [
        'depth', 'heat', 'integrity', 'xp', 'level', 'totalDrilled',
        'lastBossDepth', 'storageLevel', 'forgeUnlocked', 'cityUnlocked', 'skillsUnlocked',
        'selectedBiome', 'debugUnlocked', 'lastQuestRefresh', 'shieldCharge', 'minigameCooldown',
        'currentCargoWeight', 'currentRegion', 'globalReputation', 'gameTime', 'lastContractGeneration', 'foxReputation'
    ];

    deepKeys.forEach(key => {
        if (saved[key] && typeof saved[key] === 'object' && !Array.isArray(saved[key])) {
            merged[key] = { ...initial[key as any], ...saved[key] };
        }
    });

    arrayKeys.forEach(key => {
        if (saved[key] !== undefined) {
            // КРИТИЧЕСКАЯ ПРОВЕРКА: Если сохраненное значение не массив (например {}), 
            // используем начальный массив, чтобы не сломать .map/.filter
            if (Array.isArray(saved[key])) {
                merged[key] = saved[key];
            } else {
                console.warn(`[STATE SANITIZER] Ключ ${key} в сохранении не является массивом. Использовано значение по умолчанию.`);
                merged[key] = initial[key];
            }
        }
    });

    primitiveKeys.forEach(key => {
        if (saved[key] !== undefined) {
            merged[key] = saved[key];
        }
    });

    // Специальная обработка для объектов, которые могут быть null
    if (saved.analyzer) merged.analyzer = saved.analyzer;
    if (saved.drill && typeof saved.drill === 'object') {
        merged.drill = { ...initial.drill, ...saved.drill };
    }

    return merged as GameState;
};

const SAVE_KEY = 'COSMIC_HARDCORE_SAVE';

// === STORE ===

export const useGameStore = create<GameStore>((set, get) => ({
    ...INITIAL_STATE,
    isGameActive: false,
    activeView: View.DRILL,
    actionLogQueue: [],

    // === СЛАЙСЫ (Действия из модулей) ===
    ...createDrillSlice(set, get),
    ...createCitySlice(set, get),
    ...createInventorySlice(set, get),
    ...createUpgradeSlice(set, get),
    ...createEntitySlice(set, get),
    ...createSettingsSlice(set, get),
    ...createExpeditionSlice(set, get),
    ...createFactionSlice(set, get),
    ...createAdminSlice(set, get),
    ...createEventSlice(set, get),
    ...createTravelSlice(set, get),
    ...createLicenseSlice(set, get),
    ...createBaseSlice(set, get),
    ...createMarketSlice(set, get),
    ...createCaravanSlice(set, get),
    ...createQuestSlice(set, get),
    ...createCraftSlice(set, get),
    ...createLogbookSlice(set, get),
    ...createOperatorSlice(set, get),
    ...createContractSlice(set, get),
    ...createBlackMarketSlice(set, get),

    // === CORE ACTIONS ===

    enterGame: () => set({ isGameActive: true }),

    exitToMenu: () => {
        set({ isGameActive: false, activeView: View.DRILL });
    },

    manualSave: () => {
        const state = get();
        const snapshot = createSnapshot(state);

        try {
            const stringified = JSON.stringify(snapshot);
            localStorage.setItem(SAVE_KEY, stringified);
            set(s => ({ actionLogQueue: [...s.actionLogQueue, { type: 'LOG', msg: 'ПРОГРЕСС ЗАПИСАН В ЧЕРНЫЙ ЯЩИК', color: 'text-green-500 font-bold' }] }));
            audioEngine.playLog();
        } catch (e) {
            console.error("Save failed", e);
            set(s => ({ actionLogQueue: [...s.actionLogQueue, { type: 'LOG', msg: 'ОШИБКА ЗАПИСИ ДАННЫХ', color: 'text-red-500 font-bold' }] }));
        }
    },

    manualLoad: () => {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return false;

            const saved = JSON.parse(raw);
            const merged = sanitizeAndMerge(INITIAL_STATE, saved);

            // === MIGRATION: Add shield slot if missing ===
            if (merged.drill && !merged.drill[DrillSlot.SHIELD]) {
                merged.drill[DrillSlot.SHIELD] = SHIELD_GENERATORS[0];
            }

            // === MIGRATION: Add modules to bases if missing ===
            if (merged.playerBases) {
                merged.playerBases = merged.playerBases.map((b: any) => ({
                    ...b,
                    modules: b.modules || [
                        { type: BaseModuleType.SCIENCE, level: 0, unlocked: false, status: 'DISABLED' },
                        { type: BaseModuleType.LOGISTICS, level: 0, unlocked: false, status: 'DISABLED' },
                        { type: BaseModuleType.INDUSTRIAL, level: 0, unlocked: false, status: 'DISABLED' },
                        { type: BaseModuleType.DRONE_COMMAND, level: 0, unlocked: false, status: 'DISABLED' }
                    ]
                }));
            }

            set({ ...merged, isGameActive: false, actionLogQueue: [{ type: 'LOG', msg: 'СИСТЕМА ВОССТАНОВЛЕНА', color: 'text-cyan-400' }] });
            return true;
        } catch (e) {
            console.error("Load failed", e);
            return false;
        }
    },

    tick: (dt: number) => {
        const s = get();
        // Применяем множитель времени (Debug/DevTool)
        const effectiveDt = dt * (s.timeMultiplier || 1);
        const { partialState, events, commands } = gameEngine.tick(s, effectiveDt, Date.now());

        // Обработка команд от ядра симуляции
        commands.forEach(cmd => {
            switch (cmd.type) {
                case 'CHECK_CARAVANS':
                    s.checkAllCaravans?.();
                    break;
                case 'CHECK_QUESTS':
                    s.checkAllQuestsProgress?.();
                    break;
                case 'CHECK_CONTRACT_EXPIRATION':
                    s.checkContractExpiration?.();
                    break;
                case 'GENERATE_CONTRACTS':
                    s.generateDailyContracts?.();
                    break;
                case 'INITIALIZE_BLACK_MARKET':
                    s.initializeBlackMarkets?.();
                    break;
                case 'UPDATE_BLACK_MARKET_RISK':
                    s.updateBlackMarketRisk?.(cmd.deltaHours);
                    break;
                case 'QUEST_OBJECTIVE_UPDATE':
                    s.activeQuests.forEach(quest => {
                        quest.objectives.forEach(obj => {
                            if (obj.target === cmd.objectiveId) {
                                s.updateQuestObjective(quest.id, obj.id, obj.current + cmd.value);
                            }
                        });
                    });
                    break;
                case 'COMPLETE_TRAVEL':
                    s.completeTravel();
                    break;
                case 'SAVE_GAME':
                    s.manualSave();
                    break;
                case 'PLAY_SOUND':
                    if (cmd.sfx === 'LOG') audioEngine.playLog();
                    if (cmd.sfx === 'CLICK') audioEngine.playClick();
                    if (cmd.sfx === 'LASER') audioEngine.playLaser();
                    if (cmd.sfx === 'GLITCH') audioEngine.playGlitch();
                    break;
            }
        });

        let nextView = s.activeView;

        const wasBossActive = !!s.currentBoss;
        const isBossActive = !!partialState.currentBoss;

        if (isBossActive && !wasBossActive) {
            nextView = View.COMBAT;
        } else if (!isBossActive && wasBossActive) {
            nextView = View.DRILL;
        }

        // === НОВОЕ: Проверка Crafting Queue ===
        const now = Date.now();
        let queueUpdated = false;
        const updatedQueue = s.craftingQueue.map(job => {
            if (job.status === 'in_progress' && job.completionTime <= now) {
                queueUpdated = true;
                return { ...job, status: 'ready_to_collect' as const };
            }
            return job;
        });

        // Добавить notifications для завершенных заданий
        if (queueUpdated) {
            const completedJobs = updatedQueue.filter(
                (j, idx) => j.status === 'ready_to_collect' && s.craftingQueue[idx]?.status === 'in_progress'
            );

            completedJobs.forEach(job => {
                events.push({
                    type: 'LOG',
                    msg: `🔔 КРАФТ ЗАВЕРШЁН: ${job.partId}! Заберите в Forge.`,
                    color: 'text-green-400 font-bold'
                });
            });

            if (completedJobs.length > 0) {
                audioEngine.playLog();  // Звук уведомления
            }
        }

        // Logic moved to commands (CHECK_CARAVANS, COMPLETE_TRAVEL, etc.)

        const queue = s.actionLogQueue;
        const allEvents = [...events, ...queue];

        set({
            ...partialState,
            activeView: nextView,
            actionLogQueue: [],
            craftingQueue: updatedQueue
        });

        // Audio Engine Update (Generative Music & Ambiance)
        const currentHeat = partialState.heat !== undefined ? partialState.heat : s.heat;
        const currentDepth = partialState.depth !== undefined ? partialState.depth : s.depth;
        const currentIntegrity = partialState.integrity !== undefined ? partialState.integrity : s.integrity;
        const currentOverheat = (partialState as any).isOverheated !== undefined ? (partialState as any).isOverheated : s.isOverheated;

        audioEngine.update(
            currentHeat,
            currentDepth,
            currentOverheat,
            isBossActive,
            currentIntegrity <= 0,
            undefined, // Resource type not yet tracked in store
            s.isDrilling || !!(partialState as any).isDrilling
        );



        // Handle audio events from tick
        events.forEach(e => {
            if (e.type === 'SOUND' && e.sfx) {
                if (e.sfx === 'LOG') audioEngine.playLog();
                if (e.sfx === 'GLITCH') audioEngine.playGlitch();
            }
        });

        return allEvents;
    },

    resetProgress: () => {
        set({ ...INITIAL_STATE, isGameActive: true });
        localStorage.removeItem(SAVE_KEY);
        audioEngine.playLog();
    },

    exportSaveString: () => {
        const state = get();
        const snapshot = createSnapshot(state);
        try {
            const json = JSON.stringify(snapshot);
            const utf8Bytes = encodeURIComponent(json).replace(/%([0-9A-F]{2})/g,
                (match, p1) => String.fromCharCode(parseInt(p1, 16))
            );
            return btoa(utf8Bytes);
        } catch (e) {
            console.error("Export generation failed", e);
            return "";
        }
    },

    importSaveString: (str) => {
        try {
            const binaryString = atob(str);
            const jsonString = decodeURIComponent(binaryString.split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const data = JSON.parse(jsonString);

            localStorage.setItem(SAVE_KEY, jsonString);
            const merged = sanitizeAndMerge(INITIAL_STATE, data);
            set(merged);
            return true;
        } catch (e) {
            console.error("Import failed", e);
            return false;
        }
    },



    // === ABILITY ACTIONS ===
    activateAbility: (id: AbilityType) => {
        const s = get();
        if (abilitySystem.canActivate(id, s.heat)) {
            abilitySystem.activate(id);
            set({ activeAbilities: abilitySystem.getAllStates() });

            const def = abilitySystem.getAbilityDef(id);
            if (def.heatCost !== 0) {
                set(state => ({ heat: Math.max(0, Math.min(100, state.heat + def.heatCost)) }));
            }

            audioEngine.playClick();

            // [VISUAL POLISH] Trigger effects based on ability
            const newEvents: VisualEvent[] = [];
            if (id === 'THERMAL_STRIKE') {
                newEvents.push({ type: 'PARTICLE', kind: 'SPARK', count: 60, color: '0xFF4400', position: 'DRILL_TIP' });
                newEvents.push({ type: 'VISUAL_EFFECT', option: 'GLITCH_RED' }); // Quick glitch
            } else if (id === 'EMP_BURST') {
                newEvents.push({ type: 'PARTICLE', kind: 'SPARK', count: 40, color: '0x00FFFF', position: 'CENTER' });
            } else if (id === 'OVERLOAD') {
                newEvents.push({ type: 'PARTICLE', kind: 'SMOKE', count: 30, color: '0xFF0000', position: 'DRILL_TIP' });
            }

            if (newEvents.length > 0) {
                set(s => ({ actionLogQueue: [...s.actionLogQueue, ...newEvents] }));
            }
        }
    },

    damageWeakPoint: (wpId: string) => {
        const s = get();
        if (!s.currentBoss) return;

        const stats = calculateStats(s.drill, s.skillLevels, s.equippedArtifacts, s.inventory, s.depth, s.activeEffects, s.operatorId, s.hiredCrewIds);
        const clickDamage = stats.totalDamage * stats.clickMult;

        const res = damageBossWeakPoint(s.currentBoss, wpId, clickDamage);
        if (res.damageDealt > 0) {
            audioEngine.playLaser();
            set({ currentBoss: res.boss });
        }
    },

    addLog: (msg: string, color?: string, icon?: string, detail?: string) => {
        const s = get();
        const event: VisualEvent = { type: 'LOG', msg, color, icon, detail };
        set({ actionLogQueue: [...s.actionLogQueue, event] });
    },

    // === DIALOGUE ACTIONS ===
    startDialogue: (state) => set({ activeDialogue: state }),
    chooseDialogueOption: (choiceIndex) => {
        const { activeDialogue } = get();
        if (!activeDialogue) return;

        const node = activeDialogue.nodes[activeDialogue.currentNodeId];
        const choice = node.choices[choiceIndex];

        if (choice) {
            if (choice.onSelect) choice.onSelect();

            if (choice.nextId) {
                set({
                    activeDialogue: {
                        ...activeDialogue,
                        currentNodeId: choice.nextId
                    }
                });
            } else {
                get().closeDialogue();
            }
        }
    },
    closeDialogue: () => {
        const { activeDialogue } = get();
        if (activeDialogue?.onClose) activeDialogue.onClose();
        set({ activeDialogue: null });
    },
}));

// [DEV_CONTEXT: CHEAT ACCESS]
if (typeof globalThis !== 'undefined') {
    (globalThis as any).gameStore = useGameStore;
}

// Принудительная фиксация для Node.js (валидатор), чтобы все модули видели один инстанс
if (typeof globalThis !== 'undefined' && !(globalThis as any)._gameStore) {
    (globalThis as any)._gameStore = useGameStore;
}

// Мгновенный доступ для тестов и агента
if (typeof window !== 'undefined') {
    (window as any).forceDev = () => {
        const s = useGameStore.getState();
        s.adminUnlockAll();
        s.toggleDebugUI(true);
        console.log("🛠️ OMEGA TERMINAL UNLOCKED");
    };
}
