/**
 * InventorySlice — действия связанные с артефактами и инвентарём
 */

import { SliceCreator, pushLogs } from './types';
import { VisualEvent, InventoryItem, ArtifactRarity } from '../../types';
import { ARTIFACTS } from '../../services/artifactRegistry';
import { audioEngine } from '../../services/audioEngine';

export interface InventoryActions {
    startAnalysis: (instanceId: string) => void;
    equipArtifact: (instanceId: string) => void;
    unequipArtifact: (instanceId: string) => void;
    scrapArtifact: (instanceId: string) => void;
    transmuteArtifacts: (instanceIds: string[]) => void;
}

export const createInventorySlice: SliceCreator<InventoryActions> = (set, get) => ({
    startAnalysis: (instanceId) => {
        const s = get();
        if (s.analyzer.activeItemInstanceId) return;
        const item = s.inventory[instanceId];
        if (!item || item.isIdentified) return;

        const def = ARTIFACTS.find(a => a.id === item.defId);
        if (!def) return;

        const time = def.rarity === 'COMMON' ? 10 : def.rarity === 'RARE' ? 30 : 60;
        set({ analyzer: { activeItemInstanceId: instanceId, timeLeft: time, maxTime: time } });
    },

    equipArtifact: (instanceId) => {
        const s = get();
        const item = s.inventory[instanceId];
        if (!item || !item.isIdentified || item.isEquipped) return;

        const slots = [...s.equippedArtifacts];
        const emptyIdx = slots.indexOf(null);
        if (emptyIdx !== -1) {
            slots[emptyIdx] = instanceId;
            set({
                equippedArtifacts: slots,
                inventory: { ...s.inventory, [instanceId]: { ...item, isEquipped: true } }
            });
        }
    },

    unequipArtifact: (instanceId) => {
        const s = get();
        const slots = [...s.equippedArtifacts];
        const idx = slots.indexOf(instanceId);
        if (idx !== -1) {
            slots[idx] = null;
            const item = s.inventory[instanceId];
            set({
                equippedArtifacts: slots,
                inventory: { ...s.inventory, [instanceId]: { ...item, isEquipped: false } }
            });
        }
    },

    scrapArtifact: (instanceId) => {
        const s = get();
        const item = s.inventory[instanceId];
        if (!item || item.isEquipped) return;

        const def = ARTIFACTS.find(a => a.id === item.defId);
        if (def) {
            const newRes = { ...s.resources, ancientTech: s.resources.ancientTech + def.scrapAmount };
            const newInv = { ...s.inventory };
            delete newInv[instanceId];

            set({ resources: newRes, inventory: newInv });
            audioEngine.playLog();
        }
    },

    transmuteArtifacts: (ids) => {
        const s = get();
        if (ids.length !== 3) return;

        const firstItem = s.inventory[ids[0]];
        if (!firstItem) return;
        const firstDef = ARTIFACTS.find(a => a.id === firstItem.defId);
        if (!firstDef) return;

        const currentRarity = firstDef.rarity;

        let nextRarity: ArtifactRarity;
        switch (currentRarity) {
            case ArtifactRarity.COMMON: nextRarity = ArtifactRarity.RARE; break;
            case ArtifactRarity.RARE: nextRarity = ArtifactRarity.EPIC; break;
            case ArtifactRarity.EPIC: nextRarity = ArtifactRarity.LEGENDARY; break;
            default: nextRarity = ArtifactRarity.ANOMALOUS; break;
        }

        const pool = ARTIFACTS.filter(a => a.rarity === nextRarity);
        const targetDef = pool.length > 0
            ? pool[Math.floor(Math.random() * pool.length)]
            : ARTIFACTS[Math.floor(Math.random() * ARTIFACTS.length)];

        const newId = Math.random().toString(36).substr(2, 9);
        const newItem: InventoryItem = {
            instanceId: newId,
            defId: targetDef.id,
            acquiredAt: Date.now(),
            isIdentified: true,
            isEquipped: false
        };

        const newInv = { ...s.inventory };
        ids.forEach(id => delete newInv[id]);
        newInv[newId] = newItem;

        const events: VisualEvent[] = [
            { type: 'LOG', msg: `СИНТЕЗ УСПЕШЕН: ${targetDef.name}`, color: 'text-purple-400 font-bold' },
            { type: 'SOUND', sfx: 'ACHIEVEMENT' }
        ];

        set({
            inventory: newInv,
            actionLogQueue: pushLogs(s, events)
        });
        audioEngine.playFusion();
    },
});
