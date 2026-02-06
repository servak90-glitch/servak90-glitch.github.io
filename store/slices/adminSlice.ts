
import { SliceCreator } from './types';
import { ResourceType, View, Resources, DroneType, BaseType, BaseModuleType, RegionId } from '../../types';
import { EVENTS } from '../../services/eventRegistry';
import { generateBoss } from '../../services/bossRegistry';
import { audioEngine } from '../../services/audioEngine';
import { REGION_IDS } from '../../constants/regions';
import { sideTunnelSystem } from '../../services/systems/SideTunnelSystem';
import { SKILLS } from '../../services/skillRegistry';
import { raidSystem } from '../../services/systems/RaidSystem';
import { economySystem } from '../../services/systems/EconomySystem';
import { calculateChronosTime } from '../../services/systems/TimeSystem';

export interface AdminActions {
    adminAddResources: (common: number, rare: number) => void;
    adminResetResources: () => void;
    adminAddArtifact: (defId: string) => void;
    adminSetGodMode: (enabled: boolean) => void;
    adminSetInfiniteCoolant: (enabled: boolean) => void;
    adminSetInfiniteFuel: (enabled: boolean) => void;
    adminSetInfiniteEnergy: (enabled: boolean) => void;
    adminSetZeroWeight: (enabled: boolean) => void;
    adminSetOverdrive: (enabled: boolean) => void;
    adminUnlockAll: () => void;
    adminUnlockLicenses: () => void;
    adminUnlockAllPermits: () => void;
    adminMaxFactionReputation: () => void;
    adminInstantConstruction: () => void;
    adminKillBoss: () => void;
    adminMaxTech: () => void;
    adminSetDepth: (depth: number) => void;
    adminSkipBiome: () => void;
    adminSpawnBoss: () => void;
    adminTriggerEvent: (eventId: string) => void;
    adminClearEvents: () => void;
    adminMaxSkills: () => void;
    adminCompleteActiveQuests: () => void;
    adminIdentifyAll: () => void;
    adminMaxDrones: () => void;
    adminInstantHeal: () => void;
    adminAddXP: (amount: number) => void;
    adminForceRaid: () => void;
    adminAddLevel: (amount: number) => void;
    adminClearEffects: () => void;
    adminResetFreeCoolingCooldown: () => void;
    adminSetTimeMultiplier: (multiplier: number) => void;
    adminSkipTime: (seconds: number) => void;
    adminTeleportRegion: (regionId: string) => void;
    adminUnlockLicense: (type: string) => void;
    adminCreateBase: (type: BaseType) => void;
    adminUnlockCaravan: (tier: string) => void;
    adminSetCargo: (amount: number) => void;
}

export const createAdminSlice: SliceCreator<AdminActions> = (set, get) => ({
    adminAddResources: (c, r) => set(s => {
        const nr = { ...s.resources };
        Object.keys(nr).forEach(k => {
            const key = k as ResourceType;
            if (['clay', 'stone', 'copper', 'iron', 'silver', 'gold', 'coal', 'oil', 'gas', 'ice', 'scrap'].includes(key)) {
                nr[key] += c;
            } else if (key !== 'credits') {
                nr[key] += r;
            }
        });
        return { resources: nr };
    }),

    adminResetResources: () => set(() => ({
        resources: {
            clay: 0, stone: 0, copper: 0, iron: 0, silver: 0, gold: 0,
            titanium: 0, uranium: 0, nanoSwarm: 0, ancientTech: 0,
            rubies: 0, emeralds: 0, diamonds: 0,
            coal: 0, oil: 0, gas: 0,
            ice: 0, scrap: 0, credits: 0,
            repairKit: 0, coolantPaste: 0, advancedCoolant: 0,
            voidMatter: 0, chronoShards: 0
        }
    })),

    adminAddArtifact: (defId) => {
        const s = get();
        const id = Math.random().toString(36).substr(2, 9);
        set({ inventory: { ...s.inventory, [id]: { instanceId: id, defId, acquiredAt: Date.now(), isIdentified: true, isEquipped: false } } });
    },

    adminSetGodMode: (v) => set({ isGodMode: v }),
    adminSetInfiniteCoolant: (v) => set({ isInfiniteCoolant: v }),
    adminSetInfiniteFuel: (v) => set({ isInfiniteFuel: v }),
    adminSetInfiniteEnergy: (v) => set({ isInfiniteEnergy: v }),
    adminSetZeroWeight: (v) => set({ isZeroWeight: v }),
    adminSetOverdrive: (v) => set({ isOverdrive: v }),

    adminUnlockAll: () => {
        const s = get();
        let updatedBases = [...s.playerBases];

        REGION_IDS.forEach(id => {
            const hasBaseInRegion = updatedBases.find(b => b.regionId === id);
            if (!hasBaseInRegion) {
                updatedBases.push({
                    id: `dev_base_${id}_${Date.now()}`,
                    regionId: id,
                    type: 'station' as const,
                    status: 'active' as const,
                    storageCapacity: 10000,
                    storedResources: {},
                    hasWorkshop: true,
                    workshopTierRange: [1, 10] as [number, number],
                    hasFuelFacilities: true,
                    hasMarket: true,
                    hasFortification: true,
                    hasGuards: true,
                    constructionStartTime: Date.now(),
                    constructionCompletionTime: Date.now(),
                    lastVisitedAt: Date.now(),
                    upgradeLevel: 1,
                    facilities: [],
                    defense: {
                        integrity: 100,
                        shields: 0,
                        infantry: 10,
                        drones: 10,
                        turrets: 5
                    },
                    productionQueue: [],
                    modules: [
                        { type: BaseModuleType.SCIENCE, level: 0, unlocked: false, status: 'DISABLED' },
                        { type: BaseModuleType.LOGISTICS, level: 0, unlocked: false, status: 'DISABLED' },
                        { type: BaseModuleType.INDUSTRIAL, level: 0, unlocked: false, status: 'DISABLED' },
                        { type: BaseModuleType.DRONE_COMMAND, level: 0, unlocked: false, status: 'DISABLED' }
                    ]
                });
            } else {
                updatedBases = updatedBases.map(b =>
                    b.regionId === id
                        ? { ...b, type: 'station' as const, hasMarket: true, status: 'active' as const }
                        : b
                );
            }
        });

        // Подготовка всех разрешений
        const allPermits: any = {};
        REGION_IDS.forEach((id: string) => {
            allPermits[id] = {
                regionId: id,
                type: 'permanent',
                expirationDate: null
            };
        });

        set((state) => ({
            ...state,
            forgeUnlocked: true,
            cityUnlocked: true,
            skillsUnlocked: true,
            debugUnlocked: true,
            storageLevel: 2,
            playerBases: updatedBases,
            caravanUnlocks: state.caravanUnlocks.map(u => ({ ...u, unlocked: true })),
            unlockedLicenses: ['green', 'yellow', 'red'] as any[],
            activePermits: allPermits,
            resources: {
                ...state.resources,
                coal: Math.max(state.resources.coal, 5000),
                oil: Math.max(state.resources.oil, 2000),
                gas: Math.max(state.resources.gas, 1000),
                rubies: Math.max(state.resources.rubies, 10000),
                credits: Math.max(state.resources.credits, 50000)
            }
        }));
    },

    adminUnlockAllPermits: () => {
        const allPermits: any = {};
        REGION_IDS.forEach((id: string) => {
            allPermits[id] = {
                regionId: id,
                type: 'permanent',
                expirationDate: null
            };
        });
        set({ activePermits: allPermits });
    },

    adminMaxFactionReputation: () => set({
        reputation: { CORPORATE: 1000, SCIENCE: 1000, REBELS: 1000 },
        globalReputation: 1000
    }),

    adminInstantConstruction: () => set(s => ({
        playerBases: s.playerBases.map(b => ({
            ...b,
            status: 'active',
            constructionCompletionTime: Date.now()
        }))
    })),

    adminKillBoss: () => set({ currentBoss: null, activeView: View.DRILL }),

    adminUnlockLicenses: () => set({ unlockedLicenses: ['green', 'yellow', 'red'] as any[] }),

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

    adminTriggerEvent: (id) => {
        const s = get();

        // Специальная обработка для динамических событий
        if (id === 'SIDE_TUNNEL_DISCOVERY') {
            const event = sideTunnelSystem.generateEvent(
                s.depth,
                s.selectedBiome || 'rust_valley',
                true, // hasScanner = true для полной информации
                s.settings.language
            );
            if (event) {
                set(state => ({
                    eventQueue: [event, ...state.eventQueue],
                    activeView: state.activeView
                }));
                audioEngine.playAlarm();
            }
            return;
        }

        // Обычные статические события
        const event = EVENTS.find(e => e.id === id);
        if (event) {
            set(s => ({
                eventQueue: [event, ...s.eventQueue],
                activeView: s.activeView // Don't change view, let the UI handle modal
            }));
            audioEngine.playAlarm();
        }
    },
    adminClearEvents: () => set({ eventQueue: [] }),

    adminMaxSkills: () => {
        const maxSkills: Record<string, number> = {};
        SKILLS.forEach((s: any) => {
            maxSkills[s.id] = s.maxLevel === 999 ? 100 : s.maxLevel;
        });
        set({ skillLevels: maxSkills });
    },

    adminCompleteActiveQuests: () => {
        const s = get() as any;
        if (!s.activeQuests || s.activeQuests.length === 0) return;

        // Клонируем массив, так как completeQuest модифицирует его
        const questIds = s.activeQuests.map((q: any) => q.id);

        questIds.forEach((id: string) => {
            // Форсируем выполнение objectives
            set(state => {
                const qIdx = state.activeQuests.findIndex(q => q.id === id);
                if (qIdx === -1) return {};
                const quest = state.activeQuests[qIdx];
                const newObjectives = quest.objectives.map(obj => ({ ...obj, current: obj.required }));
                const newActive = [...state.activeQuests];
                newActive[qIdx] = { ...quest, objectives: newObjectives };
                return { activeQuests: newActive };
            });
            // Вызываем стандартный метод завершения
            s.completeQuest(id);
        });
    },

    adminIdentifyAll: () => set(s => {
        const newInv = { ...s.inventory };
        Object.keys(newInv).forEach(id => {
            newInv[id] = { ...newInv[id], isIdentified: true };
        });
        return { inventory: newInv };
    }),

    adminMaxDrones: () => {
        const maxDrones: any = {};
        Object.values(DroneType).forEach(type => {
            maxDrones[type as any] = 10; // Предположим макс 10
        });
        set({ droneLevels: maxDrones });
    },

    adminInstantHeal: () => set({ heat: 0, integrity: 100 }),

    adminAddXP: (amount) => set(s => ({ xp: (s.xp || 0) + amount })),

    adminForceRaid: () => {
        const s = get();
        const activeBases = s.playerBases.filter(b => b.status === 'active');
        if (activeBases.length === 0) return;
        const target = activeBases[Math.floor(Math.random() * activeBases.length)];
        const threat = raidSystem.calculateThreatLevel(target, s.globalReputation);
        const result = raidSystem.resolveRaid(target);

        const events: any[] = [];
        if (result.success) {
            events.push({ type: 'LOG', msg: `🛡️ [DEV] ОТБИТ РЕЙД НА ${target.regionId}: ${result.logMessage}`, color: 'text-green-400' });
            events.push({ type: 'SOUND', sfx: 'RAID_SUCCESS' });
        } else {
            events.push({ type: 'LOG', msg: `⚠️ [DEV] БАЗА ${target.regionId} РАЗГРАБЛЕНА: ${result.logMessage}`, color: 'text-red-500 font-bold' });
            events.push({ type: 'SCREEN_SHAKE', intensity: 10, duration: 500 });
            events.push({ type: 'SOUND', sfx: 'RAID_ALARM' });
            events.push({ type: 'SOUND', sfx: 'RAID_FAILURE' });

            // Apply resources loss
            set(state => ({
                playerBases: state.playerBases.map(b => b.id === target.id ? {
                    ...b,
                    storedResources: Object.keys(b.storedResources).reduce((acc: any, key: any) => {
                        const cur = b.storedResources[key as keyof Resources] || 0;
                        const stolen = result.stolenResources[key as keyof Resources] || 0;
                        acc[key] = Math.max(0, cur - stolen);
                        return acc;
                    }, {})
                } : b)
            }));
        }

        set(state => ({ actionLogQueue: [...state.actionLogQueue, ...events] }));
    },

    adminAddLevel: (amount) => set(s => ({ level: Math.max(1, (s.level || 1) + amount) })),

    adminClearEffects: () => set({ activeEffects: [] }),

    adminResetFreeCoolingCooldown: () => {
        set({ freeCoolingLastUsed: 0 });
        audioEngine.playClick();
    },

    adminSetTimeMultiplier: (multiplier) => set({ timeMultiplier: multiplier }),

    adminSkipTime: (seconds) => {
        set(s => {
            const newTime = (s.gameTime || 0) + seconds;
            const chronos = calculateChronosTime(newTime);

            // Economy Recovery Simulation
            // We use the imported 'economySystem' from the top of the file
            const hoursSkipped = seconds / 3600;
            const economyUpdates = economySystem.processEconomyRecovery(s, hoursSkipped);

            const msg = `>> [TIME JUMP]: +${Math.round(seconds / 60)} game minutes (${hoursSkipped.toFixed(1)}h)`;

            return {
                gameTime: newTime,
                chronos,
                ...economyUpdates, // Apply market saturation and raid risk updates
                actionLogQueue: [...s.actionLogQueue, { type: 'LOG', msg, color: 'text-amber-400 font-bold' }]
            };
        });
    },

    adminTeleportRegion: (regionId) => set({ currentRegion: regionId as any }),

    adminUnlockLicense: (type) => set(s => ({
        unlockedLicenses: Array.from(new Set([...s.unlockedLicenses, type as any]))
    })),

    adminCreateBase: (type) => {
        const s = get();
        const regionId = s.currentRegion;
        set(state => ({
            playerBases: [...state.playerBases, {
                id: `dev_base_${regionId}_${Date.now()}`,
                regionId,
                type,
                status: 'active',
                storageCapacity: 5000,
                storedResources: {},
                lastVisitedAt: Date.now(),
                upgradeLevel: 1,
                facilities: [],
                defense: { integrity: 100, shields: 0, infantry: 5, drones: 5, turrets: 2 },
                productionQueue: [],
                modules: [
                    { type: BaseModuleType.SCIENCE, level: 0, unlocked: false, status: 'DISABLED' },
                    { type: BaseModuleType.LOGISTICS, level: 0, unlocked: false, status: 'DISABLED' },
                    { type: BaseModuleType.INDUSTRIAL, level: 0, unlocked: false, status: 'DISABLED' },
                    { type: BaseModuleType.DRONE_COMMAND, level: 0, unlocked: false, status: 'DISABLED' }
                ],
                constructionStartTime: Date.now(),
                constructionCompletionTime: Date.now(),
                hasWorkshop: true,
                workshopTierRange: [1, 5],
                hasFuelFacilities: false,
                hasMarket: type === 'station',
                hasFortification: false,
                hasGuards: false
            }]
        }));
    },

    adminUnlockCaravan: (tier) => set(s => ({
        caravanUnlocks: s.caravanUnlocks.map(u => u.tier === tier ? { ...u, unlocked: true } : u)
    })),

    adminSetCargo: (amount) => set({ currentCargoWeight: amount }),
});
