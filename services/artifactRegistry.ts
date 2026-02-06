
import { ArtifactDefinition, ArtifactRarity } from '../types';

export const ARTIFACTS: ArtifactDefinition[] = [
  // --- COMMON (Industrial Trash & Basic Tech) ---
  {
    id: 'broken_servo',
    name: { RU: 'Сломанный Сервопривод', EN: 'Broken Servo' },
    description: { RU: 'Грязный механизм. Кажется, он еще дергается.', EN: 'Dirty mechanism. Seems to still twitch.' },
    loreDescription: { RU: 'Стандартный привод буровых установок прошлого поколения. Содержит полезные микросхемы.', EN: 'Standard drill drive of the previous generation. Contains useful chips.' },
    rarity: ArtifactRarity.COMMON,
    icon: '⚙️',
    basePrice: 50,
    scrapAmount: 5,
    effectDescription: { RU: 'Скорость бурения +2%', EN: 'Drill Speed +2%' },
    modifiers: { drillSpeedPct: 2 }
  },
  {
    id: 'fossilized_leaf',
    name: { RU: 'Каменная Флора', EN: 'Fossilized Leaf' },
    description: { RU: 'Отпечаток листа в камне.', EN: 'Print of a leaf in stone.' },
    loreDescription: { RU: 'Доказательство того, что на этой глубине когда-то была жизнь. Или симуляция жизни.', EN: 'Proof that life once existed at this depth. Or a simulation of life.' },
    rarity: ArtifactRarity.COMMON,
    icon: '🌿',
    basePrice: 80,
    scrapAmount: 8,
    allowedBiomes: ['ПОВЕРХНОСТЬ', 'ТВЕРДЫЙ КАМЕНЬ'],
    effectDescription: { RU: 'Получение XP +5%', EN: 'XP Gain +5%' },
    modifiers: {} // Special handling in logic
  },
  {
    id: 'cooling_paste',
    name: { RU: 'Тюбик Термопасты', EN: 'Tube of Thermal Paste' },
    description: { RU: 'Старая маркировка. Внутри что-то холодное.', EN: 'Old markings. Something cold inside.' },
    loreDescription: { RU: 'Военная термопаста "Айсберг-9". Срок годности истек 200 лет назад, но свойства сохранились.', EN: 'Military thermal paste "Iceberg-9". Expired 200 years ago, but properties remained.' },
    rarity: ArtifactRarity.COMMON,
    icon: '❄️',
    basePrice: 60,
    scrapAmount: 6,
    visualEffect: 'FROST_BLUE',
    allowedBiomes: ['КРИСТАЛЬНЫЕ ГРОТЫ'],
    effectDescription: { RU: 'Охлаждение +3%', EN: 'Cooling +3%' },
    modifiers: { heatGenPct: 3 }
  },
  {
    id: 'copper_wire_spool',
    name: { RU: 'Катушка Провода', EN: 'Copper Wire Spool' },
    description: { RU: 'Мотки окислившейся меди.', EN: 'Coils of oxidized copper.' },
    loreDescription: { RU: 'Проводка из древнего дата-центра. Высокая проводимость.', EN: 'Wiring from an ancient data center. High conductivity.' },
    rarity: ArtifactRarity.COMMON,
    icon: '➰',
    basePrice: 40,
    scrapAmount: 4,
    allowedBiomes: ['МЕДНЫЕ ЖИЛЫ'],
    effectDescription: { RU: 'Шанс крита +1%', EN: 'Crit Chance +1%' },
    modifiers: { clickPowerPct: 1 }
  },
  {
    id: 'obsidian_coating',
    name: { RU: 'Обсидиановая Пыль', EN: 'Obsidian Dust' },
    description: { RU: 'Мешочек с черным порошком.', EN: 'Bag of black powder.' },
    loreDescription: { RU: 'Вулканическое стекло, измельченное до наночастиц. Отлично полирует бур.', EN: 'Volcanic glass ground to nanoparticles. Polishes the drill perfectly.' },
    rarity: ArtifactRarity.COMMON,
    icon: '🌑',
    basePrice: 70,
    scrapAmount: 7,
    allowedBiomes: ['ПЛАСТЫ ПУСТОТЫ'],
    effectDescription: { RU: 'Сила клика +2%', EN: 'Click Power +2%' },
    modifiers: { clickPowerPct: 2 }
  },
  {
    id: 'faraday_insulator',
    name: { RU: 'Изолятор Фарадея', EN: 'Faraday Insulator' },
    description: { RU: 'Старый медный кожух с гравировкой.', EN: 'Old copper casing with engraving.' },
    loreDescription: { RU: 'Простейшее устройство для блокировки внешних помех. Немного стабилизирует щит.', EN: 'A simple device to block external interference. Slightly stabilizes the shield.' },
    rarity: ArtifactRarity.COMMON,
    icon: '罩',
    basePrice: 90,
    scrapAmount: 10,
    effectDescription: { RU: 'Задержка щита +1%', EN: 'Shield Delay +1%' },
    modifiers: { shieldEfficiencyPct: 1 }
  },

  // --- RARE (Useful Modules) ---
  {
    id: 'lens_optics',
    name: { RU: 'Линза Сканера', EN: 'Scanner Lens' },
    description: { RU: 'Идеально гладкое стекло. Не царапается.', EN: 'Perfectly smooth glass. Doesn\'t scratch.' },
    loreDescription: { RU: 'Часть гео-сканера. Позволяет лучше видеть структуру породы.', EN: 'Part of a geo-scanner. Allows better viewing of rock structure.' },
    rarity: ArtifactRarity.RARE,
    icon: '🔍',
    basePrice: 200,
    scrapAmount: 25,
    allowedBiomes: ['КРИСТАЛЬНЫЕ ГРОТЫ'],
    effectDescription: { RU: 'Добыча ресурсов +10%', EN: 'Resource Mining +10%' },
    modifiers: { resourceMultPct: 10 }
  },
  {
    id: 'magnetic_coil',
    name: { RU: 'Магнитная Катушка', EN: 'Magnetic Coil' },
    description: { RU: 'Притягивает мелкую металлическую пыль.', EN: 'Attracts fine metal dust.' },
    loreDescription: { RU: 'Стабилизатор магнитного поля. Уменьшает вибрацию бура.', EN: 'Magnetic field stabilizer. Reduces drill vibration.' },
    rarity: ArtifactRarity.RARE,
    icon: '🧲',
    basePrice: 250,
    scrapAmount: 30,
    allowedBiomes: ['МЕДНЫЕ ЖИЛЫ', 'ЗОЛОТАЯ ЗЕМЛЯ'],
    effectDescription: { RU: 'Сила клика +15%', EN: 'Click Power +15%' },
    modifiers: { clickPowerPct: 15 }
  },
  {
    id: 'trade_chip',
    name: { RU: 'Чип Торговца', EN: 'Trader Chip' },
    description: { RU: 'Зашифрованный кредитный ключ.', EN: 'Encrypted credit key.' },
    loreDescription: { RU: 'Лицензия гильдии торговцев. Дает привилегии в автоматических киосках.', EN: 'Merchant guild license. Gives privileges in automatic kiosks.' },
    rarity: ArtifactRarity.RARE,
    icon: '💳',
    basePrice: 300,
    scrapAmount: 35,
    effectDescription: { RU: 'Скидки в городе -10%', EN: 'Shop Discounts -10%' },
    modifiers: { shopDiscountPct: 10 }
  },
  {
    id: 'isotope_cell',
    name: { RU: 'Изотопная Ячейка', EN: 'Isotope Cell' },
    description: { RU: 'Слабое зеленое свечение.', EN: 'Weak green glow.' },
    loreDescription: { RU: 'Батарея аварийного питания. Все еще активна.', EN: 'Emergency power battery. Still active.' },
    rarity: ArtifactRarity.RARE,
    icon: '🔋',
    basePrice: 350,
    scrapAmount: 40,
    visualEffect: 'MATRIX_GREEN',
    allowedBiomes: ['РАДИОАКТИВНОЕ ЯДРО'],
    effectDescription: { RU: 'Авто-бурение +15%', EN: 'Auto-drilling +15%' },
    modifiers: { drillSpeedPct: 15 }
  },
  {
    id: 'thermal_converter',
    name: { RU: 'Термо-конвертер', EN: 'Thermal Converter' },
    description: { RU: 'Преобразует тепло в кинетическую энергию.', EN: 'Converts heat into kinetic energy.' },
    loreDescription: { RU: 'Экспериментальный модуль. Чем горячее бур, тем быстрее он вращается.', EN: 'Experimental module. The hotter the drill, the faster it rotates.' },
    rarity: ArtifactRarity.RARE,
    icon: '♨️',
    basePrice: 400,
    scrapAmount: 45,
    visualEffect: 'GLOW_GOLD',
    effectDescription: { RU: 'Авто-бурение +10%, Нагрев -5%', EN: 'Auto-drilling +10%, Heat -5%' },
    modifiers: { drillSpeedPct: 10, heatGenPct: 5 }
  },
  {
    id: 'void_compass',
    name: { RU: 'Компас Пустоты', EN: 'Void Compass' },
    description: { RU: 'Стрелка всегда указывает вниз.', EN: 'The needle always points down.' },
    loreDescription: { RU: 'Помогает находить аномалии в пространстве-времени.', EN: 'Helps find anomalies in space-time.' },
    rarity: ArtifactRarity.RARE,
    icon: '🧭',
    basePrice: 450,
    scrapAmount: 50,
    allowedBiomes: ['ПЛАСТЫ ПУСТОТЫ'],
    effectDescription: { RU: 'Удача (События) +20%', EN: 'Luck (Events) +20%' },
    modifiers: { luckPct: 20 }
  },
  {
    id: 'field_capacitor',
    name: { RU: 'Полевой Конденсатор', EN: 'Field Capacitor' },
    description: { RU: 'Массивный блок с гудящими катушками.', EN: 'Massive unit with humming coils.' },
    loreDescription: { RU: 'Накапливает избыточный заряд и медленно отдает его в систему защиты.', EN: 'Accumulates excess charge and slowly releases it into the defense system.' },
    rarity: ArtifactRarity.RARE,
    icon: '🔋',
    basePrice: 350,
    scrapAmount: 40,
    effectDescription: { RU: 'Задержка щита +3%', EN: 'Shield Delay +3%' },
    modifiers: { shieldEfficiencyPct: 3 }
  },

  // --- EPIC (Precursor Tech) ---
  {
    id: 'void_battery',
    name: { RU: 'Батарея Пустоты', EN: 'Void Battery' },
    description: { RU: 'Черный куб. Тяжелее, чем выглядит.', EN: 'Black cube. Heavier than it looks.' },
    loreDescription: { RU: 'Источник энергии, работающий на распаде вакуума. Никогда не разряжается.', EN: 'Energy source powered by vacuum decay. Never discharges.' },
    rarity: ArtifactRarity.EPIC,
    icon: '⬛',
    basePrice: 1000,
    scrapAmount: 150,
    visualEffect: 'GLOW_PURPLE',
    allowedBiomes: ['ПЛАСТЫ ПУСТОТЫ'],
    effectDescription: { RU: 'Скорость бурения +25%, Нагрев -10%', EN: 'Drill Speed +25%, Heat -10%' },
    modifiers: { drillSpeedPct: 25, heatGenPct: 10 }
  },
  {
    id: 'chronos_gear',
    name: { RU: 'Шестерня Времени', EN: 'Chronos Gear' },
    description: { RU: 'Она вращается, но зубцы не двигаются.', EN: 'It rotates, but the teeth don\'t move.' },
    loreDescription: { RU: 'Механизм, игнорирующий энтропию. Позволяет предсказывать будущее.', EN: 'Mechanism ignoring entropy. Allows predicting the future.' },
    rarity: ArtifactRarity.EPIC,
    icon: '⏳',
    basePrice: 1200,
    scrapAmount: 180,
    effectDescription: { RU: 'Шанс удачи (событий) +50%', EN: 'Luck chance (events) +50%' },
    modifiers: { luckPct: 50 }
  },
  {
    id: 'nano_queen',
    name: { RU: 'Матка Нанитов', EN: 'Nano Queen' },
    description: { RU: 'Колба с серебристой жидкостью.', EN: 'Flask with silvery liquid.' },
    loreDescription: { RU: 'Координационный центр роя. Заставляет нанитов чинить бур, а не есть его.', EN: 'Swarm coordination center. Forces nanites to fix the drill instead of eating it.' },
    rarity: ArtifactRarity.EPIC,
    icon: '🦠',
    basePrice: 1500,
    scrapAmount: 200,
    visualEffect: 'MATRIX_GREEN',
    allowedBiomes: ['ЗАЛЕЖИ ЖЕЛЕЗА', 'ЗОЛОТАЯ ЗЕМЛЯ'],
    effectDescription: { RU: 'Авто-бурение +40%', EN: 'Auto-drilling +40%' },
    modifiers: { drillSpeedPct: 40 }
  },
  {
    id: 'graviton_anchor',
    name: { RU: 'Гравитонный Якорь', EN: 'Graviton Anchor' },
    description: { RU: 'Невозможно сдвинуть с места, если активирован.', EN: 'Cannot be moved from its spot when activated.' },
    loreDescription: { RU: 'Устройство для фиксации реальности. Предотвращает квантовые сбои.', EN: 'Device for fixing reality. Prevents quantum glitches.' },
    rarity: ArtifactRarity.EPIC,
    icon: '⚓',
    basePrice: 1400,
    scrapAmount: 170,
    effectDescription: { RU: 'Стабильность нагрева (снижение)', EN: 'Heat stability (reduction)' },
    modifiers: { heatGenPct: 10 }
  },
  {
    id: 'gravity_damper',
    name: { RU: 'Грави-демпфер', EN: 'Gravity Damper' },
    description: { RU: 'Вокруг него искажается свет.', EN: 'Light distorts around it.' },
    loreDescription: { RU: 'Поглощает инерцию ударов. Позволяет бить со страшной силой без отдачи.', EN: 'Absorbs hit inertia. Allows hitting with terrible force without recoil.' },
    rarity: ArtifactRarity.EPIC,
    icon: '🌌',
    basePrice: 1600,
    scrapAmount: 190,
    effectDescription: { RU: 'Сила клика +75%', EN: 'Click Power +75%' },
    modifiers: { clickPowerPct: 75 }
  },
  {
    id: 'retention_prism',
    name: { RU: 'Призма Удержания', EN: 'Retention Prism' },
    description: { RU: 'Геометрически совершенный кристалл.', EN: 'Geometrically perfect crystal.' },
    loreDescription: { RU: 'Преломляет энергию щита таким образом, что она почти не рассеивается в пространстве.', EN: 'Refracts shield energy so that it hardly dissipates in space.' },
    rarity: ArtifactRarity.EPIC,
    icon: '💎',
    basePrice: 800,
    scrapAmount: 100,
    effectDescription: { RU: 'Задержка щита +6%', EN: 'Shield Delay +6%' },
    modifiers: { shieldEfficiencyPct: 6 }
  },

  // --- LEGENDARY (Unique Anomalies) ---
  {
    id: 'heart_of_star',
    name: { RU: 'Сердце Звезды', EN: 'Heart of a Star' },
    description: { RU: 'Слепит глаза, даже если закрыть их.', EN: 'Blinds eyes even if they are closed.' },
    loreDescription: { RU: 'Фрагмент нейтронной звезды, удерживаемый в стазис-поле. Бесконечная мощь.', EN: 'Fragment of a neutron star held in a stasis field. Infinite power.' },
    rarity: ArtifactRarity.LEGENDARY,
    icon: '🌟',
    basePrice: 5000,
    scrapAmount: 1000,
    visualEffect: 'GLOW_GOLD',
    allowedBiomes: ['РАДИОАКТИВНОЕ ЯДРО'],
    effectDescription: { RU: 'ВСЕ ХАРАКТЕРИСТИКИ +50%', EN: 'ALL STATS +50%' },
    modifiers: { drillSpeedPct: 50, resourceMultPct: 50, clickPowerPct: 50 }
  },
  {
    id: 'singularity_shard',
    name: { RU: 'Осколок Сингулярности', EN: 'Singularity Shard' },
    description: { RU: 'В нем отражается то, чего нет позади вас.', EN: 'Reflection of what is NOT behind you.' },
    loreDescription: { RU: 'Кусок горизонта событий. Ломает законы физики ради вашей выгоды.', EN: 'Piece of the event horizon. Breaks laws of physics for your benefit.' },
    rarity: ArtifactRarity.LEGENDARY,
    icon: '🌀',
    basePrice: 6666,
    scrapAmount: 1200,
    visualEffect: 'GLOW_PURPLE',
    allowedBiomes: ['ПЛАСТЫ ПУСТОТЫ'],
    effectDescription: { RU: 'Крит. удары бура x5 урона', EN: 'Crit hits x5 damage' },
    modifiers: { clickPowerPct: 100 }
  },
  {
    id: 'chrono_stabilizer',
    name: { RU: 'Хроно-стабилизатор', EN: 'Chrono Stabilizer' },
    description: { RU: 'Устройство, зацикливающее время в малом объеме.', EN: 'Device looping time in a small volume.' },
    loreDescription: { RU: 'Легендарная технология. Удерживает состояние щита в прошлом, предотвращая его падение.', EN: 'Legendary technology. Holds shield state in the past, preventing its decay.' },
    rarity: ArtifactRarity.LEGENDARY,
    icon: '⏳',
    basePrice: 2000,
    scrapAmount: 250,
    visualEffect: 'GLOW_GOLD',
    effectDescription: { RU: 'Задержка щита +10%', EN: 'Shield Delay +10%' },
    modifiers: { shieldEfficiencyPct: 10 }
  },

  // --- ANOMALOUS (Dangerous / Glitch) ---
  {
    id: 'glitch_cube',
    name: { RU: '0xDEADBEEF', EN: '0xDEADBEEF' },
    description: { RU: 'Ошибка рендеринга реальности.', EN: 'Reality rendering error.' },
    loreDescription: { RU: 'ОБЪЕКТ НАРУШАЕТ 4-Ю СТЕНУ. НЕ СМОТРИТЕ НА НЕГО ДОЛГО.', EN: 'OBJECT BREAKS 4TH WALL. DO NOT LOOK AT IT LONG.' },
    rarity: ArtifactRarity.ANOMALOUS,
    icon: '👾',
    basePrice: 9999,
    scrapAmount: 666,
    visualEffect: 'GLITCH_RED',
    effectDescription: { RU: 'Добыча x10, но нагрев x5', EN: 'Mining x10, but Heat x5' },
    modifiers: { resourceMultPct: 1000, heatGenPct: -300 }
  },
  {
    id: 'void_eye',
    name: { RU: 'Глаз Бездны', EN: 'Void Eye' },
    description: { RU: 'Окуляр, видящий сквозь саму материю.', EN: 'Ocular seeing through matter itself.' },
    loreDescription: { RU: 'Древний артефакт, извлеченный из глубочайших слоев. Манит зовом пустоты.', EN: 'Ancient artifact extracted from deep layers. Lures with the call of the void.' },
    rarity: ArtifactRarity.ANOMALOUS,
    icon: '👁️',
    basePrice: 15000,
    scrapAmount: 1000,
    visualEffect: 'GLOW_PURPLE',
    effectDescription: { RU: 'Добыча ресурсов +200%, но корпус крайне уязвим (-50% защиты)', EN: 'Resources +200%, but hull is extremely vulnerable (-50% protection)' },
    modifiers: { resourceMultPct: 200, hazardResist: -50 }
  },
  {
    id: 'chrono_ring',
    name: { RU: 'Временное Кольцо', EN: 'Chrono Ring' },
    description: { RU: 'Кольцо, ускоряющее локальное время.', EN: 'Ring accelerating local time.' },
    loreDescription: { RU: 'Технология высшего порядка. Позволяет дронам работать в разы быстрее, но замедляет бур.', EN: 'High order technology. Allows drones to work multiple times faster, but slows the drill.' },
    rarity: ArtifactRarity.ANOMALOUS,
    icon: '💍',
    basePrice: 18000,
    scrapAmount: 1200,
    visualEffect: 'GLOW_GOLD',
    effectDescription: { RU: 'Скорость дронов +100%, но скорость бурения -50%', EN: 'Drone Speed +100%, but drill speed -50%' },
    modifiers: { droneSpeedPct: 100, drillSpeedPct: -50 }
  },
  {
    id: 'void_essence',
    name: { RU: 'Эссенция Пустоты', EN: 'Void Essence' },
    description: { RU: 'Концентрированная материя небытия.', EN: 'Concentrated matter of non-existence.' },
    loreDescription: { RU: 'Сгусток "Void Matter" настолько плотный, что он искажает гравитацию вокруг себя. Кажется, он шепчет о тайнах ядра.', EN: 'A clump of "Void Matter" so dense it distorts gravity around it. It seems to whisper secrets of the Core.' },
    rarity: ArtifactRarity.LEGENDARY,
    icon: '🌑',
    basePrice: 25000,
    scrapAmount: 2000,
    visualEffect: 'GLOW_PURPLE',
    allowedBiomes: ['ПЛАСТЫ ПУСТОТЫ'],
    effectDescription: { RU: 'Урон бура +150%, но Нагрев +50%', EN: 'Drill Damage +150%, but Heat +50%' },
    modifiers: { clickPowerPct: 150, heatGenPct: -50 }
  },
  {
    id: 'chrono_singularity',
    name: { RU: 'Хроно-сингулярность', EN: 'Chrono-Singularity' },
    description: { RU: 'Стеклянная сфера, внутри которой время застыло.', EN: 'A glass sphere within which time has frozen.' },
    loreDescription: { RU: 'Артефакт, созданный из чистых "Chrono-Shards". Позволяет заглянуть в будущее и предотвратить поломки.', EN: 'An artifact created from pure "Chrono-Shards". Allows looking into the future to prevent failures.' },
    rarity: ArtifactRarity.ANOMALOUS,
    icon: '⏳',
    basePrice: 50000,
    scrapAmount: 5000,
    visualEffect: 'GLOW_GOLD',
    allowedBiomes: ['ПЛАСТЫ ПУСТОТЫ'],
    effectDescription: { RU: 'Защита +50%, Ремонт +100%, Удача +100%', EN: 'Defense +50%, Repair +100%, Luck +100%' },
    modifiers: { hazardResist: 50, luckPct: 100 }
  }
];

export const getArtifactColor = (rarity: ArtifactRarity): string => {
  switch (rarity) {
    case ArtifactRarity.COMMON: return 'border-zinc-500 text-zinc-400 shadow-zinc-900';
    case ArtifactRarity.RARE: return 'border-cyan-500 text-cyan-400 shadow-cyan-900/50';
    case ArtifactRarity.EPIC: return 'border-purple-500 text-purple-400 shadow-purple-900/50';
    case ArtifactRarity.LEGENDARY: return 'border-amber-400 text-amber-300 shadow-amber-500/50';
    case ArtifactRarity.ANOMALOUS: return 'border-red-500 text-red-500 shadow-red-900 animate-pulse';
    default: return 'border-zinc-500';
  }
};

export const rollArtifact = (depth: number, luck: number = 0, currentBiomeName?: string): ArtifactDefinition => {
  const rand = Math.random();
  const luckFactor = luck / 1000;

  let eligibleArtifacts = ARTIFACTS.filter(a => {
    if (a.allowedBiomes && a.allowedBiomes.length > 0) {
      if (!currentBiomeName) return false;
      return a.allowedBiomes.includes(currentBiomeName);
    }
    return true;
  });

  if (eligibleArtifacts.length === 0) {
    eligibleArtifacts = ARTIFACTS.filter(a => !a.allowedBiomes);
  }

  let pool: ArtifactDefinition[] = [];

  if ((rand < 0.01 + luckFactor) && depth > 20000) {
    pool = eligibleArtifacts.filter(a => a.rarity === ArtifactRarity.LEGENDARY || a.rarity === ArtifactRarity.ANOMALOUS);
  } else if ((rand < 0.06 + luckFactor) && depth > 5000) {
    pool = eligibleArtifacts.filter(a => a.rarity === ArtifactRarity.EPIC);
  } else if ((rand < 0.26 + luckFactor)) {
    pool = eligibleArtifacts.filter(a => a.rarity === ArtifactRarity.RARE);
  } else {
    pool = eligibleArtifacts.filter(a => a.rarity === ArtifactRarity.COMMON);
  }

  if (pool.length === 0) pool = eligibleArtifacts.filter(a => a.rarity === ArtifactRarity.COMMON);
  if (pool.length === 0) pool = ARTIFACTS.filter(a => a.rarity === ArtifactRarity.COMMON);

  return pool[Math.floor(Math.random() * pool.length)];
};
