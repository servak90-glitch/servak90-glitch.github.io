/**
 * EntitySlice — действия связанные с летающими объектами
 */

import { SetState, GetState, SliceCreator, pushLog, pushLogs } from './types';
import { ResourceType, VisualEvent } from '../../types';
import { BIOMES } from '../../constants';
import { getResourceLabel } from '../../services/gameMath';
import { audioEngine } from '../../services/audioEngine';

export interface EntityActions {
    clickFlyingObject: (id: string, x: number, y: number) => void;
}

export const createEntitySlice: SliceCreator<EntityActions> = (set, get) => ({
    clickFlyingObject: (id, x, y) => {
        const s = get();
        const objIndex = s.flyingObjects.findIndex(o => o.id === id);
        if (objIndex === -1) return;

        const objects = [...s.flyingObjects];
        const obj = { ...objects[objIndex] };
        obj.hp -= 1;

        const logs: VisualEvent[] = [{ type: 'PARTICLE', x, y, color: '#FFF', kind: 'SPARK', count: 3 }];

        if (obj.hp <= 0) {
            objects.splice(objIndex, 1);
            audioEngine.playClick();

            const newRes = { ...s.resources };
            const currentBiome = s.selectedBiome
                ? BIOMES.find(b => b.name === s.selectedBiome) || BIOMES[0]
                : BIOMES.slice().reverse().find(b => s.depth >= b.depth) || BIOMES[0];

            const commonAmount = Math.floor(Math.random() * 10) + 1;
            newRes[currentBiome.resource] += commonAmount;
            logs.push({ type: 'TEXT', x, y, text: `+${commonAmount} ${getResourceLabel(currentBiome.resource)}`, style: 'RESOURCE' });

            // Шанс редкого ресурса
            if (Math.random() < 0.15) {
                const rareRes: ResourceType[] = ['titanium', 'uranium', 'nanoSwarm', 'ancientTech'];
                const rareType = rareRes[Math.floor(Math.random() * rareRes.length)];
                const rareAmount = Math.floor(Math.random() * 3) + 1;
                newRes[rareType] += rareAmount;
                logs.push({ type: 'TEXT', x, y: y - 20, text: `+${rareAmount} ${getResourceLabel(rareType)}`, style: 'CRIT' });
            }

            // Шанс гема
            if (Math.random() < 0.02 && currentBiome.gemResource) {
                newRes[currentBiome.gemResource] += 1;
                logs.push({ type: 'TEXT', x, y: y - 40, text: `+1 ${getResourceLabel(currentBiome.gemResource)}`, style: 'CRIT' });
                audioEngine.playAchievement();
            }

            const xpGain = Math.floor(Math.random() * 11) + 10;
            logs.push({ type: 'TEXT', x, y: y - 60, text: `+${xpGain} XP`, style: 'INFO' });

            set({
                flyingObjects: objects,
                resources: newRes,
                xp: s.xp + xpGain,
                actionLogQueue: pushLogs(s, logs)
            });
        } else {
            objects[objIndex] = obj;
            audioEngine.playClick();
            set({ flyingObjects: objects, actionLogQueue: pushLogs(s, logs) });
        }
    },
});
