import { OperatorDefinition, CrewDefinition, OperatorId, CrewId } from '../types';

export const OPERATORS: OperatorDefinition[] = [
    {
        id: OperatorId.GEOLOGIST,
        name: { RU: 'Геолог', EN: 'Geologist' },
        lore: {
            RU: 'Бывший главный минералог Корпорации. Знает всё о породах Aegis-7.',
            EN: 'Former lead mineralogist for the Corporation. Knows everything about Aegis-7 strata.'
        },
        visuals: { RU: '48 лет, очки-сканеры, изношенный комбинезон.', EN: '48 years old, scanning goggles, worn jumpsuit.' },
        passiveBonus: { RU: '+15% шанс дропа самоцветов, +5 бонус Удачи.', EN: '+15% gem drop chance, +5 Luck bonus.' },
        uniqueTrait: { RU: 'Сейсмический резонанс: +5 сек времени предсказания событий.', EN: 'Seismic Resonance: +5s event prediction time.' },
        portraitPath: '/assets/portraits/op_geologist.webp',
        stats: {
            gemDropChancePct: 15,
            luckPct: 5,
            predictionTime: 5,
            rareResourceChancePct: 15,
            hazardRiskReductionPct: 20
        }
    },
    {
        id: OperatorId.SOLDIER,
        name: { RU: 'Солдат', EN: 'Soldier' },
        lore: {
            RU: 'Дезертир из элитного подразделения "Авангард". Выживание — его религия.',
            EN: 'Deserter from the elite "Vanguard" unit. Survival is his religion.'
        },
        visuals: { RU: '35 лет, шрамы, холодный взгляд, тактический экзоскелет.', EN: '35 years old, scars, cold gaze, tactical exoskeleton.' },
        passiveBonus: { RU: '+20% прочность корпуса, -10% получаемого урона.', EN: '+20% hull durability, -10% damage taken.' },
        uniqueTrait: { RU: 'Термальный предел: +15 ед. к максимальному нагреву.', EN: 'Thermal Limit: +15 units to max heat.' },
        portraitPath: '/assets/portraits/op_soldier.webp',
        stats: {
            maxHullPct: 20,
            damageReductionPct: 10,
            heatCapAdd: 15
        }
    },
    {
        id: OperatorId.MECHANIC,
        name: { RU: 'Механик', EN: 'Mechanic' },
        lore: {
            RU: 'Гениальный инженер с темным прошлым. Считает бур своим ребенком.',
            EN: 'Genius engineer with a dark past. Considers the drill her child.'
        },
        visuals: { RU: '32 года, кибер-глаз, пояс с инструментами.', EN: '32 years old, cyber-eye, tool belt.' },
        passiveBonus: { RU: '+15% эффективность охлаждения, -15% стоимость крафта.', EN: '+15% cooling efficiency, -15% crafting cost.' },
        uniqueTrait: { RU: 'Техническая смекалка: 10% шанс не потратить расходник.', EN: 'Engineering Acumen: 10% chance to not consume a consumable.' },
        portraitPath: '/assets/portraits/op_mechanic.webp',
        stats: {
            coolingEfficiencyPct: 15,
            craftingCostReductionPct: 15,
            consumableSaveChancePct: 10
        }
    }
];

export const CREW_MEMBERS: CrewDefinition[] = [
    {
        id: CrewId.ZIB,
        name: { RU: 'Зиб', EN: 'Zib' },
        lore: { RU: 'Одинокий ИИ, выживший на заброшенной станции.', EN: 'Lone AI survivor from a derelict station.' },
        visuals: { RU: 'Дробо-сфера с голограммой юноши.', EN: 'Drone-sphere with a hologram of a young man.' },
        effectDesc: { RU: '+20% скорость дронов, +15% заряд щитов.', EN: '+20% drone speed, +15% shield charge speed.' },
        portraitPath: '/assets/portraits/crew_zib.webp',
        cost: {
            credits: 2500,
            upkeepPercent: 5
        },
        stats: {
            droneSpeedPct: 20,
            shieldChargeSpeedPct: 15
        }
    },
    {
        id: CrewId.GROG,
        name: { RU: 'Грог', EN: 'Grog' },
        lore: { RU: 'Генетически модифицированный грузчик-беглец.', EN: 'Genetically modified escaped loader.' },
        visuals: { RU: 'Гигант 2.5 метра, серая кожа, татуировки-схемы.', EN: '2.5m giant, grey skin, schematic tattoos.' },
        effectDesc: { RU: '+10% вместимость груза, +10% крутящий момент.', EN: '+10% cargo capacity, +10% drill torque.' },
        portraitPath: '/assets/portraits/crew_grog.webp',
        cost: {
            credits: 1800,
            upkeepResources: { repairKit: 1 } // Simplified upkeep
        },
        stats: {
            cargoCapacityPct: 10,
            drillTorquePct: 10
        }
    },
    {
        id: CrewId.REX,
        name: { RU: 'Рекс', EN: 'Rex' },
        lore: { RU: 'Бывший силовик Синдиката. Мастер охоты.', EN: 'Former Syndicate enforcer. Master of the hunt.' },
        visuals: { RU: '42 года, черные волосы, кибер-рука, зубочистка.', EN: '42 years old, black hair, cyber-arm, toothpick.' },
        effectDesc: { RU: '+5% крит, +5% уворота, +10% урон по боссам.', EN: '+5% crit, +5% evasion, +10% boss damage.' },
        portraitPath: '/assets/portraits/crew_rex.webp',
        cost: {
            credits: 3000,
            periodicCredits: 100 // Weekly upkeep
        },
        stats: {
            critChancePct: 5,
            evasionPct: 5,
            bossDamagePct: 10
        }
    }
];
