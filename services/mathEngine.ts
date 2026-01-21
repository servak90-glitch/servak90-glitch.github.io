/**
 * Математическое Ядро Баланса v0.3.6
 * Централизованная система расчётов для всех игровых механик
 * 
 * Основано на:
 * - Sequential Thinking Analysis (22 мысли)
 * - Gemini Chat v0.3.6 Design Document
 * - User Decisions (Phase 1 approved)
 */

import { GLOBAL_BALANCE_CONFIG, RegionId, FuelType } from './mathEngineConfig';
import type { Resources, DrillState, EquipmentItem } from '../types';
import { calculateCargoWeight } from './gameMath';  // ИСПОЛЬЗУЕМ СУЩЕСТВУЮЩУЮ СИСТЕМУ!

// ============================================
// DEPTH SCALING (Gemini Chat)
// ============================================

/**
 * Рассчитывает шкалу глубины для масштабирования характеристик
 * Используется для Boss HP, Resource Value, Event Difficulty
 * 
 * Формула: S_d = 1 + (Depth / DEPTH_UNIT)^ALPHA_PROG
 * 
 * @param depth - Текущая глубина бурения (метры)
 * @returns Множитель масштабирования (1.0 = базовый уровень)
 * 
 * @example
 * calculateDepthScale(0)      // 1.0   (0% бонуса)
 * calculateDepthScale(5000)   // 2.0   (100% бонуса)
 * calculateDepthScale(25000)  // 7.25  (~625% бонуса)
 */
export function calculateDepthScale(depth: number): number {
    return 1 + Math.pow(
        depth / GLOBAL_BALANCE_CONFIG.DEPTH_UNIT,
        GLOBAL_BALANCE_CONFIG.ALPHA_PROG
    );
}

// ============================================
// CRAFTING TIME (Gemini Chat)
// ============================================

/**
 * Рассчитывает время крафта equipment в Forge
 * ДЛЯ БУДУЩЕЙ Crafting Queue системы (Phase 2)
 * 
 * Формула: T_craft = BASE_CRAFT_TIME × Tier^1.5 × K_DIFF
 * 
 * @param tier - Тир предмета (1-15)
 * @returns Время крафта в секундах
 * 
 * @example
 * calculateCraftTime(1)   // 60s   (1 минута)
 * calculateCraftTime(5)   // 671s  (~11 минут)
 * calculateCraftTime(15)  // 3488s (~58 минут)
 */
export function calculateCraftTime(tier: number): number {
    return GLOBAL_BALANCE_CONFIG.BASE_CRAFT_TIME
        * Math.pow(tier, 1.5)
        * GLOBAL_BALANCE_CONFIG.K_DIFF;
}

// ============================================
// EQUIPMENT MASS & TOTAL MASS
// ============================================

/**
 * Рассчитывает массу одной детали бура по её ID
 * Использует массы из constants.tsx (сгенерированные формулами)
 * 
 * @param partId - ID детали (например: "bit_5", "engine_12")
 * @returns Масса детали в кг, или 0 если не найдена
 */
function getEquipmentMassById(partId: string): number {
    // TODO: Временная реализация, заменить на реальные данные из constants
    // После добавления поля mass в constants.tsx это будет брать оттуда

    // Парсим ID
    const match = partId.match(/^(\w+)_(\d+)$/);
    if (!match) return 0;

    const [, type, tierStr] = match;
    const tier = parseInt(tierStr, 10);

    // Временные формулы (пока mass не добавлен в constants.tsx)
    const formulas: Record<string, (t: number) => number> = {
        bit: (t) => Math.round(10 * Math.pow(t, 0.75)),
        engine: (t) => Math.round(80 * Math.pow(t, 0.8)),
        cooling: (t) => Math.round(30 * Math.pow(t, 0.7)),
        hull: (t) => Math.round(500 * Math.pow(t, 0.875)),
        logic: (t) => Math.round(5 * Math.pow(t, 0.6)),
        control: (t) => Math.round(8 * Math.pow(t, 0.65)),
        gearbox: (t) => Math.round(50 * Math.pow(t, 0.8)),
        power: (t) => Math.round(100 * Math.pow(t, 0.85)),
        armor: (t) => Math.round(150 * Math.pow(t, 0.9)),
        cargoBay: (t) => Math.round(200 * Math.pow(t, 0.85))
    };

    const formula = formulas[type];
    return formula ? formula(tier) : 0;
}

/**
 * Рассчитывает полную массу установленного на бур оборудования
 * 
 * @param drill - Текущее состояние бура (DrillState)
 * @returns Общая масса всех установленных деталей (кг)
 */
export function calculateDrillMass(drill: DrillState): number {
    let totalMass = 0;

    totalMass += getEquipmentMassById(drill.bit.id);
    totalMass += getEquipmentMassById(drill.engine.id);
    totalMass += getEquipmentMassById(drill.cooling.id);
    totalMass += getEquipmentMassById(drill.hull.id);
    totalMass += getEquipmentMassById(drill.logic.id);
    totalMass += getEquipmentMassById(drill.control.id);
    totalMass += getEquipmentMassById(drill.gearbox.id);
    totalMass += getEquipmentMassById(drill.power.id);
    totalMass += getEquipmentMassById(drill.armor.id);

    // Cargo Bay опционален
    if (drill.cargoBay) {
        totalMass += getEquipmentMassById(drill.cargoBay.id);
    }

    return totalMass;
}

/**
 * Рассчитывает полную массу для Global Map путешествий
 * ИСПРАВЛЕННАЯ ФОРМУЛА: M_total = M_drill + M_cargo + M_fuel
 * 
 * @param drill - Текущее состояние бура
 * @param resources - Ресурсы игрока
 * @returns Полная масса в кг
 * 
 * @example
 * // Tier 5 бур (~4500кг) + 1000 iron (5000кг) + 50 coal (150кг) = 9650кг
 */
export function calculateTotalMass(
    drill: DrillState,
    resources: Partial<Resources>,
    equipmentInventory: EquipmentItem[] = []
): number {
    // Масса установленного оборудования
    const drillMass = calculateDrillMass(drill);

    // Масса ресурсов в инвентаре (используем СУЩЕСТВУЮЩУЮ систему!)
    const cargoMass = calculateCargoWeight(resources);

    // Масса топлива (если хранится в resources)
    const fuelMass =
        ((resources.coal || 0) * 3) +
        ((resources.oil || 0) * 2) +
        ((resources.gas || 0) * 1);

    // НОВОЕ: Масса оборудования в инвентаре (Phase 2.3)
    const inventoryMass = equipmentInventory.reduce((acc, item) => {
        return acc + getEquipmentMassById(item.partId);
    }, 0);

    return drillMass + cargoMass + fuelMass + inventoryMass;
}

// ============================================
// GLOBAL MAP PHYSICS
// ============================================

/**
 * Рассчитывает расход топлива на путешествие
 * КВАДРАТИЧНАЯ зависимость от массы (физически обоснованная)
 * 
 * Формула: F = (D / L_type) × (1 + (M/M_max)² × K_drag)
 * 
 * @param distance - Расстояние (км)
 * @param mass - Текущая масса (кг)
 * @param maxMass - Максимальная грузоподъёмность (кг)
 * @param fuelType - Тип топлива ('coal' | 'oil' | 'gas')
 * @param regionId - ID региона для регионального модификатора
 * @returns Количество единиц топлива
 * 
 * @example
 * // 1000км, 50% загрузки, газ, Rust Valley
 * calculateFuelConsumption(1000, 5000, 10000, 'gas', 'rust_valley')
 * // = (1000/500) × (1 + 0.25 × 1.0) = 2.5 газа
 */
export function calculateFuelConsumption(
    distance: number,
    mass: number,
    maxMass: number,
    fuelType: FuelType,
    regionId: RegionId
): number {
    const L_type = GLOBAL_BALANCE_CONFIG.FUEL_EFFICIENCY[fuelType];
    const K_drag = GLOBAL_BALANCE_CONFIG.REGION_DRAG[regionId];

    // Квадратичная зависимость от загрузки
    const loadFactor = Math.pow(mass / maxMass, GLOBAL_BALANCE_CONFIG.MASS_PENALTY);
    const baseConsumption = distance / L_type;

    return baseConsumption * (1 + loadFactor * K_drag);
}

/**
 * Рассчитывает фактическую скорость движения
 * Учитывает перегруз и эффективность двигателя
 * 
 * Формула: V_act = V_base × (1 - SPEED_PENALTY_FACTOR × M/M_max) × η_engine
 * 
 * @param baseSpeed - Базовая скорость (км/ч)
 * @param mass - Текущая масса (кг)
 * @param maxMass - Максимальная грузоподъёмность (кг)
 * @param engineEfficiency - Эффективность двигателя (1.0 = 100%)
 * @returns Фактическая скорость (км/ч)
 * 
 * @example
 * // 100 км/ч, 50% загрузки, эффективность 1.0
 * calculateTravelSpeed(100, 5000, 10000, 1.0)
 * // = 100 × (1 - 0.5 × 0.5) × 1.0 = 75 км/ч
 */
export function calculateTravelSpeed(
    baseSpeed: number,
    mass: number,
    maxMass: number,
    engineEfficiency: number
): number {
    const loadRatio = mass / maxMass;
    const speedPenalty = GLOBAL_BALANCE_CONFIG.SPEED_PENALTY_FACTOR * loadRatio;

    let actualSpeed = baseSpeed * (1 - speedPenalty) * engineEfficiency;

    // Ограничение снизу: минимум 20% базовой скорости
    actualSpeed = Math.max(actualSpeed, baseSpeed * GLOBAL_BALANCE_CONFIG.MIN_TRAVEL_SPEED_PERCENT);

    return actualSpeed;
}

/**
 * Рассчитывает время путешествия (в миллисекундах)
 * 
 * @param distance - Расстояние (км)
 * @param speed - Скорость (км/ч)
 * @returns Время в ms
 */
export function calculateTravelDuration(distance: number, speed: number): number {
    if (speed <= 0) return 0;
    const hours = distance / speed;
    return hours * 3600 * 1000; // Часы в миллисекунды
}

/**
 * Рассчитывает вероятность инцидента во время путешествия
 * Использует Poisson распределение: P(X≥1) = 1 - e^(-λ)
 * 
 * Формула: λ = (D/1000) × (P_base + K_weight × M/M_max)
 *          P = min(1 - e^(-λ), MAX_INCIDENT_CHANCE)
 * 
 * @param distance - Расстояние (км)
 * @param mass - Текущая масса (кг)
 * @param maxMass - Максимальная грузоподъёмность (кг)
 * @param regionId - ID региона
 * @returns Вероятность инцидента (0-1)
 * 
 * @example
 * // 1000км, 50% загрузки, Rust Valley
 * calculateIncidentProbability(1000, 5000, 10000, 'rust_valley')
 * // λ = 1 × (0.05 + 0.3 × 0.5) = 0.2
 * // P = 1 - e^(-0.2) ≈ 18.1%
 */
export function calculateIncidentProbability(
    distance: number,
    mass: number,
    maxMass: number,
    regionId: RegionId
): number {
    const P_base = GLOBAL_BALANCE_CONFIG.REGION_BASE_INCIDENT[regionId];
    const K_weight = GLOBAL_BALANCE_CONFIG.K_WEIGHT_INCIDENT;
    const loadRatio = mass / maxMass;

    // Lambda для Poisson распределения
    const lambda = (distance / 1000) * (P_base + K_weight * loadRatio);

    // Вероятность хотя бы одного инцидента
    const probability = 1 - Math.exp(-lambda);

    // Ограничение сверху (не может быть > 75%)
    return Math.min(probability, GLOBAL_BALANCE_CONFIG.MAX_INCIDENT_CHANCE);
}

/**
 * Рассчитывает бонус охлаждения при движении
 * КВАДРАТИЧНАЯ зависимость от скорости (конвекция)
 * 
 * Формула: ΔC = C_base × (1 + (V_act/V_base)²)
 * 
 * @param baseCooling - Базовое охлаждение (из Cooler Part)
 * @param actualSpeed - Фактическая скорость (км/ч)
 * @param baseSpeed - Базовая скорость без груза (км/ч)
 * @returns Эффективное охлаждение в пути
 * 
 * @example
 * // Cooling 100, скорость 75% от максимума
 * calculateTravelCooling(100, 75, 100)
 * // = 100 × (1 + 0.75²) = 156.25 (на 56% лучше!)
 */
export function calculateTravelCooling(
    baseCooling: number,
    actualSpeed: number,
    baseSpeed: number
): number {
    const speedRatio = actualSpeed / baseSpeed;

    // Квадратичная конвекция (физически более корректно)
    const coolingMultiplier = 1 + Math.pow(speedRatio, GLOBAL_BALANCE_CONFIG.CONVECTION_FACTOR);

    return baseCooling * coolingMultiplier;
}

// ============================================
// VALIDATION & SAFETY
// ============================================

/**
 * Проверяет возможность путешествия
 * Валидация перед стартом
 * 
 * @param mass - Текущая масса (кг)
 * @param maxMass - Максимальная грузоподъёмность (кг)
 * @param fuelAvailable - Доступное топливо
 * @param fuelNeeded - Требуемое топливо
 * @returns Объект с флагом allowed и причиной отказа (если есть)
 */
export function canTravel(
    mass: number,
    maxMass: number,
    fuelAvailable: number,
    fuelNeeded: number
): { allowed: boolean; reason?: string } {
    // Проверка перегруза
    if (mass > maxMass) {
        const overloadPercent = ((mass / maxMass - 1) * 100).toFixed(0);
        return {
            allowed: false,
            reason: `Перегруз! ${mass}кг / ${maxMass}кг (${overloadPercent}% лишнего)`
        };
    }

    // Проверка топлива
    if (fuelAvailable < fuelNeeded) {
        return {
            allowed: false,
            reason: `Недостаточно топлива! Нужно ${fuelNeeded.toFixed(1)}, есть ${fuelAvailable.toFixed(1)}`
        };
    }

    return { allowed: true };
}
