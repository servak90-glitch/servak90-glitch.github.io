
import { BaseModuleType, Resources } from '../types';

export interface BaseModuleDefinition {
    type: BaseModuleType;
    name: { RU: string; EN: string };
    description: { RU: string; EN: string };
    icon: string;
    baseCost: Partial<Resources>;
    costMultiplier: number;
    maxLevel: number;
}

export const BASE_MODULES: Record<BaseModuleType, BaseModuleDefinition> = {
    [BaseModuleType.SCIENCE]: {
        type: BaseModuleType.SCIENCE,
        name: { RU: 'Научный Центр', EN: 'Science Center' },
        description: { RU: 'Генерация исследовательских данных и баффы региона.', EN: 'Data generation and regional buffs.' },
        icon: '🔬',
        baseCost: { credits: 500, titanium: 50, ancientTech: 2 },
        costMultiplier: 2.0,
        maxLevel: 5
    },
    [BaseModuleType.LOGISTICS]: {
        type: BaseModuleType.LOGISTICS,
        name: { RU: 'Логистический Терминал', EN: 'Logistics Terminal' },
        description: { RU: 'Увеличение лимита караванов и скорости доставки.', EN: 'Increased caravan limit and delivery speed.' },
        icon: '🚛',
        baseCost: { credits: 300, iron: 100, copper: 100 },
        costMultiplier: 1.8,
        maxLevel: 5
    },
    [BaseModuleType.INDUSTRIAL]: {
        type: BaseModuleType.INDUSTRIAL,
        name: { RU: 'Индустриальный Хаб', EN: 'Industrial Hub' },
        description: { RU: 'Ускорение постройки и крафта, открытие новых тиров.', EN: 'Faster construction and crafting, unlocks higher tiers.' },
        icon: '🏭',
        baseCost: { credits: 400, iron: 200, silver: 50 },
        costMultiplier: 2.2,
        maxLevel: 5
    },
    [BaseModuleType.DRONE_COMMAND]: {
        type: BaseModuleType.DRONE_COMMAND,
        name: { RU: 'Командный Центр Дронов', EN: 'Drone Command' },
        description: { RU: 'Улучшение характеристик дронов базы и их лимита.', EN: 'Improved base drone stats and limit.' },
        icon: '📡',
        baseCost: { credits: 350, gold: 30, copper: 150 },
        costMultiplier: 2.0,
        maxLevel: 5
    },
    [BaseModuleType.COMMS]: {
        type: BaseModuleType.COMMS,
        name: { RU: 'Узел Связи', EN: 'Comms Hub' },
        description: { RU: 'Увеличивает шанс получения выгодных контрактов.', EN: 'Increases chance of getting profitable contracts.' },
        icon: '📶',
        baseCost: { credits: 200, copper: 100, silver: 20 },
        costMultiplier: 1.5,
        maxLevel: 3
    }
};
