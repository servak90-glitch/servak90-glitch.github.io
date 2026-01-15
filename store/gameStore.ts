/**
 * GameStore — централизованное состояние игры
 * 
 * Рефакторировано в версии 3.0:
 * - Действия разбиты на слайсы в store/slices/
 * - Этот файл объединяет слайсы и содержит core логику
 */

import { create } from 'zustand';
import {
    GameState, View, Resources, GameSettings, GameEvent, ResourceType,
    InventoryItem, FlyingObject, VisualEvent, BossType, DrillSlot,
    DroneType, ArtifactRarity
} from '../types';
import {
    BIOMES, BITS, ENGINES, COOLERS, HULLS, LOGIC_CORES, CONTROL_UNITS,
    GEARBOXES, POWER_CORES, ARMORS, DRONES, FUSION_RECIPES
} from '../constants';
import { gameEngine } from '../services/GameEngine';
import { coolingManager } from '../services/CoolingManager'; // NEW
import { calculateStats, getResourceLabel, calculateRepairCost, calculateShieldRechargeCost } from '../services/gameMath';
import { audioEngine } from '../services/audioEngine';
import { generateQuestBatch } from '../services/questRegistry';
import { ARTIFACTS, rollArtifact } from '../services/artifactRegistry';
import { createEffect } from '../services/eventRegistry';
import { generateBoss } from '../services/bossRegistry';
import { SKILLS, getSkillCost } from '../services/skillRegistry';

// Слайсы
import {
    GameStore as GameStoreType,
    createDrillSlice, DrillActions,
    createCitySlice, CityActions,
    createInventorySlice, InventoryActions,
    createUpgradeSlice, UpgradeActions,
    createEntitySlice, EntityActions,
    createSettingsSlice, SettingsActions
} from './slices';

// === ИНТЕРФЕЙСЫ ===

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

interface EventActions {
    handleEventOption: (optionId?: string) => void;
    completeCombatMinigame: (success: boolean) => void;
    setCoolingGame: (active: boolean) => void;
    forceVentHeat: (amount: number) => void;
    triggerOverheat: () => void;
    attemptVent: () => void; // NEW
}

interface AdminActions {
    adminAddResources: (common: number, rare: number) => void;
    adminResetResources: () => void;
    adminAddArtifact: (defId: string) => void;
    adminSetGodMode: (enabled: boolean) => void;
    adminSetInfiniteCoolant: (enabled: boolean) => void;
    adminSetOverdrive: (enabled: boolean) => void;
    adminUnlockAll: () => void;
    adminMaxTech: () => void;
    adminSetDepth: (depth: number) => void;
    adminSkipBiome: () => void;
    adminSpawnBoss: () => void;
    adminTriggerEvent: (eventId: string) => void;
    adminClearEvents: () => void;
}

// Полный тип store
interface GameStore extends GameState,
    CoreActions, EventActions, AdminActions,
    DrillActions, CityActions, InventoryActions,
    UpgradeActions, EntityActions, SettingsActions {
    isGameActive: boolean;
    activeView: View;
    actionLogQueue: VisualEvent[];
}

// === НАЧАЛЬНОЕ СОСТОЯНИЕ ===

const INITIAL_STATE: GameState = {
    depth: 0,
    heat: 0,
    integrity: 100,
    shieldCharge: 100,
    maxShieldCharge: 100,
    isShielding: false,
    resources: { clay: 0, stone: 0, copper: 0, iron: 0, silver: 0, gold: 0, titanium: 0, uranium: 0, nanoSwarm: 0, ancientTech: 0, rubies: 0, emeralds: 0, diamonds: 0 },
    drill: {
        [DrillSlot.BIT]: BITS[0],
        [DrillSlot.ENGINE]: ENGINES[0],
        [DrillSlot.COOLING]: COOLERS[0],
        [DrillSlot.HULL]: HULLS[0],
        [DrillSlot.LOGIC]: LOGIC_CORES[0],
        [DrillSlot.CONTROL]: CONTROL_UNITS[0],
        [DrillSlot.GEARBOX]: GEARBOXES[0],
        [DrillSlot.POWER]: POWER_CORES[0],
        [DrillSlot.ARMOR]: ARMORS[0]
    },
    skillLevels: {},
    artifacts: [],
    inventory: {},
    equippedArtifacts: [null, null, null] as (string | null)[],
    discoveredArtifacts: [],
    analyzer: { activeItemInstanceId: null, timeLeft: 0, maxTime: 0 },
    activeQuests: {},
    lastQuestRefresh: 0,
    totalDrilled: 0,
    xp: 0,
    level: 1,
    activeEffects: [],
    eventQueue: [],
    recentEventIds: [],
    flyingObjects: [],
    currentBoss: null,
    lastBossDepth: 0,
    activeDrones: [],
    droneLevels: { [DroneType.COLLECTOR]: 0, [DroneType.COOLER]: 0, [DroneType.BATTLE]: 0, [DroneType.REPAIR]: 0, [DroneType.MINER]: 0 },
    storageLevel: 0,
    forgeUnlocked: false,
    cityUnlocked: false,
    skillsUnlocked: false,

    // NARRATIVE STATE
    aiState: 'LUCID',
    narrativeTick: 0,

    // COOLING STATE
    cooling: {
        isActive: false,
        pulseSize: 1.0,
        targetSize: 1.0,
        perfectWindow: 0.15,
        goodWindow: 0.4,
        combo: 0,
        cooldownTimer: 0
    },
    // SETTINGS
    settings: { musicVolume: 0.5, sfxVolume: 0.5, musicMuted: false, sfxMuted: false, language: 'RU' },
    selectedBiome: null,
    debugUnlocked: false,
    isGodMode: false,
    isInfiniteCoolant: false,
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
    combatMinigame: null
};

// === ПЕРСИСТЕНТНОСТЬ ===

const PERSISTENT_KEYS: (keyof GameState)[] = [
    'depth', 'resources', 'heat', 'integrity', 'xp', 'level', 'drill',
    'inventory', 'equippedArtifacts', 'discoveredArtifacts', 'skillLevels',
    'activeQuests', 'settings', 'droneLevels', 'activeDrones',
    'forgeUnlocked', 'cityUnlocked', 'skillsUnlocked', 'storageLevel',
    'lastBossDepth', 'analyzer', 'debugUnlocked', 'selectedBiome',
    'activeEffects', 'eventQueue', 'recentEventIds', 'lastQuestRefresh',
    'shieldCharge'
];

const createSnapshot = (state: GameState): Partial<GameState> => {
    const snapshot: any = {};
    PERSISTENT_KEYS.forEach(key => {
        snapshot[key] = state[key];
    });
    return snapshot;
};

const sanitizeAndMerge = (initial: GameState, saved: any): GameState => {
    if (!saved) return initial;

    const merged: any = { ...initial };

    const deepKeys: (keyof GameState)[] = ['resources', 'settings', 'droneLevels', 'skillLevels'];
    const keepKeys: (keyof GameState)[] = [
        'drill', 'inventory', 'equippedArtifacts', 'discoveredArtifacts',
        'analyzer', 'activeQuests', 'activeEffects', 'eventQueue',
        'recentEventIds', 'activeDrones'
    ];
    const primitiveKeys: (keyof GameState)[] = [
        'depth', 'heat', 'integrity', 'xp', 'level', 'totalDrilled',
        'lastBossDepth', 'storageLevel', 'forgeUnlocked', 'cityUnlocked', 'skillsUnlocked',
        'selectedBiome', 'debugUnlocked', 'lastQuestRefresh', 'shieldCharge'
    ];

    deepKeys.forEach(key => {
        if (saved[key]) {
            merged[key] = { ...initial[key as any], ...saved[key] };
        }
    });

    keepKeys.forEach(key => {
        if (saved[key] !== undefined) {
            merged[key] = saved[key];
        }
    });

    primitiveKeys.forEach(key => {
        if (saved[key] !== undefined) {
            merged[key] = saved[key];
        }
    });

    if (!merged.drill || !merged.drill[DrillSlot.BIT]) {
        merged.drill = initial.drill;
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

            set({ ...merged, actionLogQueue: [{ type: 'LOG', msg: 'СИСТЕМА ВОССТАНОВЛЕНА', color: 'text-cyan-400' }] });
            return true;
        } catch (e) {
            console.error("Load failed", e);
            return false;
        }
    },

    tick: (dt: number) => {
        const s = get();
        const { partialState, events } = gameEngine.tick(s, dt);

        let nextView = s.activeView;

        const wasBossActive = !!s.currentBoss;
        const isBossActive = !!partialState.currentBoss;

        if (isBossActive && !wasBossActive) {
            nextView = View.COMBAT;
        } else if (!isBossActive && wasBossActive) {
            nextView = View.DRILL;
        }

        const queue = s.actionLogQueue;
        const allEvents = [...events, ...queue];

        set({ ...partialState, activeView: nextView, actionLogQueue: [] });
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

    // === EVENT ACTIONS ===

    handleEventOption: (optionId) => {
        const s = get();
        const event = s.eventQueue[0];
        if (!event) return;

        const newQueue = s.eventQueue.slice(1);
        const updates: Partial<GameState> = { eventQueue: newQueue };
        const logs: VisualEvent[] = [];

        const grantArtifact = () => {
            const def = rollArtifact(s.depth, calculateStats(s.drill, s.skillLevels, s.equippedArtifacts, s.inventory, s.depth).luck, s.selectedBiome || undefined);
            const id = Math.random().toString(36).substr(2, 9);
            const newItem: InventoryItem = { instanceId: id, defId: def.id, acquiredAt: Date.now(), isIdentified: false, isEquipped: false };
            const newInv = { ...s.inventory, [id]: newItem };
            updates.inventory = newInv;
            if (s.storageLevel === 0) updates.storageLevel = 1;
            logs.push({ type: 'LOG', msg: 'ПОЛУЧЕН АРТЕФАКТ: ???', color: 'text-purple-400 font-bold' });
            logs.push({ type: 'SOUND', sfx: 'ACHIEVEMENT' });
        };

        if (optionId) {
            audioEngine.playClick();
            switch (optionId) {
                case 'tectonic_hold':
                    updates.integrity = Math.max(0, s.integrity - 30);
                    logs.push({ type: 'TEXT', x: window.innerWidth / 2, y: window.innerHeight / 2, text: '-30 HP', style: 'DAMAGE' });
                    logs.push({ type: 'LOG', msg: '>> УДЕРЖАНИЕ: ПОВРЕЖДЕНИЕ ОБШИВКИ', color: 'text-red-500' });
                    break;
                case 'tectonic_push':
                    updates.depth = s.depth + 1500;
                    updates.heat = Math.min(100, s.heat + 40);
                    logs.push({ type: 'LOG', msg: '>> ФОРСАЖ: ГЛУБИНА +1500м', color: 'text-orange-400' });
                    break;
                case 'pod_laser':
                    if (Math.random() > 0.5) {
                        logs.push({ type: 'LOG', msg: '>> ЛАЗЕР УНИЧТОЖИЛ СОДЕРЖИМОЕ', color: 'text-red-400' });
                    } else {
                        const r = { ...s.resources };
                        r.ancientTech += 20;
                        updates.resources = r;
                        logs.push({ type: 'LOG', msg: '>> ВСКРЫТИЕ: +20 ANCIENT TECH', color: 'text-green-400' });
                    }
                    break;
                case 'pod_hack':
                    const rh = { ...s.resources };
                    rh.ancientTech += 5;
                    updates.resources = rh;
                    logs.push({ type: 'LOG', msg: '>> ДЕШИФРОВКА: +5 ANCIENT TECH', color: 'text-green-400' });
                    break;
                case 'accept_fluctuation':
                    const eff = createEffect('QUANTUM_FLUCTUATION_EFFECT');
                    if (eff) updates.activeEffects = [...s.activeEffects, { ...eff, id: eff.id + '_' + Date.now() }];
                    updates.heat = 90;
                    logs.push({ type: 'LOG', msg: '>> РИСК ПРИНЯТ: РЕСУРСЫ x5', color: 'text-purple-400' });
                    break;
                case 'reject_fluctuation':
                    logs.push({ type: 'LOG', msg: '>> СТАБИЛИЗАЦИЯ ВЫПОЛНЕНА', color: 'text-zinc-400' });
                    break;
                case 'ai_trust':
                    updates.depth = s.depth + 3000;
                    updates.heat = Math.min(100, s.heat + 20);
                    logs.push({ type: 'LOG', msg: '>> МАРШРУТ ИИ: +3000м', color: 'text-cyan-400' });
                    break;
                case 'ai_reboot':
                    updates.heat = 0;
                    logs.push({ type: 'LOG', msg: '>> ПЕРЕЗАГРУЗКА: ОХЛАЖДЕНИЕ', color: 'text-blue-400' });
                    break;
                case 'purge_nanomites':
                    const rn = { ...s.resources };
                    rn.nanoSwarm += 50;
                    updates.resources = rn;
                    logs.push({ type: 'LOG', msg: '>> ОЧИСТКА: +50 NANO SWARM', color: 'text-green-400' });
                    break;
                case 'crystal_absorb':
                    const rc = { ...s.resources };
                    rc.diamonds += 2;
                    updates.resources = rc;
                    updates.heat = Math.min(100, s.heat + 50);
                    logs.push({ type: 'LOG', msg: '>> ПОГЛОЩЕНИЕ: +2 АЛМАЗА', color: 'text-cyan-400' });
                    break;
            }
        }
        else {
            if (event.effectId) {
                const effect = createEffect(event.effectId);
                if (effect) {
                    updates.activeEffects = [...s.activeEffects, { ...effect, id: effect.id + '_' + Date.now() }];
                    logs.push({ type: 'LOG', msg: `>> НАЛОЖЕН ЭФФЕКТ: ${effect.name}`, color: 'text-yellow-400' });
                }
            }
            if (event.forceArtifactDrop) {
                grantArtifact();
            }
        }

        set({ ...updates, actionLogQueue: [...s.actionLogQueue, ...logs] });
    },

    completeCombatMinigame: (success) => {
        const s = get();
        set({ combatMinigame: null });

        if (s.currentBoss) {
            if (success) {
                const newBoss = {
                    ...s.currentBoss,
                    currentHp: s.currentBoss.currentHp - (s.currentBoss.maxHp * 0.25),
                    isInvulnerable: false
                };
                set({ currentBoss: newBoss });
                audioEngine.playExplosion();
            } else {
                const newBoss = { ...s.currentBoss, isInvulnerable: false };
                set({
                    integrity: Math.max(0, s.integrity - 20),
                    currentBoss: newBoss
                });
                audioEngine.playAlarm();
            }
        }
    },

    setCoolingGame: (active) => set({ isCoolingGameActive: active }),
    forceVentHeat: (amount) => set(s => ({ heat: Math.max(0, s.heat - amount) })),
    triggerOverheat: () => set(s => {
        const dmg = Math.ceil(s.drill.hull.baseStats.maxIntegrity * 0.2);
        return {
            heat: 100,
            isOverheated: true,
            integrity: Math.max(0, s.integrity - dmg),
            isCoolingGameActive: false
        };
    }),

    // === ADMIN ACTIONS ===

    adminAddResources: (c, r) => set(s => {
        const nr = { ...s.resources };
        Object.keys(nr).forEach(k => {
            if (['clay', 'stone', 'copper', 'iron', 'silver', 'gold'].includes(k)) nr[k as ResourceType] += c;
            else nr[k as ResourceType] += r;
        });
        return { resources: nr };
    }),

    adminResetResources: () => set({ resources: INITIAL_STATE.resources }),

    adminAddArtifact: (defId) => {
        const s = get();
        const id = Math.random().toString(36).substr(2, 9);
        set({ inventory: { ...s.inventory, [id]: { instanceId: id, defId, acquiredAt: Date.now(), isIdentified: true, isEquipped: false } } });
    },

    adminSetGodMode: (v) => set({ isGodMode: v }),
    adminSetInfiniteCoolant: (v) => set({ isInfiniteCoolant: v }),
    adminSetOverdrive: (v) => set({ isOverdrive: v }),
    adminUnlockAll: () => set({ forgeUnlocked: true, cityUnlocked: true, skillsUnlocked: true, storageLevel: 2 }),
    adminMaxTech: () => set(s => ({ resources: { ...s.resources, ancientTech: 99999, nanoSwarm: 99999 } })),

    adminSetDepth: (d) => set(s => ({
        depth: d,
        selectedBiome: null,
        actionLogQueue: [...s.actionLogQueue, { type: 'LOG', msg: `>> WARP JUMP TO ${d}m`, color: 'text-purple-400 font-bold' }]
    })),

    adminSkipBiome: () => set(s => ({ depth: s.depth + 5000, selectedBiome: null })),

    adminSpawnBoss: () => {
        const s = get();
        const boss = generateBoss(s.depth, "Force Spawn");
        set({ currentBoss: boss, activeView: View.COMBAT });
        audioEngine.playAlarm();
    },

    adminTriggerEvent: (id) => set(s => ({ recentEventIds: [], eventCheckTick: 1000 })),
    adminClearEvents: () => set({ eventQueue: [] }),
}));
