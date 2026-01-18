
import { SliceCreator } from './types';
import { ResourceType, View } from '../../types';
import { EVENTS } from '../../services/eventRegistry';
import { generateBoss } from '../../services/bossRegistry';
import { audioEngine } from '../../services/audioEngine';

export interface AdminActions {
    adminAddResources: (common: number, rare: number) => void;
    adminResetResources: () => void;
    adminAddArtifact: (defId: string) => void;
    adminSetGodMode: (enabled: boolean) => void;
    adminSetInfiniteCoolant: (enabled: boolean) => void;
    adminSetInfiniteFuel: (enabled: boolean) => void;
    adminSetZeroWeight: (enabled: boolean) => void;
    adminSetOverdrive: (enabled: boolean) => void;
    adminUnlockAll: () => void;
    adminUnlockLicenses: () => void;
    adminMaxTech: () => void;
    adminSetDepth: (depth: number) => void;
    adminSkipBiome: () => void;
    adminSpawnBoss: () => void;
    adminTriggerEvent: (eventId: string) => void;
    adminClearEvents: () => void;
}

export const createAdminSlice: SliceCreator<AdminActions> = (set, get) => ({
    adminAddResources: (c, r) => set(s => {
        const nr = { ...s.resources };
        Object.keys(nr).forEach(k => {
            if (['clay', 'stone', 'copper', 'iron', 'silver', 'gold', 'coal', 'oil', 'gas'].includes(k)) nr[k as ResourceType] += c;
            else nr[k as ResourceType] += r;
        });
        return { resources: nr };
    }),

    adminResetResources: () => set(() => ({
        resources: { clay: 0, stone: 0, copper: 0, iron: 0, silver: 0, gold: 0, titanium: 0, uranium: 0, nanoSwarm: 0, ancientTech: 0, rubies: 0, emeralds: 0, diamonds: 0, coal: 0, oil: 0, gas: 0 }
    })),

    adminAddArtifact: (defId) => {
        const s = get();
        const id = Math.random().toString(36).substr(2, 9);
        set({ inventory: { ...s.inventory, [id]: { instanceId: id, defId, acquiredAt: Date.now(), isIdentified: true, isEquipped: false } } });
    },

    adminSetGodMode: (v) => set({ isGodMode: v }),
    adminSetInfiniteCoolant: (v) => set({ isInfiniteCoolant: v }),
    adminSetInfiniteFuel: (v) => set({ isInfiniteFuel: v }),
    adminSetZeroWeight: (v) => set({ isZeroWeight: v }),
    adminSetOverdrive: (v) => set({ isOverdrive: v }),

    adminUnlockAll: () => set(s => {
        const hasBaseInRegion = s.playerBases.find(b => b.regionId === s.currentRegion);
        let newBases = s.playerBases;
        if (!hasBaseInRegion) {
            newBases = [...s.playerBases, {
                id: `dev_base_${Date.now()}`,
                regionId: s.currentRegion,
                type: 'station',
                status: 'active',
                storageCapacity: 10000,
                storedResources: {},
                hasWorkshop: true,
                workshopTierRange: [1, 10],
                hasFuelFacilities: true,
                hasMarket: true,
                hasFortification: true,
                hasGuards: true,
                constructionStartTime: Date.now(),
                constructionCompletionTime: Date.now(),
                lastVisitedAt: Date.now(),
                upgradeLevel: 1,
                facilities: []
            }];
        } else if (hasBaseInRegion.type !== 'station') {
            newBases = s.playerBases.map(b => b.regionId === s.currentRegion ? { ...b, type: 'station', hasMarket: true } : b);
        }

        return {
            forgeUnlocked: true,
            cityUnlocked: true,
            skillsUnlocked: true,
            storageLevel: 2,
            debugUnlocked: true,
            playerBases: newBases,
            caravanUnlocks: s.caravanUnlocks.map(u => ({ ...u, unlocked: true })),
            unlockedLicenses: ['green', 'yellow', 'red'] as any[]
        };
    }),

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
});
