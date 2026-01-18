import { Quest } from '../types';

export const STORY_QUESTS: Quest[] = [
    // === CORPORATE FACTION ===

    {
        id: 'QUEST_LOGISTICS_TROUBLE',
        title: { RU: 'Логистические Проблемы', EN: 'Logistics Trouble' },
        description: { RU: 'Void Industries нуждается в доставке крупной партии железа на Iron Gates. Помогите нам, и мы откроем вам доступ к продвинутым караванам.', EN: 'Void Industries needs a large shipment of Iron delivered to Iron Gates. Help us, and we will grant you access to advanced caravans.' },
        status: 'available',
        type: 'DELIVERY',
        factionId: 'CORPORATE',
        objectives: [
            {
                id: 'deliver_iron',
                type: 'DELIVER',
                description: { RU: 'Доставить 500 Iron в Iron Gates', EN: 'Deliver 500 Iron to Iron Gates' },
                target: 'iron',
                required: 500,
                current: 0,
            }
        ],
        rewards: [
            { type: 'REPUTATION', target: 'CORPORATE', amount: 50 },
            { type: 'UNLOCK', target: 'caravan_2star' },  // Разблокировка 2★ Freighter
            { type: 'RESOURCE', target: 'rubies', amount: 5000 },
        ],
    },


    {
        id: 'QUEST_CORPORATE_EXPANSION',
        title: { RU: 'Корпоративная Экспансия', EN: 'Corporate Expansion' },
        description: { RU: 'Постройте Station базу в регионе Magma Core для расширения корпоративного присутствия.', EN: 'Build a Station base in the Magma Core region to expand corporate presence.' },
        status: 'available',
        type: 'EXPLORATION',
        factionId: 'CORPORATE',
        prerequisites: ['QUEST_LOGISTICS_TROUBLE'],
        objectives: [
            {
                id: 'build_station_magma',
                type: 'BUILD_BASE',
                description: { RU: 'Построить Station в Magma Core', EN: 'Build a Station in Magma Core' },
                target: 'magma_core',
                required: 1,
                current: 0,
            }
        ],
        rewards: [
            { type: 'REPUTATION', target: 'CORPORATE', amount: 100 },
            { type: 'RESOURCE', target: 'rubies', amount: 10000 },
            { type: 'BLUEPRINT', target: 'corporate_drill_mk2' },
        ],
    },


    // === SCIENCE FACTION ===

    {
        id: 'QUEST_ANCIENT_RUINS',
        title: { RU: 'Древние Руины', EN: 'Ancient Ruins' },
        description: { RU: 'Научная коллегия заинтересована в изучении артефактов древней цивилизации Aegis-7. Соберите несколько образцов для исследования.', EN: 'The Science Collegium is interested in studying artifacts of the ancient Aegis-7 civilization. Collect several samples for research.' },
        status: 'available',
        type: 'COLLECTION',
        factionId: 'SCIENCE',
        objectives: [
            {
                id: 'collect_artifacts',
                type: 'COLLECT',
                description: { RU: 'Собрать 5 артефактов', EN: 'Collect 5 artifacts' },
                target: 'artifact',
                required: 5,
                current: 0,
            }
        ],
        rewards: [
            { type: 'REPUTATION', target: 'SCIENCE', amount: 75 },
            { type: 'BLUEPRINT', target: 'anomaly_scanner' },  // Perk: видит side tunnels заранее!
            { type: 'RESOURCE', target: 'rubies', amount: 3000 },
        ],
    },


    {
        id: 'QUEST_DEEP_MYSTERIES',
        title: { RU: 'Тайны Бездны', EN: 'Deep Mysteries' },
        description: { RU: 'Достигните глубины 50000м и соберите образцы Ancient Tech для лаборатории.', EN: 'Reach a depth of 50,000m and collect samples of Ancient Tech for the laboratory.' },
        status: 'available',
        type: 'EXPLORATION',
        factionId: 'SCIENCE',
        prerequisites: ['QUEST_ANCIENT_RUINS'], // Assumption: chained
        objectives: [
            {
                id: 'reach_50km',
                type: 'REACH_DEPTH',
                description: { RU: 'Достичь глубины 50000м', EN: 'Reach a depth of 50,000m' },
                target: '50000',
                required: 1,
                current: 0,
            },
            {
                id: 'collect_ancient_tech',
                type: 'COLLECT',
                description: { RU: 'Собрать 10 Ancient Tech', EN: 'Collect 10 Ancient Tech' },
                target: 'ancientTech',
                required: 10,
                current: 0,
            }
        ],
        rewards: [
            { type: 'REPUTATION', target: 'SCIENCE', amount: 150 },
            { type: 'XP', target: 'player', amount: 5000 },
            { type: 'BLUEPRINT', target: 'void_resonator' },
        ],
    },


    // === REBELS FACTION ===

    {
        id: 'QUEST_SMUGGLER_RUN',
        title: { RU: 'Контрабандистский Рейс', EN: 'Smuggler Run' },
        description: { RU: 'Повстанцы нуждаются в тайной доставке груза газа в Void Chasm без уплаты налогов корпорациям.', EN: 'Rebels need a secret delivery of gas to Void Chasm without paying taxes to corporations.' },
        status: 'available',
        type: 'DELIVERY',
        factionId: 'REBELS',
        objectives: [
            {
                id: 'smuggle_gas',
                type: 'DELIVER',
                description: { RU: 'Контрабандой доставить 200 Gas в Void Chasm', EN: 'Smuggle 200 Gas to Void Chasm' },
                target: 'gas',
                required: 200,
                current: 0,
            }
        ],
        rewards: [
            { type: 'REPUTATION', target: 'REBELS', amount: 60 },
            { type: 'UNLOCK', target: 'smuggler_routes' },  // Perk: караваны без налогов!
            { type: 'RESOURCE', target: 'rubies', amount: 8000 },
        ],
    },


    {
        id: 'QUEST_FREEDOM_FIGHTER',
        title: { RU: 'Борьба за Свободу', EN: 'Freedom Fighter' },
        description: { RU: 'Саботируйте корпоративные операции в Crystal Wastes, уничтожив корпоративных боссов.', EN: 'Sabotage corporate operations in Crystal Wastes by destroying corporate bosses.' },
        status: 'available',
        type: 'COMBAT',
        factionId: 'REBELS',
        prerequisites: ['QUEST_SMUGGLER_RUN'],
        objectives: [
            {
                id: 'defeat_corporate_bosses',
                type: 'DEFEAT_BOSS',
                description: { RU: 'Победить 3 корпоративных боссов', EN: 'Defeat 3 corporate bosses' },
                target: 'corporate_boss',
                required: 3,
                current: 0,
            }
        ],
        rewards: [
            { type: 'REPUTATION', target: 'REBELS', amount: 120 },
            { type: 'REPUTATION', target: 'CORPORATE', amount: -50 },
            { type: 'UNLOCK', target: 'black_market' },
            { type: 'RESOURCE', target: 'rubies', amount: 15000 },
        ],
    },


    // === NEUTRAL ===

    {
        id: 'QUEST_NEUTRAL_TRADER',
        title: { RU: 'Нейтральный Торговец', EN: 'Neutral Trader' },
        description: { RU: 'Докажите свою ценность как торговца, совершив сделки во всех регионах.', EN: 'Prove your value as a trader by completing deals in all regions.' },
        status: 'available',
        type: 'EXPLORATION',
        objectives: [
            {
                id: 'visit_all_regions',
                type: 'TRAVEL_TO',
                description: { RU: 'Посетить все 5 регионов', EN: 'Visit all 5 regions' },
                target: 'all_regions',
                required: 5,
                current: 0,
            }
        ],
        rewards: [
            { type: 'REPUTATION', target: 'CORPORATE', amount: 25 },
            { type: 'REPUTATION', target: 'SCIENCE', amount: 25 },
            { type: 'REPUTATION', target: 'REBELS', amount: 25 },
            { type: 'RESOURCE', target: 'rubies', amount: 10000 },
        ],
    },


    // === COMPLEX STORY QUESTS: AEGIS-7 AWAKENING ===

    {
        id: 'SQ_VOID_SIGNAL',
        title: { RU: '📦 Сигнал из Пустоты', EN: '📦 Signal from the Void' },
        description: { RU: 'Ваши датчики поймали неестественный ритмичный сигнал с глубины. Для его анализа требуется мощная Станция и спец-оборудование.', EN: 'Your sensors have picked up an unnatural rhythmic signal from the deep. Analyzing it requires a powerful Station and specialized equipment.' },
        status: 'available',
        type: 'EXPLORATION',
        factionId: 'SCIENCE',
        objectives: [
            {
                id: 'build_station_signal',
                type: 'BUILD_BASE',
                description: { RU: 'Построить Станцию в Rust Valley', EN: 'Build a Station in Rust Valley' },
                target: 'rust_valley',
                required: 1,
                current: 0,
            },
            {
                id: 'reach_depth_signal',
                type: 'REACH_DEPTH',
                description: { RU: 'Достичь глубины 10,000м', EN: 'Reach a depth of 10,000m' },
                target: '10000',
                required: 1,
                current: 0,
            }
        ],
        rewards: [
            { type: 'XP', target: 'player', amount: 2000 },
            { type: 'BLUEPRINT', target: 'void_decoder' },
            { type: 'RESOURCE', target: 'ancientTech', amount: 5 },
        ],
    },


    {
        id: 'SQ_GHOSTS_IN_MACHINE',
        title: { RU: '🧠 Призраки в Машине', EN: '🧠 Ghosts in the Machine' },
        description: { RU: 'ИИ бура начал видеть "тени" в коде. Вам нужно стабилизировать нейросеть с помощью редких ресурсов, пока Бур не совершил критическую ошибку.', EN: 'The drill\'s AI has started seeing "shadows" in the code. You need to stabilize the neural network using rare resources before the Drill makes a critical error.' },
        status: 'available',
        type: 'COLLECTION',
        factionId: 'SCIENCE',
        prerequisites: ['SQ_VOID_SIGNAL'],
        objectives: [
            {
                id: 'collect_ancient_tech_ghost',
                type: 'COLLECT',
                description: { RU: 'Собрать 15 Ancient Tech', EN: 'Collect 15 Ancient Tech' },
                target: 'ancientTech',
                required: 15,
                current: 0,
            },
            {
                id: 'collect_rubies_ghost',
                type: 'COLLECT',
                description: { RU: 'Собрать 50 Rubies для линз', EN: 'Collect 50 Rubies for lenses' },
                target: 'rubies',
                required: 50,
                current: 0,
            },
            {
                id: 'collect_rebel_logic',
                type: 'COLLECT',
                description: { RU: 'Добыть 3 фрагмента логики (Artifacts)', EN: 'Obtain 3 logic fragments (Artifacts)' },
                target: 'artifact',
                required: 3,
                current: 0,
            }
        ],
        rewards: [
            { type: 'REPUTATION', target: 'SCIENCE', amount: 150 },
            { type: 'BLUEPRINT', target: 'neuro_stabilizer' },
            { type: 'RESOURCE', target: 'diamonds', amount: 10 },
        ],
    },


    {
        id: 'SQ_VOID_SENTINEL',
        title: { RU: '⚔️ Сердце Сингулярности', EN: '⚔️ Heart of Singularity' },
        description: { RU: 'Источник сигнала найден. Это древний Страж Бездны, охраняющий проход к Термоядру. Уничтожьте его или погибните.', EN: 'The signal source has been found. It\'s an ancient Void Sentinel guarding the passage to the Thermocore. Destroy it or perish.' },
        status: 'available',
        type: 'COMBAT',
        factionId: 'REBELS',
        prerequisites: ['SQ_GHOSTS_IN_MACHINE'],
        objectives: [
            {
                id: 'defeat_void_sentinel',
                type: 'DEFEAT_BOSS',
                description: { RU: 'Победить Void Sentinel', EN: 'Defeat Void Sentinel' },
                target: 'void_sentinel',
                required: 1,
                current: 0,
            },
            {
                id: 'reach_depth_final',
                type: 'REACH_DEPTH',
                description: { RU: 'Достичь глубины 30,000м', EN: 'Reach a depth of 30,000m' },
                target: '30000',
                required: 1,
                current: 0,
            }
        ],
        rewards: [
            { type: 'REPUTATION', target: 'REBELS', amount: 300 },
            { type: 'UNLOCK', target: 'singularity_core' },
            { type: 'RESOURCE', target: 'rubies', amount: 20000 },
            { type: 'XP', target: 'player', amount: 10000 },
        ],
    }

];
