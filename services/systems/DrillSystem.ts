/**
 * DrillSystem — управление бурением и добычей
 * 
 * Отвечает за:
 * - Увеличение глубины
 * - Добыча ресурсов по биому
 * - Эффективность бурения
 * - Разблокировка контента по глубине
 * - **[NEW v4.0]** Потребление топлива при бурении
 */

import { GameState, VisualEvent, Stats, ResourceType, Resources } from '../../types';
import { BIOMES } from '../../constants';
import { ResourceChanges } from './types';
import { processSideTunnel } from './SideTunnelSystem';

// === ТОПЛИВНАЯ СИСТЕМА ===

/**
 * Скорость потребления топлива (% от drillPower)
 * 0.01 = 1% drillPower расходуется как топливо каждый тик
 */
const FUEL_CONSUMPTION_RATE = 0.1;

/**
 * Эффективность топлива (как долго 1 единица топлива работает)
 * Чем выше значение, тем МЕНЬШЕ расходуется топлива
 */
const FUEL_EFFICIENCY: Partial<Record<ResourceType, number>> = {
    [ResourceType.COAL]: 1.0,  // Базовая эффективность
    [ResourceType.OIL]: 1.5,   // На 50% эффективнее угля
    [ResourceType.GAS]: 2.0,   // В 2 раза эффективнее угля
};

/**
 * Выбор лучшего доступного топлива (приоритет: gas > oil > coal)
 * Возвращает { fuelType, efficiency } или null если топливо закончилось
 */
function selectBestAvailableFuel(resources: Resources): { fuelType: ResourceType; efficiency: number } | null {
    if (resources[ResourceType.GAS] > 0) {
        return { fuelType: ResourceType.GAS, efficiency: FUEL_EFFICIENCY[ResourceType.GAS]! };
    }
    if (resources[ResourceType.OIL] > 0) {
        return { fuelType: ResourceType.OIL, efficiency: FUEL_EFFICIENCY[ResourceType.OIL]! };
    }
    if (resources[ResourceType.COAL] > 0) {
        return { fuelType: ResourceType.COAL, efficiency: FUEL_EFFICIENCY[ResourceType.COAL]! };
    }
    return null; // Топливо закончилось
}

export interface DrillUpdate {
    depth: number;
    forgeUnlocked: boolean;
    cityUnlocked: boolean;
    skillsUnlocked: boolean;
    storageLevel: number;
    isDrilling?: boolean; // NEW: Возможность остановить бурение из системы (например, при перегрузе)
}

/**
 * Обработка бурения
 */
export function processDrilling(
    state: GameState,
    stats: Stats,
    activeEffects: GameState['activeEffects'],
    isDrilling: boolean,
    isOverheated: boolean,
    dt: number,
    activePerks: string[] = [],
    cheats: { isInfiniteFuel?: boolean, isZeroWeight?: boolean } = {} // NEW: Явная передача читов
): { update: DrillUpdate & { sideTunnel?: GameState['sideTunnel'] }; resourceChanges: ResourceChanges; events: VisualEvent[] } {
    const events: VisualEvent[] = [];
    let resourceChanges: ResourceChanges = {};

    let depth = state.depth;
    let { forgeUnlocked, cityUnlocked, skillsUnlocked, storageLevel } = state;

    // Блокировка бурения во время перемещения
    if (state.travel) {
        return {
            update: { depth, forgeUnlocked, cityUnlocked, skillsUnlocked, storageLevel },
            resourceChanges,
            events
        };
    }

    // === ПРЕДВАРИТЕЛЬНЫЙ РАСЧЕТ МНОЖИТЕЛЕЙ ===
    let speedMult = 1;
    let resMult = 1;
    let dropMult = 1;
    activeEffects.forEach(e => {
        if (e.modifiers.drillSpeedMultiplier) speedMult *= e.modifiers.drillSpeedMultiplier;
        if (e.modifiers.resourceMultiplier) resMult *= e.modifiers.resourceMultiplier;
        if (e.modifiers.consumableDropMultiplier) dropMult *= e.modifiers.consumableDropMultiplier;
    });

    if (activePerks.includes('EXECUTIVE')) {
        resMult *= 2;
    }

    // === PHASE 3: SIDE TUNNEL EXPLORATION ===
    if (state.sideTunnel && isDrilling && !isOverheated && !state.isBroken && !state.currentBoss) {
        const drillPower = stats.totalSpeed * speedMult * (state.isOverdrive ? 10 : 1);

        const result = processSideTunnel(state, drillPower, dt, state.settings.language);

        // Объединяем результаты
        events.push(...result.events);

        // ВАЖНО: Мы НЕ увеличиваем глубину, пока в туннеле.
        // Мы возвращаем обновленный sideTunnel.
        return {
            update: {
                ...result.update,
                depth,
                forgeUnlocked,
                cityUnlocked,
                skillsUnlocked,
                storageLevel,
                sideTunnel: result.update.sideTunnel
            } as any,
            resourceChanges: result.resourceChanges,
            events
        };
    }

    // Разблокировка контента по глубине
    if (!forgeUnlocked && depth >= 50) forgeUnlocked = true;
    if (!cityUnlocked && depth >= 200) cityUnlocked = true;
    if (!skillsUnlocked && depth >= 400) skillsUnlocked = true;
    if (storageLevel === 0 && depth >= 600) storageLevel = 1;
    if (storageLevel === 1 && Object.keys(state.inventory).length > 0) storageLevel = 2;

    // Бурение активно
    if (isDrilling && !isOverheated && !state.isBroken && !state.currentBoss) {
        // === ПРОВЕРКА ПЕРЕГРУЗА ===
        const cargoWeight = state.currentCargoWeight;
        const maxCapacity = stats.totalCargoCapacity;
        if (!cheats.isZeroWeight && cargoWeight > maxCapacity) {
            events.push({
                type: 'LOG',
                msg: `⚠️ ГРУЗОВОЙ ОТСЕК ПЕРЕПОЛНЕН! (${Math.floor(cargoWeight)}/${Math.floor(maxCapacity)}) Сбросьте балласт или вернитесь в город.`,
                color: 'text-red-500 font-bold'
            });
            return {
                update: { depth, forgeUnlocked, cityUnlocked, skillsUnlocked, storageLevel, isDrilling: false },
                resourceChanges,
                events
            };
        }

        // === ПРОВЕРКА ТОПЛИВА ===
        const fuel = selectBestAvailableFuel(state.resources);
        const isInfiniteFuel = cheats.isInfiniteFuel;
        let isLowFuelMode = false;

        if (!fuel && !isInfiniteFuel) {
            // Топливо закончилось - включаем режим "ручного" бурения (Survival Mode)
            isLowFuelMode = true;
            if (Math.random() < 0.01 * dt * 60) {
                events.push({
                    type: 'LOG',
                    msg: '⚠️ ТОПЛИВО ЗАКОНЧИЛОСЬ! Переход на ручной привод (Скорость -95%).',
                    color: 'text-orange-500'
                });
            }
        }

        // Лог предупреждения при низкой эффективности
        if (stats.drillingEfficiency < 0.5 && Math.random() < 0.02 * dt * 60) {
            events.push({
                type: 'LOG',
                msg: `ОШИБКА: ПЛОТНОСТЬ ПОРОДЫ > ТВЕРДОСТЬ БУРА. ТРЕБУЕТСЯ TIER ${stats.requiredTier}.`,
                color: "text-orange-500 font-mono"
            });
        }

        // Использование сгруппированных множителей

        // Расчёт скорости с учётом твёрдости породы (вынесено сюда для линейности)
        const hardness = Math.min(1.0, (depth / 10000));
        const torqueMult = Math.max(0.1, 1.0 - (stats.torque / 100));
        const speedPenalty = Math.max(0.05, 1.0 - (hardness * torqueMult));

        // Итоговая мощность бурения
        let drillPower = stats.totalSpeed * speedPenalty * speedMult;
        if (isLowFuelMode) drillPower *= 0.05; // Штраф за отсутствие топлива
        if (state.isOverdrive) drillPower *= 100;

        // === ПОТРЕБЛЕНИЕ ТОПЛИВА ===
        let consumptionMult = 1.0;
        if (activePerks.includes('SMUGGLER')) {
            consumptionMult *= 0.8; // -20% consumption
        }

        const fuelCost = (drillPower * FUEL_CONSUMPTION_RATE * dt * 10 * consumptionMult) / (fuel?.efficiency || 1);

        if (!isInfiniteFuel && fuel) {
            resourceChanges[fuel.fuelType] = (resourceChanges[fuel.fuelType] || 0) - fuelCost;
        }

        // Увеличение глубины (только если не выбран конкретный биом)
        if (!state.selectedBiome) {
            depth += drillPower * dt;
        }

        // Добыча ресурсов
        const currentBiome = state.selectedBiome
            ? BIOMES.find(b => (typeof b.name === 'string' ? b.name : b.name.EN) === state.selectedBiome) || BIOMES[0]
            : BIOMES.slice().reverse().find(b => depth >= b.depth) || BIOMES[0];

        const resToAdd = drillPower * 1.0 * resMult * (1 + stats.artifactMods.resourceMultPct / 100) * dt; // Восстановлено до 1.0 по просьбе пользователя
        resourceChanges[currentBiome.resource] = (resourceChanges[currentBiome.resource] || 0) + resToAdd;

        // [POLISHING] Rare Resource Feedback
        if ((currentBiome.resource === ResourceType.ANCIENT_TECH || currentBiome.resource === ResourceType.NANO_SWARM) && Math.random() < 0.05 * dt * 60) {
            events.push({
                type: 'LOG',
                msg: `💎 ОБНАРУЖЕН РЕДКИЙ МАТЕРИАЛ: ${currentBiome.resource.toUpperCase()}`,
                color: 'text-purple-400 font-bold',
                icon: '✨'
            });
        }

        // [VISUALS] Mining Effects
        if (Math.random() < (0.3 + (drillPower > 10 ? 0.2 : 0)) * dt * 60) {
            events.push({
                type: 'PARTICLE',
                position: 'DRILL_TIP',
                kind: Math.random() > 0.7 ? 'SPARK' : 'DEBRIS',
                color: currentBiome.color,
                count: Math.floor(Math.random() * 3) + 1
            });
        }

        // [BALANCE v0.5] Consumable Drops (Prospector Luck)

        // Базовый шанс: 0.05% в секунду (восстановлено)
        if (Math.random() < 0.0005 * dropMult * dt * 60) {
            const dropRoll = Math.random();
            const consumableType = dropRoll < 0.6 ? ResourceType.SCRAP : ResourceType.ICE;
            const amount = Math.floor(Math.random() * 3) + 2; // 2-4 единицы сырья
            resourceChanges[consumableType] = (resourceChanges[consumableType] || 0) + amount;

            events.push({
                type: 'LOG',
                msg: `📦 НАЙДЕНО В ПОРОДЕ: ${consumableType === ResourceType.SCRAP ? 'ЛОМ' : 'ЛЁД'} (+${amount})`,
                color: 'text-zinc-400 font-bold',
                icon: consumableType === ResourceType.SCRAP ? '♻️' : '❄️'
            });
            events.push({
                type: 'TEXT',
                position: 'CENTER',
                text: `+${amount} ${consumableType.toUpperCase()}`,
                style: 'RESOURCE',
                color: consumableType === ResourceType.SCRAP ? '#A1A1AA' : '#22D3EE'
            });
        }

        // Floating Text - показываем даже малые значения для фидбека
        if (resToAdd > 0 && Math.random() < 0.2 * dt * 60) {
            events.push({
                type: 'TEXT',
                position: 'CENTER',
                text: `+${resToAdd < 1 ? resToAdd.toFixed(2) : resToAdd < 10 ? resToAdd.toFixed(1) : Math.floor(resToAdd)} ${currentBiome.resource.toUpperCase()}`,
                style: 'RESOURCE'
            });
        }

        // Шанс найти вторичные ресурсы: ~4% в секунду (восстановлено)
        if (Math.random() < 0.04 * dt) {
            const secondaryRoll = Math.random();

            // Ice: 60% of secondary loot (common)
            if (secondaryRoll < 0.6) {
                const iceAmount = Math.max(1, Math.floor(drillPower * 0.1 * dt));
                if (iceAmount > 0) {
                    resourceChanges[ResourceType.ICE] = (resourceChanges[ResourceType.ICE] || 0) + iceAmount;
                    if (Math.random() < 0.3) { // Не спамить текстом
                        events.push({
                            type: 'TEXT',
                            position: 'CENTER',
                            text: `+${iceAmount} ICE`,
                            style: 'RESOURCE',
                            color: '#A5F2F3'
                        });
                    }
                }
            }
            // Scrap: 40% of secondary loot
            else {
                const scrapAmount = Math.max(1, Math.floor(drillPower * 0.05 * dt));
                if (scrapAmount > 0) {
                    resourceChanges[ResourceType.SCRAP] = (resourceChanges[ResourceType.SCRAP] || 0) + scrapAmount;
                    if (Math.random() < 0.3) {
                        events.push({
                            type: 'TEXT',
                            position: 'CENTER',
                            text: `+${scrapAmount} SCRAP`,
                            style: 'RESOURCE',
                            color: '#777777'
                        });
                    }
                }
            }
        }
    }

    return {
        update: {
            depth,
            forgeUnlocked,
            cityUnlocked,
            skillsUnlocked,
            storageLevel
        },
        resourceChanges,
        events
    };
}
