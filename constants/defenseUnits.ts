
import { ResourceType, DefenseUnitType, Resources } from '../types';

export interface DefenseUnitDef {
    type: DefenseUnitType;
    name: { RU: string; EN: string };
    description: { RU: string; EN: string };
    cost: Partial<Resources>;
    buildTime: number; // мс
    defensePower: number;
}

export const DEFENSE_UNITS: Record<DefenseUnitType, DefenseUnitDef> = {
    infantry: {
        type: 'infantry',
        name: { RU: 'Пехота / Стражи', EN: 'Garrison / Sentinels' },
        description: { RU: 'Базовая оборона от мелких грабителей.', EN: 'Basic defense against small looters.' },
        cost: { [ResourceType.SCRAP]: 10, [ResourceType.COAL]: 5 },
        buildTime: 10000,
        defensePower: 5
    },
    drone: {
        type: 'drone',
        name: { RU: 'Дроны-перехватчики', EN: 'Interceptor Drones' },
        description: { RU: 'Воздушная поддержка. Снижают риск потери караванов в регионе.', EN: 'Aerial support. Reduces caravan loss risk in the region.' },
        cost: { [ResourceType.TITANIUM]: 15, [ResourceType.ANCIENT_TECH]: 1 },
        buildTime: 30000,
        defensePower: 15
    },
    turret: {
        type: 'turret',
        name: { RU: 'Тяжелая Турель', EN: 'Heavy Turret' },
        description: { RU: 'Огромная огневая мощь для отражения осад.', EN: 'Massive firepower for repelling sieges.' },
        cost: { [ResourceType.IRON]: 50, [ResourceType.SILVER]: 10, [ResourceType.GOLD]: 5 },
        buildTime: 60000,
        defensePower: 50
    },
    shield_gen: {
        type: 'shield_gen',
        name: { RU: 'Генератор Поля', EN: 'Field Generator' },
        description: { RU: 'Добавляет энергетический щит всей базе.', EN: 'Adds an energy shield to the entire base.' },
        cost: { [ResourceType.URANIUM]: 5, [ResourceType.ANCIENT_TECH]: 2 },
        buildTime: 120000,
        defensePower: 30
    }
};

export const BASE_REPAIR_COST = {
    scrap: 20,
    iron: 10
};
