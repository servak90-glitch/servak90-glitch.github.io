/**
 * DroneSystem — управление дронами
 * 
 * Отвечает за:
 * - Ремонтный дрон
 * - Охлаждающий дрон
 */

import { GameState, Stats, DroneType } from '../../types';

export interface DroneUpdate {
    integrity?: number;
    heat?: number;
}

/**
 * Обработка активных дронов
 */
export function processDrones(
    state: GameState,
    stats: Stats,
    currentIntegrity: number,
    currentHeat: number
): DroneUpdate {
    let integrity = currentIntegrity;
    let heat = currentHeat;
    let hasChanges = false;

    // Ремонтный дрон (Существенно замедлен)
    if (state.activeDrones.includes(DroneType.REPAIR)) {
        const lvl = state.droneLevels[DroneType.REPAIR] || 0;
        const baseRepair = 0.01 * lvl; // Снижено с 0.05 до 0.01
        const repairAmount = baseRepair * stats.droneEfficiency;
        if (integrity < stats.integrity) {
            integrity = Math.min(stats.integrity, integrity + repairAmount);
            hasChanges = true;
        }
    }

    // Охлаждающий дрон
    if (state.activeDrones.includes(DroneType.COOLER) && heat > stats.ambientHeat) {
        const lvl = state.droneLevels[DroneType.COOLER] || 0;
        const baseCool = 0.1 * lvl;
        const coolAmount = baseCool * stats.droneEfficiency; // Применяем droneEfficiency
        heat = Math.max(stats.ambientHeat, heat - coolAmount);
        hasChanges = true;
    }

    return hasChanges
        ? { integrity, heat }
        : {};
}

/**
 * Пассивная регенерация HP - ОТКЛЮЧЕНО (Хардкор-философия)
 * Игрок должен чиниться ремкомплектами или в городе.
 */
export function processRegeneration(
    state: GameState,
    stats: Stats,
    currentIntegrity: number
): number {
    // Регенерация полностью отключена. Здоровье восстанавливается только расходниками или в городе.
    return currentIntegrity;
}
