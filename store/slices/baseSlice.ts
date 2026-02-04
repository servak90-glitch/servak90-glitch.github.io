/**
 * Base Slice — действия для управления базами игрока
 */

import { SliceCreator, pushLog } from './types';
import type { RegionId, BaseType, PlayerBase, VisualEvent, FacilityId, Resources, DefenseUnitType } from '../../types';
import { BASE_COSTS, BASE_BUILD_TIMES, BASE_STORAGE_CAPACITY, WORKSHOP_TIER_RANGES } from '../../constants/playerBases';
import { BASE_FACILITIES } from '../../constants/baseFacilities';
import { canBuildFacility } from '../../constants/fuelFacilities';
import { FUEL_RECIPES, canCraftRecipe, getRecipeById } from '../../constants/fuelRecipes';
import { CRAFTING_RECIPES, getCraftingRecipeById, canCraftRecipe as canCraftItem } from '../../constants/craftingRecipes';
import { DEFENSE_UNITS, BASE_REPAIR_COST } from '../../constants/defenseUnits';
import { recalculateCargoWeight } from '../../services/gameMath';
import { audioEngine } from '../../services/audioEngine';

export interface BaseActions {
    buildBase: (regionId: RegionId, baseType: BaseType) => void;
    upgradeBase: (baseId: string) => void;  // Улучшение до следующего тира
    buildFacility: (baseId: string, facilityId: FacilityId) => void;  // Постройка facility
    transferResources: (baseId: string, resource: keyof Resources, amount: number, direction: 'to_base' | 'to_player') => void;
    refineResource: (baseId: string, recipeId: string, rounds?: number) => void;
    craftConsumable: (baseId: string, recipeId: string, rounds?: number) => void; // Крафт в Workshop

    // === PHASE 4: DEFENSE ACTIONS ===
    startDefenseProduction: (baseId: string, unitType: DefenseUnitType) => void;
    repairBase: (baseId: string) => void;

    // === NEW: DRONE STATION ACTIONS ===
    refuelDrones: (baseId: string, fuelType: 'coal' | 'oil' | 'gas', amount: number) => void;
    maintainDrones: (baseId: string) => void;
}

export const createBaseSlice: SliceCreator<BaseActions> = (set, get) => ({
    /**
     * Начать постройку базы
     */
    buildBase: (regionId, baseType) => {
        const s = get();

        // Проверка 1: Только Outpost можно строить изначально
        if (baseType !== 'outpost') {
            const event: VisualEvent = {
                type: 'LOG',
                msg: `СНАЧАЛА НУЖНО ПОСТРОИТЬ АВАНПОСТ!`,
                color: 'text-red-500'
            };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        // Проверка 2: Уже есть база в этом регионе?
        const existingBase = s.playerBases?.find(b => b.regionId === regionId);
        if (existingBase) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: `В ${regionId.toUpperCase()} УЖЕ ЕСТЬ БАЗА!`,
                color: 'text-yellow-500'
            };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        // Проверка 2: Хватает ресурсов?
        const cost = BASE_COSTS[baseType];

        if (s.resources.credits < cost.credits) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: `💰 НЕДОСТАТОЧНО КРЕДИТОВ! Требуется: ${cost.credits}`,
                color: 'text-red-500'
            };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        // Проверка материалов
        for (const [resource, amount] of Object.entries(cost.materials)) {
            if ((s.resources[resource as keyof typeof s.resources] || 0) < (amount || 0)) {
                const event: VisualEvent = {
                    type: 'LOG',
                    msg: `⚠️ НЕДОСТАТОЧНО МАТЕРИАЛОВ!`,
                    color: 'text-red-500'
                };
                set({ actionLogQueue: pushLog(s, event) });
                return;
            }
        }

        // ✅ Оплата
        const newResources = { ...s.resources, credits: s.resources.credits - cost.credits };
        for (const [resource, amount] of Object.entries(cost.materials)) {
            if (resource === 'credits') continue; // Уже сняли выше, хотя в материалах их быть не должно
            newResources[resource as keyof typeof newResources] -= (amount || 0);
        }

        // Создание базы
        const now = Date.now();
        const buildTime = BASE_BUILD_TIMES[baseType];
        const workshopRange = WORKSHOP_TIER_RANGES[regionId][baseType];

        const newBase: PlayerBase = {
            id: `base_${regionId}_${now}`,
            regionId,
            type: baseType,
            status: buildTime === 0 ? 'active' : 'building',

            storageCapacity: BASE_STORAGE_CAPACITY[baseType],
            storedResources: {},

            hasWorkshop: baseType !== 'outpost',
            workshopTierRange: workshopRange,
            hasFuelFacilities: (baseType as string) === 'station',
            hasMarket: (baseType as string) === 'station',
            hasFortification: false,
            hasGuards: false,

            constructionStartTime: now,
            constructionCompletionTime: now + buildTime,
            lastVisitedAt: now,

            upgradeLevel: 1,
            facilities: [],  // Phase 2: пустой массив facilities при создании

            // === PHASE 4: DEFENSE INITIALIZATION ===
            defense: {
                infantry: 0,
                drones: 0,
                turrets: 0,
                integrity: 100,
                shields: 0
            },
            productionQueue: [],

            // === NEW: DRONE STATION INITIALIZATION ===
            droneStation: (baseType as string) === 'station' ? {
                level: 1,
                fuelStorage: { coal: 0, oil: 0, gas: 0 },
                maxFuelStorage: 1000,
                activeDrones: 2,
                maxDrones: 5,
                maintenanceLevel: 100
            } : undefined
        };

        const successEvent: VisualEvent = {
            type: 'LOG',
            msg: `🏗️ ПОСТРОЙКА ${baseType.toUpperCase()} В ${regionId.toUpperCase()} НАЧАТА!`,
            color: 'text-green-400 font-bold'
        };

        set({
            resources: newResources,
            playerBases: [...(s.playerBases || []), newBase],
            actionLogQueue: pushLog(s, successEvent)
        });

        audioEngine.playBaseBuild();
    },

    /**
     * Улучшить существующую базу до следующего тира
     */
    upgradeBase: (baseId) => {
        const s = get();
        const base = s.playerBases?.find(b => b.id === baseId);
        if (!base || base.status === 'building') return;

        // Определить целевой тир
        let nextType: BaseType | null = null;
        if (base.type === 'outpost') nextType = 'camp';
        else if (base.type === 'camp') nextType = 'station';

        if (!nextType) {
            const event: VisualEvent = { type: 'LOG', msg: `БАЗА УЖЕ МАКСИМАЛЬНОГО УРОВНЯ!`, color: 'text-yellow-500' };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        const currentCost = BASE_COSTS[base.type];
        const nextCost = BASE_COSTS[nextType];

        // Рассчитать разницу в стоимости
        const creditsDiff = nextCost.credits - (currentCost.credits || 0);
        const materialsDiff: Partial<Resources> = {};
        for (const [res, amount] of Object.entries(nextCost.materials)) {
            const currentAmount = currentCost.materials[res as keyof Resources] || 0;
            materialsDiff[res as keyof Resources] = Math.max(0, (amount || 0) - currentAmount);
        }

        // Проверка кредитов
        if (s.resources.credits < creditsDiff) {
            const event: VisualEvent = { type: 'LOG', msg: `💰 НЕДОСТАТОЧНО КРЕДИТОВ ДЛЯ АПГРЕЙДА!`, color: 'text-red-500' };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        // Проверка материалов
        for (const [res, amount] of Object.entries(materialsDiff)) {
            if ((s.resources[res as keyof Resources] || 0) < (amount || 0)) {
                const event: VisualEvent = { type: 'LOG', msg: `⚠️ НЕДОСТАТОЧНО МАТЕРИАЛОВ ДЛЯ АПГРЕЙДА!`, color: 'text-red-500' };
                set({ actionLogQueue: pushLog(s, event) });
                return;
            }
        }

        // ✅ Оплата
        const newResources = { ...s.resources, credits: s.resources.credits - creditsDiff };
        for (const [res, amount] of Object.entries(materialsDiff)) {
            newResources[res as keyof Resources] -= (amount || 0);
        }

        // Обновление базы
        const buildTime = BASE_BUILD_TIMES[nextType];
        const workshopRange = WORKSHOP_TIER_RANGES[base.regionId][nextType];

        const updatedBases = s.playerBases.map(b => {
            if (b.id !== baseId) return b;
            return {
                ...b,
                type: nextType!,
                status: (buildTime === 0 ? 'active' : 'building') as import('../../types').BaseStatus,
                storageCapacity: BASE_STORAGE_CAPACITY[nextType!],
                hasWorkshop: nextType !== 'outpost',
                workshopTierRange: workshopRange,
                hasFuelFacilities: nextType === 'station',
                hasMarket: nextType === 'station',
                constructionCompletionTime: Date.now() + buildTime
            };
        });

        const successEvent: VisualEvent = {
            type: 'LOG',
            msg: `🚀 МОДЕРНИЗАЦИЯ БАЗЫ ДО ${nextType.toUpperCase()} НАЧАТА!`,
            color: 'text-cyan-400 font-bold'
        };

        set({
            resources: newResources,
            playerBases: updatedBases,
            actionLogQueue: pushLog(s, successEvent)
        });

        audioEngine.playUpgrade ? audioEngine.playUpgrade() : audioEngine.playBaseBuild();
    },

    /**
     * Постройка Fuel Facility в базе
     */
    buildFacility: (baseId, facilityId) => {
        const s = get();
        const base = s.playerBases?.find(b => b.id === baseId);

        if (!base) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: '❌ База не найдена!',
                color: 'text-red-500'
            };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        // Проверка возможности постройки
        // Используем старую функцию-валидатор, но она работает с FacilityId
        const validation = canBuildFacility(base.facilities || [], facilityId, s.resources.credits);
        if (!validation.canBuild) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: `❌ ${validation.reason}`,
                color: 'text-red-500'
            };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        const facility = BASE_FACILITIES[facilityId];

        // Списать credits и добавить facility
        const updatedBases = s.playerBases.map(b =>
            b.id === baseId
                ? { ...b, facilities: [...(b.facilities || []), facilityId] }
                : b
        );

        const successEvent: VisualEvent = {
            type: 'LOG',
            msg: `🏗️ ${facility.name} ПОСТРОЕНО!`,
            color: 'text-green-400 font-bold'
        };

        set({
            resources: { ...s.resources, credits: s.resources.credits - facility.cost },
            playerBases: updatedBases,
            actionLogQueue: pushLog(s, successEvent)
        });

        audioEngine.playBaseBuild();
    },

    /**
     * Передача ресурсов между кораблем и базой
     */
    transferResources: (baseId, resource, amount, direction) => {
        const s = get();
        const base = s.playerBases.find(b => b.id === baseId);
        if (!base) return;

        if (direction === 'to_base') {
            // Игрок -> База
            const playerAmount = s.resources[resource] || 0;
            const actualAmount = Math.min(amount, playerAmount);
            if (actualAmount <= 0) return;

            // Проверка места на базе
            const currentStoredTotal = Object.values(base.storedResources).reduce((sum, a: any) => sum + (a || 0), 0);
            if (currentStoredTotal + actualAmount > base.storageCapacity) {
                const event: VisualEvent = { type: 'LOG', msg: '❌ ХРАНИЛИЩЕ БАЗЫ ПЕРЕПОЛНЕНО!', color: 'text-red-500' };
                set({ actionLogQueue: pushLog(s, event) });
                return;
            }

            set(state => ({
                resources: { ...state.resources, [resource]: (state.resources[resource] || 0) - actualAmount },
                currentCargoWeight: recalculateCargoWeight({ ...state.resources, [resource]: (state.resources[resource] || 0) - actualAmount }),
                playerBases: state.playerBases.map(b => b.id === baseId ? {
                    ...b,
                    storedResources: { ...b.storedResources, [resource]: (b.storedResources[resource] || 0) + actualAmount }
                } : b)
            }));
        } else {
            // База -> Игрок
            const baseAmount = base.storedResources[resource] || 0;
            const actualAmount = Math.min(amount, baseAmount);
            if (actualAmount <= 0) return;

            set(state => ({
                resources: { ...state.resources, [resource]: (state.resources[resource] || 0) + actualAmount },
                currentCargoWeight: recalculateCargoWeight({ ...state.resources, [resource]: (state.resources[resource] || 0) + actualAmount }),
                playerBases: state.playerBases.map(b => b.id === baseId ? {
                    ...b,
                    storedResources: { ...b.storedResources, [resource]: (b.storedResources[resource] || 0) - actualAmount }
                } : b)
            }));
        }
    },

    /**
     * Переработка ресурсов в топливо
     */
    refineResource: (baseId, recipeId, rounds = 1) => {
        const s = get();
        const base = s.playerBases.find(b => b.id === baseId);
        const recipe = getRecipeById(recipeId);
        if (!base || !recipe) return;

        // Проверка facility
        if (recipe.requiredFacility && !base.facilities.includes(recipe.requiredFacility)) {
            const event: VisualEvent = { type: 'LOG', msg: '⚠️ ТРЕБУЕТСЯ СПЕЦИАЛЬНЫЙ ЗАВОД!', color: 'text-red-400' };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        // Проверка ресурсов
        const canCraftOnce = canCraftRecipe(recipe, s.resources, base.facilities);
        if (!canCraftOnce) {
            const event: VisualEvent = { type: 'LOG', msg: '❌ НЕДОСТАТОЧНО РЕСУРСОВ!', color: 'text-red-500' };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        const maxRounds = Math.floor((s.resources[recipe.input.resource] || 0) / recipe.input.amount);
        const actualRounds = Math.min(rounds, maxRounds);

        const totalInput = recipe.input.amount * actualRounds;
        const totalOutput = recipe.output.amount * actualRounds;

        set(state => {
            const newRes = {
                ...state.resources,
                [recipe.input.resource]: (state.resources[recipe.input.resource] || 0) - totalInput,
                [recipe.output.resource]: (state.resources[recipe.output.resource] || 0) + totalOutput
            };
            return {
                resources: newRes,
                currentCargoWeight: recalculateCargoWeight(newRes),
                actionLogQueue: pushLog(state, { type: 'LOG', msg: `🏭 ПЕРЕРАБОТКА: +${totalOutput} ${recipe.output.resource.toUpperCase()}`, color: 'text-green-400' })
            };
        });

        audioEngine.playBaseBuild();
    },

    /**
     * Начало производства юнита обороны
     */
    startDefenseProduction: (baseId, unitType) => {
        const s = get();
        const base = s.playerBases.find(b => b.id === baseId);
        if (!base) return;

        const unitDef = DEFENSE_UNITS[unitType];

        // Проверка ресурсов
        for (const [resource, amount] of Object.entries(unitDef.cost)) {
            if ((s.resources[resource as keyof Resources] || 0) < (amount || 0)) {
                const event: VisualEvent = { type: 'LOG', msg: `❌ НЕДОСТАТОЧНО РЕСУРСОВ ДЛЯ ${unitDef.name.RU.toUpperCase()}!`, color: 'text-red-500' };
                set({ actionLogQueue: pushLog(s, event) });
                return;
            }
        }

        // Списание ресурсов
        const newResources = { ...s.resources };
        for (const [resource, amount] of Object.entries(unitDef.cost)) {
            newResources[resource as keyof Resources] -= (amount || 0);
        }

        const now = Date.now();
        const newJob = {
            id: `def_${unitType}_${now}`,
            unitType,
            startTime: now,
            completionTime: now + unitDef.buildTime
        };

        set({
            resources: newResources,
            playerBases: s.playerBases.map(b => b.id === baseId ? {
                ...b,
                productionQueue: [...(b.productionQueue || []), newJob]
            } : b),
            actionLogQueue: pushLog(s, { type: 'LOG', msg: `🛡️ ПРОИЗВОДСТВО ${unitDef.name.RU.toUpperCase()} НАЧАТО!`, color: 'text-cyan-400' })
        });
    },



    /**
     * Ремонт базы
     */
    repairBase: (baseId) => {
        const s = get();
        const base = s.playerBases.find(b => b.id === baseId);
        if (!base) return;

        // Fallback для старых баз без defense
        const baseDefense = base.defense ?? { integrity: 100, shields: 0, infantry: 0, drones: 0, turrets: 0 };
        if (baseDefense.integrity >= 100) return;

        // Проверка ресурсов
        if (s.resources.scrap < BASE_REPAIR_COST.scrap || s.resources.iron < BASE_REPAIR_COST.iron) {
            const event: VisualEvent = { type: 'LOG', msg: '❌ НЕДОСТАТОЧНО МАТЕРИАЛОВ ДЛЯ РЕМОНТА!', color: 'text-red-500' };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        set(state => ({
            resources: {
                ...state.resources,
                scrap: state.resources.scrap - BASE_REPAIR_COST.scrap,
                iron: state.resources.iron - BASE_REPAIR_COST.iron
            },
            playerBases: state.playerBases.map(b => b.id === baseId ? {
                ...b,
                defense: { ...b.defense, integrity: 100 }
            } : b),
            actionLogQueue: pushLog(state, { type: 'LOG', msg: '🛠️ БАЗА ОТРЕМОНТИРОВАНА!', color: 'text-green-400' })
        }));
    },

    /**
     * Крафт расходников в Workshop
     */
    craftConsumable: (baseId, recipeId, rounds = 1) => {
        const s = get();
        const base = s.playerBases.find(b => b.id === baseId);
        const recipe = getCraftingRecipeById(recipeId);
        if (!base || !recipe) return;

        // Проверка facility
        if (recipe.requiredFacility && !base.facilities.includes(recipe.requiredFacility)) {
            const event: VisualEvent = { type: 'LOG', msg: '⚠️ ТРЕБУЕТСЯ МАСТЕРСКАЯ!', color: 'text-red-400' };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        // Проверка ресурсов
        const canCraftOnce = canCraftItem(recipe, s.resources);
        if (!canCraftOnce) {
            const event: VisualEvent = { type: 'LOG', msg: '❌ НЕДОСТАТОЧНО РЕСУРСОВ!', color: 'text-red-500' };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        // Рассчитать макс. количество раундов
        let maxPossibleRounds = rounds;
        for (const item of recipe.input) {
            const available = s.resources[item.resource] || 0;
            const possible = Math.floor(available / item.amount);
            maxPossibleRounds = Math.min(maxPossibleRounds, possible);
        }

        const actualRounds = Math.max(0, maxPossibleRounds);
        if (actualRounds === 0) return;

        set(state => {
            const newRes = { ...state.resources };

            // Списать ресурсы
            for (const item of recipe.input) {
                newRes[item.resource] -= item.amount * actualRounds;
            }

            // Добавить результат (consumable в resources)
            const outputRes = recipe.output.resource;
            newRes[outputRes] = (newRes[outputRes] || 0) + (recipe.output.amount * actualRounds);

            // Обработка consumables для UI (если нужно дублировать в state.consumables)
            const updatedConsumables = { ...state.consumables };
            if (outputRes === 'repairKit') updatedConsumables.repairKit += (recipe.output.amount * actualRounds);
            if (outputRes === 'coolantPaste') updatedConsumables.coolantPaste += (recipe.output.amount * actualRounds);
            if (outputRes === 'advancedCoolant') updatedConsumables.advancedCoolant += (recipe.output.amount * actualRounds);

            return {
                resources: newRes,
                consumables: updatedConsumables,
                currentCargoWeight: recalculateCargoWeight(newRes),
                actionLogQueue: pushLog(state, {
                    type: 'LOG',
                    msg: `🛠️ СКРАФЧЕНО: ${typeof recipe.name === 'string' ? recipe.name : (recipe.name as any).RU} x${actualRounds * recipe.output.amount}`,
                    color: 'text-cyan-400'
                })
            };
        });

        audioEngine.playBaseBuild();
    },

    /**
     * Заправка дронов на базе
     */
    refuelDrones: (baseId, fuelType, amount) => {
        const s = get();
        const base = s.playerBases.find(b => b.id === baseId);
        if (!base || !base.droneStation) return;

        // Проверка наличия ресурса у игрока
        const playerAmount = s.resources[fuelType] || 0;
        const actualAmount = Math.min(amount, playerAmount);

        // Проверка места в баках дронов
        const currentFuel = base.droneStation.fuelStorage[fuelType];
        const canAccept = base.droneStation.maxFuelStorage - currentFuel;
        const finalAmount = Math.min(actualAmount, canAccept);

        if (finalAmount <= 0) return;

        set(state => ({
            resources: { ...state.resources, [fuelType]: state.resources[fuelType] - finalAmount },
            playerBases: state.playerBases.map(b => b.id === baseId ? {
                ...b,
                droneStation: {
                    ...b.droneStation!,
                    fuelStorage: {
                        ...b.droneStation!.fuelStorage,
                        [fuelType]: b.droneStation!.fuelStorage[fuelType] + finalAmount
                    }
                }
            } : b),
            actionLogQueue: pushLog(state, { type: 'LOG', msg: `⛽ ЗАПРАВКА ДРОНОВ: +${finalAmount} ${fuelType.toUpperCase()}`, color: 'text-cyan-400' })
        }));
    },

    /**
     * Обслуживание (ремонт) дронов
     */
    maintainDrones: (baseId) => {
        const s = get();
        const base = s.playerBases.find(b => b.id === baseId);
        if (!base || !base.droneStation) return;

        const repairCost = 100; // credits
        if (s.resources.credits < repairCost) return;

        set(state => ({
            resources: { ...state.resources, credits: state.resources.credits - repairCost },
            playerBases: state.playerBases.map(b => b.id === baseId ? {
                ...b,
                droneStation: { ...b.droneStation!, maintenanceLevel: 100 }
            } : b),
            actionLogQueue: pushLog(state, { type: 'LOG', msg: `🛠️ ДРОНЫ ТЕХНИЧЕСКИ ОБСЛУЖЕНЫ`, color: 'text-green-400' })
        }));
    }
});
