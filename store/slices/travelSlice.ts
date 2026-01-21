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
import { getFuelLabel } from '../../services/travelMath';  // Оставляем только labels
import { recalculateCargoWeight, calculateStats } from '../../services/gameMath';
import { audioEngine } from '../../services/audioEngine';
import { hasRequiredLicense, hasActivePermit, getRequiredLicense } from '../../services/licenseManager';
import { getActivePerkIds } from '../../services/factionLogic';

// ============================================
// NEW: Mathematical Engine v0.3.6
// ============================================
import {
    calculateTotalMass,
    calculateFuelConsumption,
    calculateTravelSpeed,
    calculateTravelDuration,
    calculateIncidentProbability,
    canTravel
} from '../../services/mathEngine';
import { RegionId as MathRegionId, FuelType } from '../../services/mathEngineConfig';

export interface TravelActions {
    /**
     * Перемещение в другой регион
     * Проверяет: топливо, cargo overload, списывает топливо
     */
    travelToRegion: (targetRegion: RegionId, fuelType: ResourceType) => void;

    /**
     * Завершение путешествия (вызывается из tick)
     */
    completeTravel: () => void;

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

        // ============================================
        // NEW: Расчёт топлива через Mathematical Engine v0.3.6
        // ============================================

        // Расстояние между регионами
        const distance = calculateDistance(s.currentRegion, targetRegion);

        // Рассчитываем ПОЛНУЮ массу (M_drill + M_cargo + M_fuel + M_equipment) - НОВОЕ!
        const totalMass = calculateTotalMass(s.drill, s.resources, s.equipmentInventory);
        // maxCapacity уже рассчитан выше

        // Рассчитываем расход топлива через КВАДРАТИЧНУЮ формулу
        const fuelCost = calculateFuelConsumption(
            distance,
            totalMass,
            maxCapacity,
            fuelType as FuelType,  // НОВЫЙ тип FuelType из mathEngineConfig
            s.currentRegion as MathRegionId  // НОВЫЙ тип MathRegionId
        );

        // Применяем perks (Smuggler Routes -20%)
        const activePerks = getActivePerkIds(s.reputation);
        const finalFuelCost = activePerks.includes('SMUGGLER')
            ? Math.ceil(fuelCost * 0.8)
            : Math.ceil(fuelCost);

        // Проверка: Достаточно топлива? (через новую систему canTravel)
        const availableFuel = s.resources[fuelType] || 0;
        const validation = canTravel(totalMass, maxCapacity, availableFuel, finalFuelCost);

        if (!s.isInfiniteFuel && !validation.allowed) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: `⛽ ${validation.reason}`,
                color: 'text-red-500'
            };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        // NEW: Расчёт скорости и времени
        const baseSpeed = stats.travelSpeed || 100;
        const actualSpeed = calculateTravelSpeed(baseSpeed, totalMass, maxCapacity, 1.0);
        const duration = calculateTravelDuration(distance, actualSpeed);

        // ✅ Все проверки пройдены — НАЧАЛО ПУТЕШЕСТВИЯ
        audioEngine.playTravelStart();
        const newResources = s.isInfiniteFuel ? s.resources : {
            ...s.resources,
            [fuelType]: s.resources[fuelType] - finalFuelCost
        };

        const startEvent: VisualEvent = {
            type: 'LOG',
            msg: `🚀 ПЕРЕМЕЩЕНИЕ В ${targetRegion.toUpperCase()} НАЧАТО... (Прибытие через ${Math.round(duration / 1000)}с)`,
            color: 'text-cyan-400'
        };

        set({
            travel: {
                targetRegion,
                startTime: Date.now(),
                duration,
                fuelType,
                fuelCost: finalFuelCost,
                distance
            },
            resources: newResources,
            currentCargoWeight: recalculateCargoWeight(newResources),
            actionLogQueue: pushLog(s, startEvent)
        });
    },

    /**
     * Завершение путешествия
     */
    completeTravel: () => {
        const s = get();
        if (!s.travel) return;

        const target = s.travel.targetRegion;
        const totalMass = calculateTotalMass(s.drill, s.resources, s.equipmentInventory);

        const successEvent: VisualEvent = {
            type: 'LOG',
            msg: `📍 ПЕРЕМЕЩЕНИЕ В ${target.toUpperCase()} ЗАВЕРШЕНО! [Масса: ${Math.round(totalMass)}кг]`,
            color: 'text-green-400 font-bold'
        };

        set({
            currentRegion: target,
            travel: null,
            actionLogQueue: pushLog(s, successEvent)
        });

        audioEngine.playTravelEnd();
    },

    /**
     * Предварительный расчёт стоимости (для UI индикатора)
     * ОБНОВЛЕНО: Mathematical Engine v0.3.6
     */
    calculateTravelCost: (targetRegion, fuelType) => {
        const s = get();

        if (s.currentRegion === targetRegion) return 0;

        const distance = calculateDistance(s.currentRegion, targetRegion);
        const stats = calculateStats(s.drill, s.skillLevels, s.equippedArtifacts, s.inventory, s.depth);
        const maxCapacity = stats.totalCargoCapacity || 1;

        // Рассчитываем ПОЛНУЮ массу (M_drill + M_cargo + M_fuel + M_equipment)
        const totalMass = calculateTotalMass(s.drill, s.resources, s.equipmentInventory);

        // Квадратичная формула расхода топлива
        const fuelCost = calculateFuelConsumption(
            distance,
            totalMass,
            maxCapacity,
            fuelType as FuelType,
            s.currentRegion as MathRegionId
        );

        // Применяем perks
        const activePerks = getActivePerkIds(s.reputation);
        const finalFuelCost = activePerks.includes('SMUGGLER')
            ? Math.ceil(fuelCost * 0.8)
            : Math.ceil(fuelCost);

        return finalFuelCost;
    }
});
