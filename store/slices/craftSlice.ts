/**
 * Craft Slice — управление очередью крафта equipment
 * Phase 2.1: Crafting Queue с офлайн таймерами
 */

import { SliceCreator, pushLog } from './types';
import { DrillSlot, VisualEvent } from '../../types';
import { calculateCraftTime } from '../../services/mathEngine';
import {
    BITS, ENGINES, COOLERS, HULLS, LOGIC_CORES, CONTROL_UNITS,
    GEARBOXES, POWER_CORES, ARMORS, CARGO_BAYS
} from '../../constants';
import { audioEngine } from '../../services/audioEngine';

// ============================================
// TYPES
// ============================================

export interface CraftingJob {
    id: string;              // Уникальный ID задания (UUID)
    partId: string;          // Что крафтим (bit_5, engine_12, etc.)
    slotType: DrillSlot;     // Тип детали (BIT, ENGINE, HULL...)

    startTime: number;       // timestamp начала (Date.now())
    completionTime: number;  // startTime + T_craft (из mathEngine!)

    status: 'in_progress' | 'ready_to_collect';
}

export interface CraftActions {
    /**
     * Начать крафт детали
     * @param partId - ID детали (bit_5)
     * @param slotType - Тип слота (BIT) или 'CONSUMABLE'
     */
    startCraft: (partId: string, slotType: DrillSlot | 'CONSUMABLE') => void;

    /**
     * Забрать готовую деталь из очереди
     * @param jobId - ID задания
     */
    collectCraftedItem: (jobId: string) => void;

    /**
     * Отменить крафт (вернуть 50% ресурсов)
     * @param jobId - ID задания
     */
    cancelCraft: (jobId: string) => void;

    /**
     * Мгновенно завершить весь крафт (чит)
     */
    adminInstantCompleteCrafting: () => void;
}

// ============================================
// HELPERS
// ============================================

/**
 * Получить definition детали по ID
 */
function getPartDefinition(partId: string) {
    const allParts = [
        ...BITS, ...ENGINES, ...COOLERS, ...HULLS,
        ...LOGIC_CORES, ...CONTROL_UNITS, ...GEARBOXES,
        ...POWER_CORES, ...ARMORS, ...CARGO_BAYS
    ];

    // Добавляем дефайны расходников для крафта (временное решение, пока нет общего реестра)
    const CONSUMABLES_DEFS = [
        {
            id: 'repairKit',
            tier: 1,
            cost: { scrap: 50, ancientTech: 2 },
            name: { RU: 'Ремкомплект', EN: 'Repair Kit' }
        },
        {
            id: 'coolantPaste',
            tier: 1,
            cost: { clay: 100, ice: 20 },
            name: { RU: 'Хладагент-паста', EN: 'Coolant Paste' }
        },
        {
            id: 'advancedCoolant',
            tier: 3,
            cost: { oil: 50, silver: 10 },
            name: { RU: 'Продвинутый хладагент', EN: 'Advanced Coolant' }
        }
    ];

    return allParts.find(p => p.id === partId) || CONSUMABLES_DEFS.find(p => (p as any).id === partId);
}

/**
 * Проверка достаточности ресурсов
 */
function canAfford(cost: Record<string, number>, resources: Record<string, number>): boolean {
    return Object.entries(cost).every(([res, amt]) => (resources[res] || 0) >= amt);
}

/**
 * Списать ресурсы
 */
function consumeResources(
    cost: Record<string, number>,
    resources: Record<string, number>
): Record<string, number> {
    const newResources = { ...resources };
    Object.entries(cost).forEach(([res, amt]) => {
        newResources[res] = (newResources[res] || 0) - amt;
    });
    return newResources;
}

/**
 * Вернуть ресурсы (для отмены)
 */
function refundResources(
    cost: Record<string, number>,
    resources: Record<string, number>,
    percentage: number = 0.5
): Record<string, number> {
    const newResources = { ...resources };
    Object.entries(cost).forEach(([res, amt]) => {
        const refund = Math.floor(amt * percentage);
        newResources[res] = (newResources[res] || 0) + refund;
    });
    return newResources;
}

// ============================================
// SLICE
// ============================================

export const createCraftSlice: SliceCreator<CraftActions> = (set, get) => ({
    /**
     * Начать крафт детали
     */
    startCraft: (partId, slotType) => {
        const s = get();

        // 1. Получить definition детали
        const partDef = getPartDefinition(partId);
        if (!partDef) {
            console.error(`[craftSlice] Part not found: ${partId}`);
            return;
        }

        // 2. Проверить ресурсы
        if (!canAfford(partDef.cost, s.resources as any)) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: `⚠️ НЕДОСТАТОЧНО РЕСУРСОВ ДЛЯ ${partId}!`,
                color: 'text-red-500'
            };
            set({ actionLogQueue: pushLog(s as any, event) });
            audioEngine.playUIError();
            return;
        }

        // 3. Списать ресурсы
        const newResources = consumeResources(partDef.cost, s.resources as any) as any;

        // 4. Рассчитать T_craft через mathEngine
        const craftTimeSeconds = calculateCraftTime(partDef.tier);
        const now = Date.now();

        // 5. Создать задание в очереди
        const job: CraftingJob = {
            id: Math.random().toString(36).substring(2, 15),
            partId,
            slotType: slotType as any,
            startTime: now,
            completionTime: now + (craftTimeSeconds * 1000),  // мс
            status: 'in_progress'
        };

        // 6. Обновить state
        const craftMinutes = Math.ceil(craftTimeSeconds / 60);
        const successEvent: VisualEvent = {
            type: 'LOG',
            msg: `🛠️ НАЧАТ КРАФТ: ${partId} (~${craftMinutes}мин)`,
            color: 'text-cyan-400 font-bold'
        };

        set({
            resources: newResources,
            craftingQueue: [...s.craftingQueue, job],
            actionLogQueue: pushLog(s, successEvent)
        });
        audioEngine.playClick();
    },

    /**
     * Забрать готовую деталь из очереди
     * Phase 2.2: Деталь попадает В ИНВЕНТАРЬ через addEquipmentToInventory
     */
    collectCraftedItem: (jobId) => {
        const s = get();

        // 1. Найти задание
        const job = s.craftingQueue.find(j => j.id === jobId);
        if (!job || job.status !== 'ready_to_collect') {
            console.warn(`[craftSlice] Job not ready or not found: ${jobId}`);
            return;
        }

        // 2. Phase 2.2: Если это деталь - в инвентарь, если расходник - в пачку
        if (job.slotType === ('CONSUMABLE' as any)) {
            set((state: any) => ({
                consumables: {
                    ...state.consumables,
                    [job.partId]: (state.consumables[job.partId as keyof typeof state.consumables] || 0) + 1
                }
            }));
            const event: VisualEvent = {
                type: 'LOG',
                msg: `✅ ПОЛУЧЕНО: ${job.partId}`,
                color: 'text-green-400'
            };
            set((state: any) => ({ actionLogQueue: pushLog(state, event) }));
            audioEngine.playCollect();
        } else {
            (s as any).addEquipmentToInventory(job.partId, job.slotType as any);
        }

        // 3. Удалить job из очереди
        const newQueue = s.craftingQueue.filter(j => j.id !== jobId);

        set({ craftingQueue: newQueue });
    },

    /**
     * Отменить крафт (вернуть 50% ресурсов)
     */
    cancelCraft: (jobId) => {
        const s = get();

        const job = s.craftingQueue.find(j => j.id === jobId);
        if (!job) {
            console.warn(`[craftSlice] Job not found: ${jobId}`);
            return;
        }

        // Вернуть 50% ресурсов
        const partDef = getPartDefinition(job.partId);
        if (!partDef) return;

        const newResources = refundResources(partDef.cost, s.resources as any, 0.5);
        const newQueue = s.craftingQueue.filter(j => j.id !== jobId);

        const cancelEvent: VisualEvent = {
            type: 'LOG',
            msg: `❌ ОТМЕНЁН КРАФТ: ${job.partId} (возврат 50% ресурсов)`,
            color: 'text-yellow-400'
        };

        set({
            resources: newResources as any,
            craftingQueue: newQueue,
            actionLogQueue: pushLog(s as any, cancelEvent)
        });
        audioEngine.playClick();
    },

    /**
     * Мгновенно завершить весь крафт (чит)
     */
    adminInstantCompleteCrafting: () => {
        const s = get();
        const now = Date.now();

        const updatedQueue = s.craftingQueue.map(job => {
            if (job.status === 'in_progress') {
                return {
                    ...job,
                    completionTime: now - 1000 // Готово секунду назад
                };
            }
            return job;
        });

        const event: VisualEvent = {
            type: 'LOG',
            msg: '⚡ ЧИТ: ВЕСЬ КРАФТ ЗАВЕРШЁН МГНОВЕННО',
            color: 'text-yellow-400 font-bold'
        };

        set({
            craftingQueue: updatedQueue,
            actionLogQueue: pushLog(s as any, event)
        });

        audioEngine.playLog();
    }
});
