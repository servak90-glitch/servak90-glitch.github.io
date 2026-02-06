import { SliceCreator } from './types';
import { OperatorId, CrewId } from '../../types';
import { OPERATORS, CREW_MEMBERS } from '../../constants/rpg';
import { audioEngine } from '../../services/audioEngine';

export interface OperatorActions {
    selectOperator: (id: OperatorId) => void;
    hireCrew: (id: CrewId) => void;
    dismissCrew: (id: CrewId) => void;
    changeOperator: (id: OperatorId, cost: number) => boolean; // Clinic logic
    applyUpkeep: () => void; // Periodic maintenance
}

export const createOperatorSlice: SliceCreator<OperatorActions> = (set, get) => ({
    selectOperator: (id) => {
        const op = OPERATORS.find(o => o.id === id);
        if (!op) return;

        set({
            operatorId: id,
            unlockedOperators: Array.from(new Set([...get().unlockedOperators, id]))
        });

        audioEngine.playLog();
    },

    hireCrew: (id) => {
        const state = get();
        const crew = CREW_MEMBERS.find(c => c.id === id);
        if (!crew || state.resources.credits < crew.cost.credits) return;

        set(state => ({
            resources: {
                ...state.resources,
                credits: state.resources.credits - crew.cost.credits
            },
            hiredCrewIds: Array.from(new Set([...state.hiredCrewIds, id]))
        }));

        audioEngine.playAchievement();
    },

    dismissCrew: (id) => {
        set(state => ({
            hiredCrewIds: state.hiredCrewIds.filter(cid => cid !== id)
        }));
    },

    changeOperator: (id, cost) => {
        const state = get();
        if (state.resources.credits < cost) return false;

        set(s => ({
            resources: {
                ...s.resources,
                credits: s.resources.credits - cost
            },
            operatorId: id,
            unlockedOperators: Array.from(new Set([...s.unlockedOperators, id]))
        }));

        audioEngine.playLog();
        return true;
    },

    applyUpkeep: () => {
        const state = get();
        state.hiredCrewIds.forEach(id => {
            const crew = CREW_MEMBERS.find(c => c.id === id);
            if (!crew) return;

            if (crew.cost.periodicCredits && state.resources.credits >= crew.cost.periodicCredits) {
                set(s => ({
                    resources: { ...s.resources, credits: s.resources.credits - (crew.cost.periodicCredits || 0) }
                }));
            }
        });
    }
});
