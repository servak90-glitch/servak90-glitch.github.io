/**
 * Travel Slice — действия перемещения между регионами Global Map
 * 
 * MVP функционал:
 * - travelToRegion: перемещение с проверками топлива и груза
 * - calculateTravelCost: предварительный расчёт
 */

import { SliceCreator, pushLog } from './types';
import { RegionId, ResourceType, VisualEvent } from '../../types';
import { calculateDistance } from '../../services/regionMath';
import { calculateFuelCost, hasSufficientFuel, getFuelLabel } from '../../services/travelMath';
import { recalculateCargoWeight, calculateStats } from '../../services/gameMath';
import { audioEngine } from '../../services/audioEngine';
import { hasRequiredLicense, hasActivePermit, getRequiredLicense } from '../../services/licenseManager';
import { getActivePerkIds } from '../../services/factionLogic';

export interface TravelActions {
    /**
     * Перемещение в другой регион
     * Проверяет: топливо, cargo overload, списывает топливо
     */
    travelToRegion: (targetRegion: RegionId, fuelType: ResourceType) => void;

    /**
     * Предварительный расчёт стоимости поездки (для UI)
     */
    calculateTravelCost: (targetRegion: RegionId, fuelType: ResourceType) => number | null;
}

export const createTravelSlice: SliceCreator<TravelActions> = (set, get) => ({
    /**
     * Перемещение в целевой регион
     */
    travelToRegion: (targetRegion, fuelType) => {
        const s = get();

        // Проверка 1: Уже в этом регионе?
        if (s.currentRegion === targetRegion) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: 'ВЫ УЖЕ В ЭТОМ РЕГИОНЕ',
                color: 'text-yellow-500'
            };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        // Проверка 2: License (зона)
        const requiredZone = getRequiredLicense(targetRegion);
        if (!hasRequiredLicense(s.unlockedLicenses, requiredZone)) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: `⚠️ ТРЕБУЕТСЯ ${requiredZone.toUpperCase()} ZONE LICENSE!`,
                color: 'text-red-500 font-bold'
            };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        // Проверка 3: Permit (разрешение)
        if (!hasActivePermit(s.activePermits, targetRegion)) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: `🎫 ТРЕБУЕТСЯ РАЗРЕШЕНИЕ НА ${targetRegion.toUpperCase()}!`,
                color: 'text-red-500 font-bold'
            };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        // Проверка 4: Cargo overload?
        const stats = calculateStats(s.drill, s.skillLevels, s.equippedArtifacts, s.inventory, s.depth);
        const maxCapacity = stats.totalCargoCapacity;

        if (!s.isZeroWeight && s.currentCargoWeight > maxCapacity) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: `⚠️ ПЕРЕГРУЗ! Вес: ${s.currentCargoWeight}/${maxCapacity}. Сбросьте груз перед перемещением!`,
                color: 'text-red-500 font-bold'
            };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        // Расчёт расстояния и топлива
        const distance = calculateDistance(s.currentRegion, targetRegion);
        const cargoRatio = (s.isZeroWeight || maxCapacity <= 0) ? 0 : s.currentCargoWeight / maxCapacity;
        const activePerks = getActivePerkIds(s.reputation);
        const fuelCost = calculateFuelCost(distance, fuelType, cargoRatio, activePerks);

        // Проверка 3: Достаточно топлива?
        const availableFuel = s.resources[fuelType] || 0;

        if (!s.isInfiniteFuel && !hasSufficientFuel(availableFuel, fuelCost)) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: `⛽ НЕДОСТАТОЧНО ТОПЛИВА! Требуется: ${fuelCost} ${getFuelLabel(fuelType)}, есть: ${availableFuel}`,
                color: 'text-red-500'
            };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        // ✅ Все проверки пройдены — ПЕРЕМЕЩЕНИЕ
        audioEngine.playTravelStart();
        const newResources = s.isInfiniteFuel ? s.resources : {
            ...s.resources,
            [fuelType]: s.resources[fuelType] - fuelCost
        };

        const successEvent: VisualEvent = {
            type: 'LOG',
            msg: `🚀 ПЕРЕМЕЩЕНИЕ В ${targetRegion.toUpperCase()} ЗАВЕРШЕНО! (-${fuelCost} ${getFuelLabel(fuelType)})`,
            color: 'text-green-400 font-bold'
        };

        set({
            currentRegion: targetRegion,
            resources: newResources,
            currentCargoWeight: recalculateCargoWeight(newResources),
            actionLogQueue: pushLog(s, successEvent)
        });

        audioEngine.playTravelEnd();
    },

    /**
     * Предварительный расчёт стоимости (для UI индикатора)
     */
    calculateTravelCost: (targetRegion, fuelType) => {
        const s = get();

        if (s.currentRegion === targetRegion) return 0;

        const distance = calculateDistance(s.currentRegion, targetRegion);
        const stats = calculateStats(s.drill, s.skillLevels, s.equippedArtifacts, s.inventory, s.depth);
        const maxCapacity = stats.totalCargoCapacity || 1;
        const cargoRatio = s.isZeroWeight ? 0 : s.currentCargoWeight / maxCapacity;
        const activePerks = getActivePerkIds(s.reputation);

        return calculateFuelCost(distance, fuelType, cargoRatio, activePerks);
    }
});
