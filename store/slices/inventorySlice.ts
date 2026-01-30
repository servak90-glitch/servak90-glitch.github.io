/**
 * InventorySlice — действия связанные с артефактами и инвентарём
 */

import { SliceCreator, pushLogs } from './types';
import { VisualEvent, InventoryItem, ArtifactRarity, ResourceType, Resources } from '../../types';
import { ARTIFACTS } from '../../services/artifactRegistry';
import { audioEngine } from '../../services/audioEngine';
import { getActivePerkIds } from '../../services/factionLogic';
import {
    BITS, ENGINES, COOLERS, HULLS, LOGIC_CORES, CONTROL_UNITS,
    GEARBOXES, POWER_CORES, ARMORS, CARGO_BAYS
} from '../../constants';
import { calculateStats, recalculateCargoWeight } from '../../services/gameMath';

export interface InventoryActions {
    // Artifacts
    startAnalysis: (instanceId: string) => void;
    equipArtifact: (instanceId: string, slotIdx?: number) => void;
    unequipArtifact: (instanceId: string) => void;
    scrapArtifact: (instanceId: string) => void;
    transmuteArtifacts: (instanceIds: string[]) => void;

    // === NEW: Phase 2.2 Equipment ===
    addEquipmentToInventory: (partId: string, slotType: string) => void;
    equipEquipment: (itemInstanceId: string) => void;
    scrapEquipment: (itemInstanceId: string) => void;
    sellEquipment: (itemInstanceId: string) => void;

    // === Phase 3: Consumables ===
    useConsumable: (id: 'repairKit' | 'coolantPaste' | 'advancedCoolant') => void;

    // === Phase 3.1: Creative Recycling ===
    recycleResources: (type: 'repair' | 'lubricate' | 'lottery' | 'scrap' | 'afterburn') => void;
}

export const createInventorySlice: SliceCreator<InventoryActions> = (set, get) => ({
    startAnalysis: (instanceId) => {
        const s = get();
        if (s.analyzer.activeItemInstanceId) return;
        const item = s.inventory[instanceId];
        if (!item || item.isIdentified) return;

        const def = ARTIFACTS.find(a => a.id === item.defId);
        if (!def) return;

        const activePerks = getActivePerkIds(s.reputation);
        let time = def.rarity === 'COMMON' ? 10 : def.rarity === 'RARE' ? 30 : 60;

        if (activePerks.includes('AUTO_ANALYSIS')) {
            time = Math.ceil(time * 0.75); // -25%
        }

        set({ analyzer: { activeItemInstanceId: instanceId, timeLeft: time, maxTime: time } });
    },

    equipArtifact: (instanceId, slotIdx) => {
        const s = get();
        const item = s.inventory[instanceId];
        if (!item || !item.isIdentified) return;

        const slots = [...s.equippedArtifacts];

        // Если указан конкретный слот — ставим туда (и вытесняем старый)
        if (slotIdx !== undefined && slotIdx >= 0 && slotIdx < 4) {
            // Если этот артефакт уже где-то стоит — убираем оттуда
            const currentIdx = slots.indexOf(instanceId);
            if (currentIdx !== -1) slots[currentIdx] = null;

            // Если в целевом слоте что-то есть — помечаем как неэкипированное
            const oldId = slots[slotIdx];
            const updatedInventory = { ...s.inventory, [instanceId]: { ...item, isEquipped: true } };
            if (oldId && oldId !== instanceId) {
                updatedInventory[oldId] = { ...s.inventory[oldId], isEquipped: false };
            }

            slots[slotIdx] = instanceId;
            set({
                equippedArtifacts: slots,
                inventory: updatedInventory
            });
            return;
        }

        // Если слот не указан — просто ищем свободный
        if (item.isEquipped) return;
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

            set({
                resources: newRes,
                inventory: newInv,
                // [BUG FIX] Пересчитываем вес груза после добавления ancientTech
                currentCargoWeight: recalculateCargoWeight(newRes)
            });
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

    // === PHASE 2.2: EQUIPMENT MANAGEMENT ===

    /**
     * Добавить equipment в инвентарь (из crafting queue или другого источника)
     */
    addEquipmentToInventory: (partId, slotType) => {
        const s = get();

        // Найти definition детали
        const allParts = [...BITS, ...ENGINES, ...COOLERS, ...HULLS, ...LOGIC_CORES, ...CONTROL_UNITS, ...GEARBOXES, ...POWER_CORES, ...ARMORS, ...CARGO_BAYS];
        const partDef = allParts.find((p: any) => p.id === partId);

        if (!partDef) {
            console.error(`[addEquipmentToInventory] Part ${partId} not found`);
            return;
        }

        // Создать EquipmentItem
        const item: import('../../types').EquipmentItem = {
            instanceId: Math.random().toString(36).substring(2, 15),
            partId,
            slotType: slotType as any,
            tier: partDef.tier,
            acquiredAt: Date.now(),
            isEquipped: false,
            scrapValue: partDef.tier * 10  // tier * 10 Scrap
        };

        // Добавить в inventory
        const newInventory = [...s.equipmentInventory, item];

        const successEvent: VisualEvent = {
            type: 'LOG',
            msg: `✅ ПОЛУЧЕНО: ${partId} (Tier ${partDef.tier})`,
            color: 'text-green-400'
        };

        set({
            equipmentInventory: newInventory,
            actionLogQueue: pushLogs(s, [successEvent])
        });

        audioEngine.playCollect();
    },

    /**
     * Equipment Swap: снять старую деталь, поставить новую
     */
    equipEquipment: (itemInstanceId) => {
        const s = get();

        // Найти item в инвентаре
        const item = s.equipmentInventory.find(i => i.instanceId === itemInstanceId);
        if (!item || item.isEquipped) return;

        // Получить текущую деталь на буре
        const currentPart = s.drill[item.slotType as keyof typeof s.drill];

        // ИСПРАВЛЕНИЕ БАГА: Проверить, есть ли снимаемая деталь уже в инвентаре
        const existingUnequipped = s.equipmentInventory.find(
            i => i.partId === currentPart.id &&
                i.slotType === item.slotType &&
                !i.isEquipped
        );

        // Получить новую деталь definition
        const allParts = [...BITS, ...ENGINES, ...COOLERS, ...HULLS, ...LOGIC_CORES, ...CONTROL_UNITS, ...GEARBOXES, ...POWER_CORES, ...ARMORS, ...CARGO_BAYS];
        const newPartDef = allParts.find((p: any) => p.id === item.partId);

        if (!newPartDef) {
            console.error(`[equipEquipment] Part ${item.partId} not found`);
            return;
        }

        // Обновить inventory: удалить устанавливаемую деталь, добавить снятую (если её ещё нет)
        let updatedInventory;

        if (existingUnequipped) {
            // Снимаемая деталь уже в инвентаре - просто удаляем устанавливаемую
            updatedInventory = s.equipmentInventory.filter(i => i.instanceId !== itemInstanceId);
        } else {
            // Снимаемой детали нет - создаём новый экземпляр и добавляем
            const unequippedItem: import('../../types').EquipmentItem = {
                instanceId: Math.random().toString(36).substring(2, 15),
                partId: currentPart.id,
                slotType: item.slotType,
                tier: currentPart.tier,
                acquiredAt: Date.now(),
                isEquipped: false,
                scrapValue: currentPart.tier * 10
            };

            updatedInventory = [
                ...s.equipmentInventory.filter(i => i.instanceId !== itemInstanceId),
                unequippedItem
            ];
        }

        const successEvent: VisualEvent = {
            type: 'LOG',
            msg: `🔧 УСТАНОВЛЕНО: ${item.partId} → ${item.slotType}`,
            color: 'text-cyan-400 font-bold'
        };

        set({
            drill: {
                ...s.drill,
                [item.slotType]: newPartDef
            },
            equipmentInventory: updatedInventory,
            actionLogQueue: pushLogs(s, [successEvent])
        });

        audioEngine.playUpgrade();
    },

    /**
     * Разобрать деталь на Scrap
     */
    scrapEquipment: (itemInstanceId) => {
        const s = get();

        const item = s.equipmentInventory.find(i => i.instanceId === itemInstanceId);
        if (!item || item.isEquipped) return;  // Нельзя разобрать установленную деталь

        // Удалить из инвентаря, добавить Scrap
        const newInventory = s.equipmentInventory.filter(i => i.instanceId !== itemInstanceId);
        const newResources = {
            ...s.resources,
            scrap: s.resources.scrap + item.scrapValue
        };

        const successEvent: VisualEvent = {
            type: 'LOG',
            msg: `♻️ РАЗОБРАНО: ${item.partId} → +${item.scrapValue} Scrap`,
            color: 'text-yellow-400'
        };

        set({
            equipmentInventory: newInventory,
            resources: newResources,
            // [BUG FIX] Пересчитываем вес груза после добавления scrap
            currentCargoWeight: recalculateCargoWeight(newResources),
            actionLogQueue: pushLogs(s, [successEvent])
        });

        audioEngine.playClick();
    },

    /**
     * Продать деталь за Credits (tier^2 * 100)
     */
    sellEquipment: (itemInstanceId) => {
        const s = get();

        const item = s.equipmentInventory.find(i => i.instanceId === itemInstanceId);
        if (!item || item.isEquipped) return;

        // Рассчитать цену продажи: tier^2 * 100
        // Tier 1 = 100, Tier 5 = 2500, Tier 15 = 22500
        const sellPrice = Math.pow(item.tier, 2) * 100;

        const newInventory = s.equipmentInventory.filter(i => i.instanceId !== itemInstanceId);
        const newResources = {
            ...s.resources,
            credits: s.resources.credits + sellPrice
        };

        const successEvent: VisualEvent = {
            type: 'LOG',
            msg: `💰 ПРОДАНО: ${item.partId} → +${sellPrice} Credits`,
            color: 'text-green-400'
        };

        set({
            equipmentInventory: newInventory,
            resources: newResources,
            // [BUG FIX] Пересчитываем вес груза (credits не имеют веса, но для консистентности)
            currentCargoWeight: recalculateCargoWeight(newResources),
            actionLogQueue: pushLogs(s, [successEvent])
        });

        audioEngine.playClick();
    },

    /**
     * Использование расходника
     */
    useConsumable: (id) => {
        const s = get();
        const count = s.consumables[id] || 0;

        if (count <= 0) {
            const errorEvent: VisualEvent = {
                type: 'LOG',
                msg: `⚠️ НЕТ В НАЛИЧИИ: ${id}`,
                color: 'text-red-500'
            };
            set({ actionLogQueue: pushLogs(s, [errorEvent]) });
            audioEngine.playUIError();
            return;
        }

        const stats = calculateStats(s.drill, s.skillLevels, s.equippedArtifacts, s.inventory, s.depth);
        let events: VisualEvent[] = [];
        let partialUpdate: Partial<import('../../types').GameState> = {};

        switch (id) {
            case 'repairKit':
                const repairAmt = Math.ceil(stats.integrity * 0.2);
                partialUpdate = {
                    integrity: Math.min(stats.integrity, s.integrity + repairAmt)
                };
                events.push({
                    type: 'LOG',
                    msg: `🔧 РЕМОНТ: +${repairAmt} HP`,
                    color: 'text-green-400'
                });
                break;

            case 'coolantPaste':
                partialUpdate = {
                    heat: Math.max(0, s.heat - 30)
                };
                events.push({
                    type: 'LOG',
                    msg: `❄️ ОХЛАЖДЕНИЕ: -30% Heat`,
                    color: 'text-cyan-400'
                });
                break;

            case 'advancedCoolant':
                // TODO: Добавить иммунитет через ActiveEffect в будущем
                partialUpdate = {
                    heat: Math.max(0, s.heat - 60)
                };
                events.push({
                    type: 'LOG',
                    msg: `🚀 ПЕРЕДОВОЙ ХЛАДАГЕНТ: -60% Heat`,
                    color: 'text-blue-400 font-bold'
                });
                break;
        }

        set({
            ...partialUpdate,
            consumables: {
                ...s.consumables,
                [id]: count - 1
            },
            actionLogQueue: pushLogs(s, [...events])
        });

        audioEngine.playClick();
    },

    recycleResources: (type) => {
        const s = get();
        const stats = calculateStats(s.drill, s.skillLevels, s.equippedArtifacts, s.inventory, s.depth);
        const { resources, activeEffects } = s;

        let resUpdate: Partial<Resources> = {};
        let effect: any = null;
        let msg = "";
        let color = "text-zinc-400";
        let integrityUpdate: number | undefined;

        switch (type) {
            case 'repair': // Field Repair: 500 Stone + 50 Scrap -> +5% Integrity
                if (resources.stone >= 500 && resources.scrap >= 50) {
                    resUpdate = { stone: resources.stone - 500, scrap: resources.scrap - 50 };
                    const repairAmt = Math.ceil(stats.integrity * 0.05);
                    integrityUpdate = Math.min(stats.integrity, s.integrity + repairAmt);
                    msg = `🔨 ПОЛЕВОЙ РЕМОНТ: +${repairAmt} HP (за 500 камня и 50 лома)`;
                    color = "text-green-400";
                }
                break;

            case 'lubricate': // Lube: 300 Clay + 50 Ice -> -20% Heat Gen (120s)
                if (resources.clay >= 300 && resources.ice >= 50) {
                    resUpdate = { clay: resources.clay - 300, ice: resources.ice - 50 };
                    effect = {
                        id: 'LUBRICANT',
                        name: 'СМАЗОЧНЫЙ КОНЦЕНТРАТ',
                        description: '-20% нагрева при бурении',
                        duration: 120,
                        type: 'BUFF',
                        modifiers: { heatGenMultiplier: 0.8 }
                    };
                    msg = `🧪 НАНЕСЕНА СМАЗКА: -20% нагрева на 2 мин.`;
                    color = "text-blue-400";
                }
                break;

            case 'lottery': // Lottery: 200 Iron + 100 Clay + 100 Stone -> +50% Drop Chance (170s)
                if (activeEffects.some(e => e.id === 'PROSPECTOR_LUCK')) return;
                if (resources.iron >= 200 && resources.clay >= 100 && resources.stone >= 100) {
                    resUpdate = { iron: resources.iron - 200, clay: resources.clay - 100, stone: resources.stone - 100 };
                    effect = {
                        id: 'PROSPECTOR_LUCK',
                        name: 'УДАЧА СТАРАТЕЛЯ',
                        description: '+50% шанс найти расходники',
                        duration: 170, // В СЕКУНДАХ
                        type: 'BUFF',
                        modifiers: { consumableDropMultiplier: 1.5 }
                    };
                    msg = `🎰 ЛОТЕРЕЯ: Вероятность найти расходники в породе увеличена!`;
                    color = "text-purple-400";
                }
                break;

            case 'scrap': // Scrap Sale: 100 base -> 7 Credits
                if (resources.stone >= 100) {
                    const gain = 7;
                    resUpdate = { stone: resources.stone - 100, credits: resources.credits + gain };
                    msg = `📦 УТИЛЬ: 100 камня переработано в ${gain} кредитов`;
                    color = "text-amber-500";
                } else if (resources.clay >= 100) {
                    const gain = 7;
                    resUpdate = { clay: resources.clay - 100, credits: resources.credits + gain };
                    msg = `📦 УТИЛЬ: 100 глины переработано в ${gain} кредитов`;
                    color = "text-amber-500";
                }
                break;

            case 'afterburn': // Ballast Afterburn: 1000 base -> +50% Speed (30s)
                if (activeEffects.some(e => e.id === 'BALLAST_DUMP')) return;
                if (resources.stone >= 1000) {
                    resUpdate = { stone: resources.stone - 1000 };
                    effect = {
                        id: 'BALLAST_DUMP',
                        name: 'БАЛЛАСТНЫЙ ФОРСАЖ',
                        description: '+50% скорость бурения',
                        duration: 30, // В СЕКУНДАХ
                        type: 'BUFF',
                        modifiers: { drillSpeedMultiplier: 1.5 }
                    };
                    msg = `🚀 БАЛЛАСТ СБРОШЕН: Форсаж активирован на 30с!`;
                    color = "text-orange-500 font-bold";
                }
                break;
        }

        if (msg) {
            set((state: any) => {
                const updatedResources = { ...state.resources, ...resUpdate };
                return {
                    resources: updatedResources,
                    // [BUG FIX] Пересчитываем вес груза после изменения ресурсов
                    currentCargoWeight: recalculateCargoWeight(updatedResources),
                    ...(integrityUpdate !== undefined ? { integrity: integrityUpdate } : {}),
                    ...(effect ? { activeEffects: [...state.activeEffects, effect] } : {}),
                    actionLogQueue: pushLogs(state, [{ type: 'LOG', msg, color }])
                };
            });
            audioEngine.playUpgrade ? audioEngine.playUpgrade() : audioEngine.playCollect();
        } else {
            audioEngine.playUIError();
        }
    }
});
