/**
 * CARAVAN SLICE — управление караванами
 * Phase 2 (MVP): только 1★ караваны
 */

import { SliceCreator } from './types';
import type { Caravan, CaravanUnlock, CaravanTier, Resources } from '../../types';
import { createCaravan, checkCaravanCompletion, canSendCaravan } from '../../services/caravanManager';
import { BASIC_LOGISTICS_UNLOCK_COST, CARAVAN_SPECS } from '../../constants/caravans';
import { audioEngine } from '../../services/audioEngine';

export interface CaravanActions {
    caravans: Caravan[];
    caravanUnlocks: CaravanUnlock[];

    unlockBasicLogistics: () => void;
    sendCaravan: (fromBaseId: string, toBaseId: string, cargo: Partial<Resources>) => void;
    checkAllCaravans: () => void;
}

import { getActivePerkIds } from '../../services/factionLogic';

export const createCaravanSlice: SliceCreator<CaravanActions> = (set, get) => ({
    caravans: [],
    caravanUnlocks: [
        { tier: '1star', unlocked: false },
        { tier: '2star', unlocked: false },
        { tier: '3star', unlocked: false },
    ],

    unlockBasicLogistics: () => {
        const state = get();

        // Проверка стоимости
        if (state.resources.credits < BASIC_LOGISTICS_UNLOCK_COST) {
            console.warn(`❌ Недостаточно credits для разблокировки Basic Logistics (нужно ${BASIC_LOGISTICS_UNLOCK_COST})`);
            return;
        }

        // Проверка: уже разблокировано?
        const unlock = state.caravanUnlocks.find(u => u.tier === '1star');
        if (unlock?.unlocked) {
            console.warn('⚠️ Basic Logistics уже разблокирована');
            return;
        }

        set((state) => ({
            resources: {
                ...state.resources,
                credits: state.resources.credits - BASIC_LOGISTICS_UNLOCK_COST,
            },
            caravanUnlocks: state.caravanUnlocks.map(u =>
                u.tier === '1star' ? { ...u, unlocked: true, unlockedAt: Date.now() } : u
            ),
        }));

        console.log('✅ Basic Logistics разблокирована! Теперь можно отправлять 1★ караваны.');
    },

    sendCaravan: (fromBaseId, toBaseId, cargo) => {
        const state = get();

        // Проверка разблокировки
        const unlock = state.caravanUnlocks.find(u => u.tier === '1star');
        if (!unlock?.unlocked) {
            console.warn('❌ Караваны не разблокированы! Купи Basic Logistics.');
            return;
        }

        // Найти базы
        const fromBase = state.playerBases.find(b => b.id === fromBaseId);
        const toBase = state.playerBases.find(b => b.id === toBaseId);

        if (!fromBase || !toBase) {
            console.warn('❌ База не найдена');
            return;
        }

        const activePerks = getActivePerkIds(state.reputation);

        // Проверка возможности отправки
        const validation = canSendCaravan(cargo, '1star', fromBase.storedResources, activePerks);
        if (!state.isZeroWeight && !validation.canSend) {
            console.warn(`❌ ${validation.reason}`);
            return;
        }

        // Создать караван
        const caravan = createCaravan(fromBase, toBase, cargo, '1star', activePerks);

        // Списать ресурсы из базы отправления
        set((state) => ({
            playerBases: state.playerBases.map(b =>
                b.id === fromBaseId
                    ? {
                        ...b,
                        storedResources: Object.entries(cargo).reduce(
                            (acc, [resource, amount]) => ({
                                ...acc,
                                [resource]: (b.storedResources[resource as keyof Resources] || 0) - (amount || 0),
                            }),
                            b.storedResources
                        ),
                    }
                    : b
            ),
            caravans: [...state.caravans, caravan],
        }));

        audioEngine.playCaravanSend();

        const spec = CARAVAN_SPECS['1star'];
        const etaMinutes = Math.ceil(spec.travelTime / 60000);
        console.log(`🚛 Караван отправлен! ETA: ${etaMinutes} минут. Риск потери: ${Math.round(caravan.lossChance * 100)}%`);
    },

    checkAllCaravans: () => {
        const state = get();

        for (const caravan of state.caravans) {
            if (caravan.status !== 'in_transit') continue;

            const result = checkCaravanCompletion(caravan);

            if (result === 'pending') continue;

            if (result === 'success') {
                // Добавить ресурсы в целевую базу
                set((state) => ({
                    playerBases: state.playerBases.map(b =>
                        b.id === caravan.toBaseId
                            ? {
                                ...b,
                                storedResources: Object.entries(caravan.cargo).reduce(
                                    (acc, [resource, amount]) => ({
                                        ...acc,
                                        [resource]: (b.storedResources[resource as keyof Resources] || 0) + (amount || 0),
                                    }),
                                    b.storedResources
                                ),
                            }
                            : b
                    ),
                    caravans: state.caravans.map(c =>
                        c.id === caravan.id ? { ...c, status: 'completed' } : c
                    ),
                }));

                console.log(`✅ Караван ${caravan.id} прибыл успешно!`);
                audioEngine.playCaravanReturn(true);
                // TODO Phase 3: Trigger event 'CARAVAN_ARRIVED'
            } else {
                // Караван потерян
                set((state) => ({
                    caravans: state.caravans.map(c =>
                        c.id === caravan.id ? { ...c, status: 'lost' } : c
                    ),
                }));

                console.log(`💀 Караван ${caravan.id} потерян! (Пираты/авария)`);
                audioEngine.playCaravanReturn(false);
                // TODO Phase 3: Trigger event 'CARAVAN_LOST'
            }
        }
    },
});
