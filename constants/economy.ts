import { ResourceType, BaseType } from '../types';

/**
 * Категории ресурсов для системы квот (Market Saturation)
 */
export enum ResourceCategory {
    COMMON = 'common',    // Глина, Камень
    METALS = 'metals',    // Железо, Медь, Серебро, Золото
    RARES = 'rares',      // Титан, Уран, Драгоценные камни
    TECH = 'tech',        // Технологии, Нано-рои
    FUEL = 'fuel',        // Уголь, Нефть, Газ, Лед
    RAW = 'raw'           // Скрап (Scrap)
}

/**
 * Маппинг ресурсов на категории
 */
export const RESOURCE_TO_CATEGORY: Record<ResourceType, ResourceCategory> = {
    [ResourceType.CLAY]: ResourceCategory.COMMON,
    [ResourceType.STONE]: ResourceCategory.COMMON,

    [ResourceType.COPPER]: ResourceCategory.METALS,
    [ResourceType.IRON]: ResourceCategory.METALS,
    [ResourceType.SILVER]: ResourceCategory.METALS,
    [ResourceType.GOLD]: ResourceCategory.METALS,

    [ResourceType.TITANIUM]: ResourceCategory.RARES,
    [ResourceType.URANIUM]: ResourceCategory.RARES,
    [ResourceType.RUBIES]: ResourceCategory.RARES,
    [ResourceType.EMERALDS]: ResourceCategory.RARES,
    [ResourceType.DIAMONDS]: ResourceCategory.RARES,

    [ResourceType.NANO_SWARM]: ResourceCategory.TECH,
    [ResourceType.ANCIENT_TECH]: ResourceCategory.TECH,

    [ResourceType.COAL]: ResourceCategory.FUEL,
    [ResourceType.OIL]: ResourceCategory.FUEL,
    [ResourceType.GAS]: ResourceCategory.FUEL,
    [ResourceType.ICE]: ResourceCategory.FUEL,

    [ResourceType.SCRAP]: ResourceCategory.RAW,

    // Специальные ресурсы (не влияют на квоты или имеют свои правила)
    [ResourceType.CREDITS]: ResourceCategory.COMMON,
    [ResourceType.REPAIR_KIT]: ResourceCategory.TECH,
    [ResourceType.COOLANT_PASTE]: ResourceCategory.TECH,
    [ResourceType.ADVANCED_COOLANT]: ResourceCategory.TECH,
};

/**
 * Базовые квоты (макс. объем продажи без падения цены)
 */
export const BASE_QUOTAS: Record<ResourceCategory, number> = {
    [ResourceCategory.COMMON]: 2000,
    [ResourceCategory.METALS]: 500,
    [ResourceCategory.RARES]: 100,
    [ResourceCategory.TECH]: 10,
    [ResourceCategory.FUEL]: 1000,
    [ResourceCategory.RAW]: 500,
};

/**
 * Множители квот от типа базы в регионе
 */
export const BASE_QUOTA_MULTIPLIERS: Record<BaseType, number> = {
    outpost: 1.0,
    camp: 1.5,
    station: 3.0,
};

/**
 * Коэффициент восстановления квот
 * Восстановление 10% от макс. квоты каждые 15 минут (15 игровых часов)
 * То есть 0.66% в игровой час.
 */
export const QUOTA_RECOVERY_PER_HOUR = 0.0066;

/**
 * Минимум, до которого может упасть цена при насыщении (20% от номинала)
 */
export const MIN_SATURATION_PRICE_MULT = 0.2;

/**
 * Параметры Контрабандистки Лисы
 */
export const SMUGGLING_CONFIG = {
    FIXED_PRICE_MULT: 0.7,      // 70% от базовой цены
    RAID_RISK_PER_1000: 5,      // +5% риска за каждые 1000 кредитов выручки
    RAID_DURATION_HOURS: 30,    // Блокировка рынка на 30 игровых часов (30 мин реала)
    RAID_RISK_DECAY_PER_HOUR: 1 // Риск падает на 1% каждый игровой час
};
