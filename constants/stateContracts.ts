import { StateContract, FactionId, ResourceType } from '../types';

/**
 * ШАБЛОНЫ ГОСЗАКАЗОВ (State Contracts)
 * 
 * Генерируются динамически раз в игровые сутки (24 минуты)
 * Награды: STANDARD = 1.2x, PRIORITY = 1.5x, CRITICAL = 2x от базовой цены
 */

// === БАЗОВЫЕ ЦЕНЫ РЕСУРСОВ (для расчёта наград) ===
const BASE_PRICES: Partial<Record<ResourceType, number>> = {
    clay: 1,
    stone: 2,
    copper: 5,
    iron: 10,
    silver: 25,
    gold: 50,
    titanium: 100,
    uranium: 200,
    coal: 8,
    oil: 15,
    gas: 20,
    ice: 5,
    rubies: 100,
    emeralds: 150,
    diamonds: 300,
    ancientTech: 500,
    nanoSwarm: 400,
};

// === ШАБЛОНЫ КОНТРАКТОВ ПО ФРАКЦИЯМ ===

export const CONTRACT_TEMPLATES = {
    // === CORPORATE (Void Industries) ===
    CORPORATE: [
        {
            tier: 'STANDARD' as const,
            title: { RU: 'Поставка Строительных Материалов', EN: 'Construction Materials Delivery' },
            description: { RU: 'Корпорация расширяет инфраструктуру. Требуется крупная партия камня для строительства новых объектов.', EN: 'The Corporation is expanding infrastructure. A large batch of stone is required for new construction.' },
            requirements: [{ resource: 'stone' as ResourceType, amount: 5000 }],
            minReputationLevel: 3,
            blueprint: 'corporate_drill_mk2',
        },
        {
            tier: 'STANDARD' as const,
            title: { RU: 'Промышленный Металл', EN: 'Industrial Metal' },
            description: { RU: 'Заводы нуждаются в железе для производства. Обеспечьте поставку.', EN: 'Factories need iron for production. Ensure delivery.' },
            requirements: [{ resource: 'iron' as ResourceType, amount: 3000 }],
            minReputationLevel: 3,
        },
        {
            tier: 'PRIORITY' as const,
            title: { RU: 'Критическая Поставка Титана', EN: 'Critical Titanium Delivery' },
            description: { RU: 'Флагманский проект требует титан. Время ограничено, награда увеличена.', EN: 'Flagship project requires titanium. Time is limited, reward increased.' },
            requirements: [{ resource: 'titanium' as ResourceType, amount: 500 }],
            minReputationLevel: 5,
            timeLimit: 48, // 48 игровых часов
        },
        {
            tier: 'CRITICAL' as const,
            title: { RU: 'ПРОЕКТ ОМЕГА: Уран', EN: 'PROJECT OMEGA: Uranium' },
            description: { RU: 'Секретный проект высшего приоритета. Требуется уран. Максимальная награда, абсолютная секретность.', EN: 'Top-secret high-priority project. Uranium required. Maximum reward, absolute secrecy.' },
            requirements: [{ resource: 'uranium' as ResourceType, amount: 200 }],
            minReputationLevel: 7,
            timeLimit: 72,
            exclusive: true,
            blueprint: 'omega_core_component',
        },
    ],

    // === SCIENCE (Aegis Collegium) ===
    SCIENCE: [
        {
            tier: 'STANDARD' as const,
            title: { RU: 'Образцы для Исследований', EN: 'Research Samples' },
            description: { RU: 'Лаборатория нуждается в самоцветах для экспериментов с кристаллическими структурами.', EN: 'Laboratory needs gems for crystalline structure experiments.' },
            requirements: [
                { resource: 'rubies' as ResourceType, amount: 50 },
                { resource: 'emeralds' as ResourceType, amount: 30 },
            ],
            minReputationLevel: 3,
        },
        {
            tier: 'PRIORITY' as const,
            title: { RU: 'Древние Артефакты', EN: 'Ancient Artifacts' },
            description: { RU: 'Коллегия изучает технологии древней цивилизации. Доставьте Ancient Tech для анализа.', EN: 'Collegium studies ancient civilization technologies. Deliver Ancient Tech for analysis.' },
            requirements: [{ resource: 'ancientTech' as ResourceType, amount: 50 }],
            minReputationLevel: 5,
            timeLimit: 96,
            blueprint: 'void_resonator',
        },
        {
            tier: 'CRITICAL' as const,
            title: { RU: 'АНОМАЛИЯ КЛАССА-S', EN: 'CLASS-S ANOMALY' },
            description: { RU: 'Обнаружена критическая аномалия. Требуется Nano Swarm для стабилизации. Немедленно!', EN: 'Critical anomaly detected. Nano Swarm required for stabilization. Immediately!' },
            requirements: [{ resource: 'nanoSwarm' as ResourceType, amount: 100 }],
            minReputationLevel: 7,
            timeLimit: 24,
            exclusive: true,
            blueprint: 'quantum_stabilizer',
        },
    ],

    // === REBELS (Free Miners) ===
    REBELS: [
        {
            tier: 'STANDARD' as const,
            title: { RU: 'Топливо для Повстанцев', EN: 'Fuel for Rebels' },
            description: { RU: 'Подпольные базы нуждаются в топливе. Доставьте газ без привлечения внимания корпорации.', EN: 'Underground bases need fuel. Deliver gas without attracting corporate attention.' },
            requirements: [{ resource: 'gas' as ResourceType, amount: 1000 }],
            minReputationLevel: 3,
        },
        {
            tier: 'PRIORITY' as const,
            title: { RU: 'Контрабанда Драгоценностей', EN: 'Gem Smuggling' },
            description: { RU: 'Чёрный рынок платит за алмазы. Высокий риск, высокая награда.', EN: 'Black market pays for diamonds. High risk, high reward.' },
            requirements: [{ resource: 'diamonds' as ResourceType, amount: 100 }],
            minReputationLevel: 5,
            timeLimit: 48,
        },
        {
            tier: 'CRITICAL' as const,
            title: { RU: 'ОПЕРАЦИЯ "СВОБОДА"', EN: 'OPERATION "FREEDOM"' },
            description: { RU: 'Финальный удар по корпорации. Нужны ресурсы для оружия. За свободу!', EN: 'Final strike against the corporation. Resources needed for weapons. For freedom!' },
            requirements: [
                { resource: 'titanium' as ResourceType, amount: 300 },
                { resource: 'uranium' as ResourceType, amount: 50 },
            ],
            minReputationLevel: 7,
            timeLimit: 96,
            exclusive: true,
            blueprint: 'liberation_cannon',
        },
    ],
};

/**
 * Генерация госзаказа из шаблона
 */
export function generateContractFromTemplate(
    factionId: FactionId,
    templateIndex: number,
    gameTime: number
): StateContract {
    const templates = CONTRACT_TEMPLATES[factionId];
    const template = templates[templateIndex % templates.length];

    // Расчёт награды на основе требований
    let baseValue = 0;
    template.requirements.forEach(req => {
        const price = BASE_PRICES[req.resource] || 10;
        baseValue += price * req.amount;
    });

    // Множитель в зависимости от тира
    const tierMultipliers = {
        STANDARD: 1.2,
        PRIORITY: 1.5,
        CRITICAL: 2.0,
    };

    const multiplier = tierMultipliers[template.tier];
    const credits = Math.floor(baseValue * multiplier);

    // Репутация в зависимости от тира
    const reputationRewards = {
        STANDARD: 100,
        PRIORITY: 200,
        CRITICAL: 500,
    };

    const id = `contract_${factionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Срок действия: 7 игровых дней (7 * 24 * 60 сек = 10080 сек = 168 минут реального времени)
    const expirationTime = template.timeLimit
        ? gameTime + (template.timeLimit * 60) // timeLimit в игровых часах -> секунды
        : gameTime + (7 * 24 * 60); // 7 дней по умолчанию

    return {
        id,
        factionId,
        tier: template.tier,
        title: template.title,
        description: template.description,
        requirements: template.requirements.map(req => ({
            ...req,
            delivered: 0,
        })),
        rewards: {
            credits,
            reputation: reputationRewards[template.tier],
            blueprint: template.blueprint,
        },
        minReputationLevel: template.minReputationLevel,
        timeLimit: template.timeLimit,
        exclusive: template.exclusive,
        status: 'available',
        expiresAt: expirationTime,
        generatedAt: gameTime,
        failurePenalty: {
            reputation: template.tier === 'CRITICAL' ? -100 : template.tier === 'PRIORITY' ? -50 : -25,
        },
    };
}

/**
 * Получить случайный шаблон для фракции
 */
export function getRandomContractTemplate(factionId: FactionId): number {
    const templates = CONTRACT_TEMPLATES[factionId];
    return Math.floor(Math.random() * templates.length);
}
