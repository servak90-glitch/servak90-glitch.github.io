
import { Biome, DrillPart, EnginePart, CoolerPart, HullPart, LogicPart, ControlPart, GearboxPart, PowerCorePart, ArmorPart, CargoBayPart, DroneDefinition, MergeRecipe, TunnelPropDef, DroneType, ResourceType } from './types';

export const BIOMES: Biome[] = [
  {
    depth: 0, name: { RU: "ПОВЕРХНОСТЬ", EN: "SURFACE" }, resource: ResourceType.CLAY, color: "#8B4513",
    description: { RU: "Пыльный горизонт, где всё начинается.", EN: "Dusty horizon where it all begins." }, hub: "БАЗА 'ГОРИЗОНТ'",
    hazard: 'CORROSION', hazardLevel: 1, gemResource: ResourceType.RUBIES
  },
  {
    depth: 500, name: { RU: "ТВЕРДЫЙ КАМЕНЬ", EN: "HARD ROCK" }, resource: ResourceType.STONE, color: "#555555",
    description: { RU: "Непрощающая кора. Проверь свою решимость.", EN: "Unforgiving crust. Test your resolve." },
    hazard: 'NONE', hazardLevel: 0, gemResource: ResourceType.RUBIES
  },
  {
    depth: 1500, name: { RU: "МЕДНЫЕ ЖИЛЫ", EN: "COPPER VEINS" }, resource: ResourceType.COPPER, color: "#B87333",
    description: { RU: "Проводящие пути в глубине. Осторожно: ЭМ-поля.", EN: "Conductive paths in the deep. Caution: EM fields." },
    hazard: 'MAGNETIC', hazardLevel: 15, gemResource: ResourceType.EMERALDS
  },
  {
    depth: 4000, name: { RU: "ЗАЛЕЖИ ЖЕЛЕЗА", EN: "IRON DEPOSITS" }, resource: ResourceType.IRON, color: "#A19D94",
    description: { RU: "Позвоночник машины.", EN: "The backbone of the machine." },
    hazard: 'CORROSION', hazardLevel: 10, gemResource: ResourceType.EMERALDS
  },
  {
    depth: 10000, name: { RU: "КРИСТАЛЬНЫЕ ГРОТЫ", EN: "CRYSTAL GROTTOES" }, resource: ResourceType.SILVER, color: "#00CED1",
    description: { RU: "Сияние в темноте. Отражают тепло.", EN: "Glitter in the dark. Reflect heat." }, hub: "КРИСТАЛЬНАЯ ГАВАНЬ",
    hazard: 'HEAT_REFLECTION', hazardLevel: 25, gemResource: ResourceType.DIAMONDS
  },
  {
    depth: 20000, name: { RU: "ЗОЛОТАЯ ЗЕМЛЯ", EN: "GOLDEN LAND" }, resource: ResourceType.GOLD, color: "#FFD700",
    description: { RU: "Богатства спрессованной пустоты.", EN: "Riches of compressed void." },
    hazard: 'MAGNETIC', hazardLevel: 30, gemResource: ResourceType.DIAMONDS
  },
  {
    depth: 50000, name: { RU: "ПЛАСТЫ ПУСТОТЫ", EN: "VOID LAYERS" }, resource: ResourceType.TITANIUM, color: "#1A1A1A",
    description: { RU: "Здесь свет гаснет. Давление критическое.", EN: "Where the light fades. Critical pressure." }, hub: "КУЗНИЦА МАГМЫ",
    hazard: 'VOID_PRESSURE', hazardLevel: 50, gemResource: ResourceType.DIAMONDS
  },
  {
    depth: 100000, name: { RU: "РАДИОАКТИВНОЕ ЯДРО", EN: "RADIOACTIVE CORE" }, resource: ResourceType.URANIUM, color: "#32CD32",
    description: { RU: "Последний барьер. Сердце бытия.", EN: "The final barrier. Heart of existence." }, hub: "СВЯТИЛИЩЕ ЯДРА",
    hazard: 'RADIATION', hazardLevel: 100, gemResource: ResourceType.EMERALDS
  }
];


// --- VISUAL PROPS REGISTRY (NEW) ---
export const TUNNEL_PROPS: TunnelPropDef[] = [
  { type: 'FOSSIL', minDepth: 10, maxDepth: 800, chance: 0.05, color: '#A0A0A0' }, // Bones/Shells
  { type: 'PIPE', minDepth: 100, maxDepth: 2000, chance: 0.03, color: '#554433' }, // Rusted Pipes
  { type: 'TECH_DEBRIS', minDepth: 2000, maxDepth: 10000, chance: 0.02, color: '#40E0D0' }, // Old Robots
  { type: 'CRYSTAL', minDepth: 8000, maxDepth: 25000, chance: 0.08, color: '#E0FFFF' }, // Giant Crystals
  { type: 'RUIN', minDepth: 15000, maxDepth: 100000, chance: 0.01, color: '#FFD700' } // Precursor Statues
];

// ... (REST OF THE FILE REMAINS UNCHANGED - BITS, ENGINES, ETC.)
// RE-EXPORTING EXISTING ARRAYS FOR BREVITY IN XML
export const BITS: DrillPart[] = [
  { id: 'bit_1', tier: 1, mass: 10, rarity: 'Common', name: { RU: 'Ржавое жало', EN: 'Rusty Sting' }, description: { RU: 'Базовый урон 1. Потребляет 1 энергии.', EN: 'Base damage 1. Consumes 1 energy.' }, cost: { clay: 50 }, baseStats: { damage: 1, energyCost: 1 }, fxId: 'pixel_sparks_brown' },
  { id: 'bit_2', tier: 2, mass: 17, rarity: 'Common', name: { RU: 'Стальной Крот', EN: 'Steel Mole' }, description: { RU: 'Урон 5. Потребляет 3 энергии.', EN: 'Damage 5. Consumes 3 energy.' }, cost: { clay: 200, stone: 50 }, baseStats: { damage: 5, energyCost: 3 }, fxId: 'none' },
  { id: 'bit_3', tier: 3, mass: 23, rarity: 'Common', name: { RU: 'Зуб Мамонта', EN: 'Mammoth Tooth' }, description: { RU: 'Усиленный сплав. Урон: 12. Энергия: 5.', EN: 'Reinforced alloy. Damage: 12. Energy: 5.' }, cost: { stone: 300, copper: 100 }, baseStats: { damage: 12, energyCost: 5 }, fxId: 'none' },
  { id: 'bit_4', tier: 4, mass: 28, rarity: 'Rare', name: { RU: 'Победитовое сверло', EN: 'Widia Drill' }, description: { RU: 'Классика индустрии. Урон: 25. Энергия: 8.', EN: 'Industrial classic. Damage: 25. Energy: 8.' }, cost: { copper: 500, iron: 200 }, baseStats: { damage: 25, energyCost: 8 }, fxId: 'blue_glint' },
  { id: 'bit_5', tier: 5, mass: 33, rarity: 'Rare', name: { RU: 'Титановый Клык', EN: 'Titanium Fang' }, description: { RU: 'Легкий и острый. Урон: 45. Энергия: 12.', EN: 'Light and sharp. Damage: 45. Energy: 12.' }, cost: { iron: 800, silver: 300 }, baseStats: { damage: 45, energyCost: 12 }, fxId: 'blue_glint' },
  { id: 'bit_6', tier: 6, mass: 38, rarity: 'Rare', name: { RU: 'Алмазный Конус', EN: 'Diamond Cone' }, description: { RU: 'Пробивает всё. Урон: 80. Энергия: 18.', EN: 'Bores through all. Damage: 80. Energy: 18.' }, cost: { silver: 1200, gold: 400, diamonds: 5 }, baseStats: { damage: 80, energyCost: 18 }, fxId: 'blue_glint' },
  { id: 'bit_7', tier: 7, mass: 43, rarity: 'Epic', name: { RU: 'Вибро-бур "Сверчок"', EN: 'Vibro-drill "Cricket"' }, description: { RU: 'Ультразвуковой распад. Урон: 120. Энергия: 25.', EN: 'Ultrasound decay. Damage: 120. Energy: 25.' }, cost: { gold: 2000, titanium: 500, rubies: 10 }, blueprintId: 'blueprint_advanced_drilling', baseStats: { damage: 120, energyCost: 25 }, fxId: 'golden_aura_vfx' },
  { id: 'bit_8', tier: 8, mass: 48, rarity: 'Epic', name: { RU: 'Лазерный долот', EN: 'Laser Chisel' }, description: { RU: 'Бесконтактный рез. Урон: 200. Энергия: 35.', EN: 'Contactless cut. Damage: 200. Energy: 35.' }, cost: { titanium: 3000, uranium: 200, rubies: 30 }, blueprintId: 'blueprint_advanced_drilling', baseStats: { damage: 200, energyCost: 35 }, fxId: 'golden_aura_vfx' },
  { id: 'bit_9', tier: 9, mass: 52, rarity: 'Epic', name: { RU: 'Плазменный Резак', EN: 'Plasma Cutter' }, description: { RU: 'Солнечный жар. Урон: 350. Энергия: 50.', EN: 'Solar heat. Damage: 350. Energy: 50.' }, cost: { uranium: 1000, rubies: 50, nanoSwarm: 100 }, blueprintId: 'blueprint_advanced_drilling', baseStats: { damage: 350, energyCost: 50 }, fxId: 'golden_aura_vfx' },
  { id: 'bit_10', tier: 10, mass: 56, rarity: 'Legendary', name: { RU: 'Молекулярный Дезинтегратор', EN: 'Molecular Disintegrator' }, description: { RU: 'Расщепление связей. Урон: 600. Энергия: 70.', EN: 'Bond splitting. Damage: 600. Energy: 70.' }, cost: { ancientTech: 10, emeralds: 30, nanoSwarm: 300 }, blueprintId: 'blueprint_quantum_drilling', baseStats: { damage: 600, energyCost: 70 }, fxId: 'fractal_rainbow_trail' },
  { id: 'bit_11', tier: 11, mass: 60, rarity: 'Legendary', name: { RU: 'Гравитационное Шило', EN: 'Gravitational Awl' }, description: { RU: 'Разрыв пространства. Урон: 1200. Энергия: 100.', EN: 'Space rupture. Damage: 1200. Energy: 100.' }, cost: { ancientTech: 50, diamonds: 50, nanoSwarm: 500 }, blueprintId: 'blueprint_quantum_drilling', baseStats: { damage: 1200, energyCost: 100 }, fxId: 'fractal_rainbow_trail' },
  { id: 'bit_12', tier: 12, mass: 64, rarity: 'Legendary', name: { RU: 'Антиматериевое перо', EN: 'Antimatter Nib' }, description: { RU: 'Аннигиляция. Урон: 2500. Энергия: 150.', EN: 'Annihilation. Damage: 2500. Energy: 150.' }, cost: { ancientTech: 150, nanoSwarm: 1000, diamonds: 100 }, blueprintId: 'blueprint_quantum_drilling', baseStats: { damage: 2500, energyCost: 150 }, fxId: 'fractal_rainbow_trail' },
  // FUSION ONLY
  { id: 'bit_13', tier: 13, mass: 68, rarity: 'Godly', name: { RU: 'Разлом Реальности', EN: 'Reality Breach' }, description: { RU: 'Стирание материи. Урон: 6000. Энергия: 300.', EN: 'Matter erasure. Damage: 6000. Energy: 300.' }, cost: { ancientTech: 500, rubies: 500, diamonds: 200 }, blueprintId: 'blueprint_fusion_core', baseStats: { damage: 6000, energyCost: 300 }, fxId: 'white_hole_distortion' },
  { id: 'bit_14', tier: 14, mass: 72, rarity: 'Godly', name: { RU: 'Спираль Судьбы', EN: 'Spiral of Fate' }, description: { RU: 'Бур, пронзающий небеса. Урон: 15000. Энергия: 500.', EN: 'The drill that pierces heavens. Damage: 15000. Energy: 500.' }, cost: { ancientTech: 1000, emeralds: 500, nanoSwarm: 2000 }, blueprintId: 'blueprint_fusion_core', baseStats: { damage: 15000, energyCost: 500 }, fxId: 'white_hole_distortion' },
  { id: 'bit_15', tier: 15, mass: 76, rarity: 'Godly', name: { RU: 'Пронзающий Пустоту', EN: 'Void Piercer' }, description: { RU: 'Абсолютное оружие. Урон: 50000. Энергия: 1000.', EN: 'Absolute weapon. Damage: 50000. Energy: 1000.' }, cost: { ancientTech: 5000, diamonds: 1000, nanoSwarm: 5000 }, blueprintId: 'blueprint_fusion_core', baseStats: { damage: 50000, energyCost: 1000 }, fxId: 'white_hole_distortion' }
];


export const ENGINES: EnginePart[] = [
  { id: 'eng_1', tier: 1, mass: 80, rarity: 'Common', name: { RU: 'Ручной привод', EN: 'Manual Drive' }, description: { RU: 'Скорость 1.0. Не требует энергии.', EN: 'Speed 1.0. Requires no energy.' }, cost: { clay: 50 }, baseStats: { speed: 1.0, energyCost: 0 } },
  { id: 'eng_2', tier: 2, mass: 139, rarity: 'Common', name: { RU: 'Паровой котел', EN: 'Steam Boiler' }, description: { RU: 'Скорость 2.5. Потребляет 5 энергии.', EN: 'Speed 2.5. Consumes 5 energy.' }, cost: { stone: 100 }, baseStats: { speed: 2.5, energyCost: 5 } },
  { id: 'eng_3', tier: 3, mass: 193, rarity: 'Common', name: { RU: 'Дизель "Старый Джо"', EN: 'Diesel "Old Joe"' }, description: { RU: 'Скорость 1.0. Высокий крутящий момент. Энергия: 10.', EN: 'Speed 1.0. High torque. Energy: 10.' }, cost: { copper: 300 }, baseStats: { speed: 1.0, energyCost: 10 } },
  { id: 'eng_4', tier: 4, mass: 243, rarity: 'Rare', name: { RU: 'Электромотор "Искра"', EN: 'Electric Motor "Spark"' }, description: { RU: 'Скорость 1.5. Энергия: 15.', EN: 'Speed 1.5. Energy: 15.' }, cost: { iron: 600 }, baseStats: { speed: 1.5, energyCost: 15 } },
  { id: 'eng_5', tier: 5, mass: 290, rarity: 'Rare', name: { RU: 'Турбина "Циклон"', EN: 'Turbine "Cyclone"' }, description: { RU: 'Скорость 2.5. Энергия: 25.', EN: 'Speed 2.5. Energy: 25.' }, cost: { silver: 1000 }, baseStats: { speed: 2.5, energyCost: 25 } },
  { id: 'eng_6', tier: 6, mass: 335, rarity: 'Rare', name: { RU: 'Ротор "Вихрь"', EN: 'Rotor "Whirl"' }, description: { RU: 'Скорость 4.0. Энергия: 40.', EN: 'Speed 4.0. Energy: 40.' }, cost: { gold: 1500, rubies: 5 }, baseStats: { speed: 4.0, energyCost: 40 } },
  { id: 'eng_7', tier: 7, mass: 379, rarity: 'Epic', name: { RU: 'Магнитный драйв', EN: 'Magnetic Drive' }, description: { RU: 'Скорость 6.0. Энергия: 60.', EN: 'Speed 6.0. Energy: 60.' }, cost: { titanium: 2500, nanoSwarm: 50 }, blueprintId: 'blueprint_high_power_engines', baseStats: { speed: 6.0, energyCost: 60 } },
  { id: 'eng_8', tier: 8, mass: 422, rarity: 'Epic', name: { RU: 'Ионный ускоритель', EN: 'Ionic Accelerator' }, description: { RU: 'Скорость 9.0. Энергия: 80.', EN: 'Speed 9.0. Energy: 80.' }, cost: { uranium: 1000, emeralds: 20 }, blueprintId: 'blueprint_high_power_engines', baseStats: { speed: 9.0, energyCost: 80 } },
  { id: 'eng_9', tier: 9, mass: 464, rarity: 'Epic', name: { RU: 'Фотонный двигатель', EN: 'Photonic Engine' }, description: { RU: 'Скорость 12.0. Энергия: 100.', EN: 'Speed 12.0. Energy: 100.' }, cost: { ancientTech: 20, rubies: 30 }, blueprintId: 'blueprint_high_power_engines', baseStats: { speed: 12.0, energyCost: 100 } },
  { id: 'eng_10', tier: 10, mass: 505, rarity: 'Legendary', name: { RU: 'Варп-привод', EN: 'Warp Drive' }, description: { RU: 'Скорость 18.0. Энергия: 150.', EN: 'Speed 18.0. Energy: 150.' }, cost: { ancientTech: 50, rubies: 50, nanoSwarm: 200 }, blueprintId: 'blueprint_quantum_engines', baseStats: { speed: 18.0, energyCost: 150 } },
  { id: 'eng_11', tier: 11, mass: 545, rarity: 'Legendary', name: { RU: 'Тахионный ротор', EN: 'Tachyon Rotor' }, description: { RU: 'Скорость 25.0. Энергия: 200.', EN: 'Speed 25.0. Energy: 200.' }, cost: { ancientTech: 150, emeralds: 50, nanoSwarm: 400 }, blueprintId: 'blueprint_quantum_engines', baseStats: { speed: 25.0, energyCost: 200 } },
  { id: 'eng_12', tier: 12, mass: 584, rarity: 'Legendary', name: { RU: 'Темная материя', EN: 'Dark Matter' }, description: { RU: 'Скорость 40.0. Энергия: 300.', EN: 'Speed 40.0. Energy: 300.' }, cost: { ancientTech: 400, diamonds: 50, nanoSwarm: 800 }, blueprintId: 'blueprint_quantum_engines', baseStats: { speed: 40.0, energyCost: 300 } },
  { id: 'fus_eng_13', tier: 13, mass: 623, rarity: 'Godly', name: { RU: 'Нулевая точка', EN: 'Zero Point' }, description: { RU: 'Скорость 60.0. Энергия: 500.', EN: 'Speed 60.0. Energy: 500.' }, cost: { ancientTech: 1000, nanoSwarm: 2000, rubies: 200 }, blueprintId: 'blueprint_fusion_core', baseStats: { speed: 60.0, energyCost: 500 } },
  { id: 'fus_eng_14', tier: 14, mass: 661, rarity: 'Godly', name: { RU: 'Квантовый суперпозитор', EN: 'Quantum Superpositor' }, description: { RU: 'Скорость 100.0. Энергия: 800.', EN: 'Speed 100.0. Energy: 800.' }, cost: { ancientTech: 2500, rubies: 1000, diamonds: 500 }, blueprintId: 'blueprint_fusion_core', baseStats: { speed: 100.0, energyCost: 800 } },
  { id: 'fus_eng_15', tier: 15, mass: 698, rarity: 'Godly', name: { RU: 'Двигатель Воли', EN: 'Engine of Will' }, description: { RU: 'Скорость 200.0. Энергия: 1500.', EN: 'Speed 200.0. Energy: 1500.' }, cost: { ancientTech: 9999, nanoSwarm: 5000 }, blueprintId: 'blueprint_fusion_core', baseStats: { speed: 200.0, energyCost: 1500 } }
];


export const COOLERS: CoolerPart[] = [
  { id: 'cool_1', tier: 1, mass: 30, rarity: 'Common', name: { RU: 'Дырявый бак', EN: 'Leaky Tank' }, description: { RU: 'Охлаждение 1. Экономит энергию.', EN: 'Cooling 1. Saves energy.' }, cost: { clay: 20 }, baseStats: { cooling: 1, energyCost: 0 } },
  { id: 'cool_2', tier: 2, mass: 49, rarity: 'Common', name: { RU: 'Медный радиатор', EN: 'Copper Radiator' }, description: { RU: 'Охлаждение 3. Потребляет 1 энергии.', EN: 'Cooling 3. Consumes 1 energy.' }, cost: { copper: 100 }, baseStats: { cooling: 3, energyCost: 1 } },
  { id: 'cool_3', tier: 3, mass: 65, rarity: 'Common', name: { RU: 'Вентилятор "Тайфун"', EN: 'Turbine "Typhoon"' }, description: { RU: 'Активный обдув. Охл: 5. Энергия: 3.', EN: 'Active cooling. Cool: 5. Energy: 3.' }, cost: { iron: 300 }, baseStats: { cooling: 5, energyCost: 3 } },
  { id: 'cool_4', tier: 4, mass: 79, rarity: 'Rare', name: { RU: 'Масляный контур', EN: 'Oil Circuit' }, description: { RU: 'Эффективный теплоотвод. Охл: 8. Энергия: 6.', EN: 'Efficient heat sink. Cool: 8. Energy: 6.' }, cost: { silver: 600 }, baseStats: { cooling: 8, energyCost: 6 } },
  { id: 'cool_5', tier: 5, mass: 93, rarity: 'Rare', name: { RU: 'Фреоновая петля', EN: 'Freon Loop' }, description: { RU: 'Заморозка фреоном. Охл: 12. Энергия: 10.', EN: 'Freon freezing. Cool: 12. Energy: 10.' }, cost: { gold: 1000, emeralds: 5 }, baseStats: { cooling: 12, energyCost: 10 } },
  { id: 'cool_6', tier: 6, mass: 105, rarity: 'Rare', name: { RU: 'Жидкий Азот', EN: 'Liquid Nitrogen' }, description: { RU: 'Криогенная мощь. Охл: 18. Энергия: 15.', EN: 'Cryogenic power. Cool: 18. Energy: 15.' }, cost: { titanium: 1500, emeralds: 10 }, baseStats: { cooling: 18, energyCost: 15 } },
  { id: 'cool_7', tier: 7, mass: 117, rarity: 'Epic', name: { RU: 'Гелиевый инжектор', EN: 'Helium Injector' }, description: { RU: 'Жидкий гелий. Охл: 25. Энергия: 20.', EN: 'Liquid helium. Cool: 25. Energy: 20.' }, cost: { uranium: 500, diamonds: 5 }, blueprintId: 'blueprint_quantum_cooling', baseStats: { cooling: 25, energyCost: 20 } },
  { id: 'cool_8', tier: 8, mass: 129, rarity: 'Epic', name: { RU: 'Крио-капсула', EN: 'Cryo-Capsule' }, description: { RU: 'Заморозка звука. Охл: 35. Энергия: 30.', EN: 'Sound freezing. Cool: 35. Energy: 30.' }, cost: { ancientTech: 15, diamonds: 10 }, blueprintId: 'blueprint_quantum_cooling', baseStats: { cooling: 35, energyCost: 30 } },
  { id: 'cool_9', tier: 9, mass: 140, rarity: 'Epic', name: { RU: 'Тепловой насос "Бездна"', EN: 'Heat Pump "Abyss"' }, description: { RU: 'Сброс в вакуум. Охл: 50. Энергия: 45.', EN: 'Vacuum dump. Cool: 50. Energy: 45.' }, cost: { ancientTech: 40, rubies: 20, nanoSwarm: 50 }, blueprintId: 'blueprint_quantum_cooling', baseStats: { cooling: 50, energyCost: 45 } },
  { id: 'cool_10', tier: 10, mass: 150, rarity: 'Legendary', name: { RU: 'Эндотермический реактор', EN: 'Endothermic Reactor' }, description: { RU: 'Жар = Энергия. Охл: 70. Выход: +5.', EN: 'Heat = Energy. Cool: 70. Gen: +5.' }, cost: { ancientTech: 100, emeralds: 50, nanoSwarm: 100 }, blueprintId: 'blueprint_cryogenic_tech', baseStats: { cooling: 70, energyCost: -5 } },
  { id: 'cool_11', tier: 11, mass: 161, rarity: 'Legendary', name: { RU: 'Абсолютный ноль', EN: 'Absolute Zero' }, description: { RU: 'Остановка атомов. Охл: 100. Энергия: 80.', EN: 'Atomic stop. Cool: 100. Energy: 80.' }, cost: { ancientTech: 300, diamonds: 50, nanoSwarm: 200, ice: 500 }, blueprintId: 'blueprint_cryogenic_tech', baseStats: { cooling: 100, energyCost: 80 } },
  { id: 'cool_12', tier: 12, mass: 171, rarity: 'Legendary', name: { RU: 'Стрингер Пустоты', EN: 'Void Stringer' }, description: { RU: 'Сброс за грань. Охл: 150. Энергия: 120.', EN: 'Void dump. Cool: 150. Energy: 120.' }, cost: { ancientTech: 800, nanoSwarm: 1000, rubies: 50, ice: 2000 }, blueprintId: 'blueprint_cryogenic_tech', baseStats: { cooling: 150, energyCost: 120 } },
  { id: 'cool_13', tier: 13, mass: 181, rarity: 'Godly', name: { RU: 'Энтропийный якорь', EN: 'Entropy Anchor' }, description: { RU: 'Запрет нагрева. Охл: 250. Энергия: 200.', EN: 'Heating forbidden. Cool: 250. Energy: 200.' }, cost: { ancientTech: 2000, rubies: 500, nanoSwarm: 1500 }, blueprintId: 'blueprint_fusion_core', baseStats: { cooling: 250, energyCost: 200 } },
  { id: 'cool_14', tier: 14, mass: 190, rarity: 'Godly', name: { RU: 'Ледяное сердце звезды', EN: 'Ice Heart of a Star' }, description: { RU: 'Холод космоса. Охл: 400. Энергия: 300.', EN: 'Space cold. Cool: 400. Energy: 300.' }, cost: { ancientTech: 5000, emeralds: 500, diamonds: 200 }, blueprintId: 'blueprint_fusion_core', baseStats: { cooling: 400, energyCost: 300 } },
  { id: 'cool_15', tier: 15, mass: 200, rarity: 'Godly', name: { RU: 'Смерть Вселенной', EN: 'Death of the Universe' }, description: { RU: 'Энтропия замерла. Охл: 999. Энергия: 500.', EN: 'Entropy frozen. Cool: 999. Energy: 500.' }, cost: { ancientTech: 10000, nanoSwarm: 5000 }, blueprintId: 'blueprint_fusion_core', baseStats: { cooling: 999, energyCost: 500 } }
];


export const HULLS: HullPart[] = [
  { id: 'hull_1', tier: 1, mass: 500, rarity: 'Common', name: { RU: 'Каркас из труб', EN: 'Pipe Frame' }, description: { RU: '1 слот. HP: 50. Груз: 5к.', EN: '1 slot. HP: 50. Cargo: 5k.' }, cost: { clay: 50 }, baseStats: { maxIntegrity: 50, slots: 1, heatCap: 100, regen: 0, cargoCapacity: 5000 } },
  { id: 'hull_2', tier: 2, mass: 917, rarity: 'Common', name: { RU: 'Грузовой бокс', EN: 'Cargo Box' }, description: { RU: '1 слот. HP: 150. Груз: 6к.', EN: '1 slot. HP: 150. Cargo: 6k.' }, cost: { stone: 200 }, baseStats: { maxIntegrity: 150, slots: 1, heatCap: 150, regen: 0, cargoCapacity: 6000 } },
  { id: 'hull_3', tier: 3, mass: 1308, rarity: 'Common', name: { RU: 'Сплав "Шахтер"', EN: 'Alloy "Miner"' }, description: { RU: '2 слота. HP: 200. Реген.', EN: '2 slots. HP: 200. Regen.' }, cost: { copper: 500 }, baseStats: { maxIntegrity: 200, slots: 2, heatCap: 200, regen: 0.1, cargoCapacity: 7500 } },
  { id: 'hull_4', tier: 4, mass: 1682, rarity: 'Rare', name: { RU: 'Укрепленный кокон', EN: 'Reinforced Cocoon' }, description: { RU: '2 слота. HP: 400. Крепкий.', EN: '2 slots. HP: 400. Tough.' }, cost: { iron: 1000 }, baseStats: { maxIntegrity: 400, slots: 2, heatCap: 250, regen: 0.2, cargoCapacity: 10000 } },
  { id: 'hull_5', tier: 5, mass: 2044, rarity: 'Rare', name: { RU: 'Рама "Авангард"', EN: 'Frame "Vanguard"' }, description: { RU: '3 слота. HP: 500. Реген: 0.5', EN: '3 slots. HP: 500. Regen: 0.5' }, cost: { silver: 1500 }, baseStats: { maxIntegrity: 500, slots: 3, heatCap: 300, regen: 0.5, cargoCapacity: 15000 } },
  { id: 'hull_6', tier: 6, mass: 2398, rarity: 'Rare', name: { RU: 'Корпус "Бункер"', EN: 'Hull "Bunker"' }, description: { RU: '3 слота. HP: 1000. Надежный.', EN: '3 slots. HP: 1000. Reliable.' }, cost: { gold: 2500, emeralds: 5 }, baseStats: { maxIntegrity: 1000, slots: 3, heatCap: 400, regen: 1, cargoCapacity: 25000 } },
  { id: 'hull_7', tier: 7, mass: 2744, rarity: 'Epic', name: { RU: 'Штурмовой дек', EN: 'Assault Deck' }, description: { RU: '4 слота. HP: 800. Реген: 2.', EN: '4 slots. HP: 800. Regen: 2.' }, cost: { titanium: 4000, emeralds: 20 }, blueprintId: 'blueprint_titanium_hull', baseStats: { maxIntegrity: 800, slots: 4, heatCap: 350, regen: 2, cargoCapacity: 40000 } },
  { id: 'hull_8', tier: 8, mass: 3084, rarity: 'Epic', name: { RU: 'Оболочка "Стелс"', EN: 'Hull "Stealth"' }, description: { RU: '4 слота. HP: 600. Теплоемкость!', EN: '4 slots. HP: 600. Heat Cap!' }, cost: { uranium: 1500, nanoSwarm: 50 }, blueprintId: 'blueprint_titanium_hull', baseStats: { maxIntegrity: 600, slots: 4, heatCap: 500, regen: 3, cargoCapacity: 70000 } },
  { id: 'hull_9', tier: 9, mass: 3419, rarity: 'Epic', name: { RU: 'Титановый Монолит', EN: 'Titanium Monolith' }, description: { RU: '5 слотов. HP: 1500. Монолит.', EN: '5 slots. HP: 1500. Monolith.' }, cost: { ancientTech: 50, rubies: 10, diamonds: 20 }, blueprintId: 'blueprint_titanium_hull', baseStats: { maxIntegrity: 1500, slots: 5, heatCap: 600, regen: 5, cargoCapacity: 120000 } },
  { id: 'hull_10', tier: 10, mass: 3749, rarity: 'Legendary', name: { RU: 'Экзо-скелет "Атлант"', EN: 'Exo-skeleton "Atlas"' }, description: { RU: '5 слотов. HP: 2500. Атлант.', EN: '5 slots. HP: 2500. Atlas.' }, cost: { ancientTech: 150, emeralds: 50, nanoSwarm: 200 }, blueprintId: 'blueprint_adaptive_armor', baseStats: { maxIntegrity: 2500, slots: 5, heatCap: 700, regen: 10, cargoCapacity: 250000 } },
  { id: 'hull_11', tier: 11, mass: 4076, rarity: 'Legendary', name: { RU: 'Живая броня', EN: 'Living Armor' }, description: { RU: '6 слотов. HP: 3000. Реген: 25.', EN: '6 slots. HP: 3000. Regen: 25.' }, cost: { ancientTech: 400, diamonds: 30, nanoSwarm: 500, scrap: 1000 }, blueprintId: 'blueprint_adaptive_armor', baseStats: { maxIntegrity: 3000, slots: 6, heatCap: 800, regen: 25, cargoCapacity: 500000 } },
  { id: 'hull_12', tier: 12, mass: 4398, rarity: 'Legendary', name: { RU: 'Композит "Зеркало"', EN: 'Composite "Mirror"' }, description: { RU: '6 слотов. HP: 3500. Отражение.', EN: '6 slots. HP: 3500. Mirror.' }, cost: { ancientTech: 1000, nanoSwarm: 1500, rubies: 100, scrap: 4000 }, blueprintId: 'blueprint_adaptive_armor', baseStats: { maxIntegrity: 3500, slots: 6, heatCap: 900, regen: 50, cargoCapacity: 1000000 } },
  { id: 'hull_13', tier: 13, mass: 4717, rarity: 'Godly', name: { RU: 'Ковчег Предтеч', EN: 'Ark of the Precursors' }, description: { RU: '7 слотов. HP: 5000. Обитель.', EN: '7 slots. HP: 5000. Abode.' }, cost: { ancientTech: 3000, rubies: 1000, diamonds: 500 }, blueprintId: 'blueprint_fusion_core', baseStats: { maxIntegrity: 5000, slots: 7, heatCap: 1200, regen: 100, cargoCapacity: 2500000 } },
  { id: 'hull_14', tier: 14, mass: 5033, rarity: 'Godly', name: { RU: 'Сингулярная оболочка', EN: 'Singular Shell' }, description: { RU: '8 слотов. HP: 8000. Поглощение.', EN: '8 slots. HP: 8000. Absorption.' }, cost: { ancientTech: 8000, emeralds: 1000, nanoSwarm: 3000 }, blueprintId: 'blueprint_fusion_core', baseStats: { maxIntegrity: 8000, slots: 8, heatCap: 2000, regen: 250, cargoCapacity: 6000000 } },
  { id: 'hull_15', tier: 15, mass: 5346, rarity: 'Godly', name: { RU: 'Несокрушимый', EN: 'Indestructible' }, description: { RU: '10 слотов. HP: 20000. Эпоха.', EN: '10 slots. HP: 20000. Age.' }, cost: { ancientTech: 20000, diamonds: 1000, nanoSwarm: 8000 }, blueprintId: 'blueprint_fusion_core', baseStats: { maxIntegrity: 20000, slots: 10, heatCap: 5000, regen: 1000, cargoCapacity: 15000000 } }
];


export const LOGIC_CORES: LogicPart[] = [
  { id: 'cpu_1', tier: 1, mass: 5, rarity: 'Common', name: { RU: 'Калькулятор', EN: 'Calculator' }, description: { RU: 'Крит 1%. Энергия: 1.', EN: 'Crit 1%. Energy: 1.' }, cost: { clay: 50 }, baseStats: { critChance: 1, energyCost: 1, luck: 0, predictionTime: 0 } },
  { id: 'cpu_2', tier: 2, mass: 8, rarity: 'Common', name: { RU: 'Блок "Сигнал"', EN: 'Unit "Signal"' }, description: { RU: 'Ловит эхо породы.', EN: 'Catches rock echoes.' }, cost: { copper: 150 }, baseStats: { critChance: 3, energyCost: 3, luck: 0, predictionTime: 0 } },
  { id: 'cpu_3', tier: 3, mass: 10, rarity: 'Common', name: { RU: 'Логика "Скан"', EN: 'Logic "Scan"' }, description: { RU: 'Скан породы. Крит: 4%. Удача: 1. Энергия: 5.', EN: 'Rock scanning. Crit: 4%. Luck: 1. Energy: 5.' }, cost: { iron: 300 }, baseStats: { critChance: 4, energyCost: 5, luck: 1, predictionTime: 0 } },
  { id: 'cpu_4', tier: 4, mass: 11, rarity: 'Rare', name: { RU: 'Процессор "Вектор"', EN: 'Processor "Vector"' }, description: { RU: 'Векторный анализ. Крит: 5%. Удача: 2. Энергия: 8.', EN: 'Vector analysis. Crit: 5%. Luck: 2. Energy: 8.' }, cost: { silver: 600 }, baseStats: { critChance: 5, energyCost: 8, luck: 2, predictionTime: 0 } },
  { id: 'cpu_5', tier: 5, mass: 13, rarity: 'Rare', name: { RU: 'ИИ "Геолог"', EN: 'AI "Geologist"' }, description: { RU: 'Подсветка жил. Крит: 7%. Удача: 5. Энергия: 12.', EN: 'Vein highlighting. Crit: 7%. Luck: 5. Energy: 12.' }, cost: { gold: 1000, emeralds: 5 }, baseStats: { critChance: 7, energyCost: 12, luck: 5, predictionTime: 0 } },
  { id: 'cpu_6', tier: 6, mass: 15, rarity: 'Rare', name: { RU: 'Матрица "Поиск"', EN: 'Matrix "Search"' }, description: { RU: 'Поиск сокровищ. Крит: 10%. Удача: 8. Энергия: 18.', EN: 'Treasure search. Crit: 10%. Luck: 8. Energy: 18.' }, cost: { titanium: 1500, emeralds: 10 }, baseStats: { critChance: 10, energyCost: 18, luck: 8, predictionTime: 0 } },
  { id: 'cpu_7', tier: 7, mass: 16, rarity: 'Epic', name: { RU: 'Ядро "Ритм"', EN: 'Core "Rhythm"' }, description: { RU: 'Синхро-импульс. Крит: 12%. Предсказание: 2с. Энергия: 25.', EN: 'Sync-pulse. Crit: 12%. Prediction: 2s. Energy: 25.' }, cost: { uranium: 800, nanoSwarm: 20 }, baseStats: { critChance: 12, energyCost: 25, luck: 10, predictionTime: 2 } },
  { id: 'cpu_8', tier: 8, mass: 17, rarity: 'Epic', name: { RU: 'Квантовый чип', EN: 'Quantum Chip' }, description: { RU: 'Вероятностные поля. Крит: 15%. Предсказание: 3с. Энергия: 35.', EN: 'Probabilistic fields. Crit: 15%. Prediction: 3s. Energy: 35.' }, cost: { ancientTech: 20, nanoSwarm: 50 }, baseStats: { critChance: 15, energyCost: 35, luck: 15, predictionTime: 3 } },
  { id: 'cpu_9', tier: 9, mass: 19, rarity: 'Epic', name: { RU: 'Нейросеть "Видение"', EN: 'Neural Network "Vision"' }, description: { RU: 'Самообучение. Крит: 18%. Предсказание: 4с. Энергия: 50.', EN: 'Self-learning. Crit: 18%. Prediction: 4s. Energy: 50.' }, cost: { ancientTech: 50, nanoSwarm: 100 }, baseStats: { critChance: 18, energyCost: 50, luck: 20, predictionTime: 4 } },
  { id: 'cpu_10', tier: 10, mass: 20, rarity: 'Legendary', name: { RU: 'Анализатор "Слабость"', EN: 'Analyzer "Weakness"' }, description: { RU: 'Точки излома. Крит: 22%. Предсказание: 5с. Энергия: 80.', EN: 'Fracture points. Crit: 22%. Prediction: 5s. Energy: 80.' }, cost: { ancientTech: 100, rubies: 50, nanoSwarm: 200 }, baseStats: { critChance: 22, energyCost: 80, luck: 30, predictionTime: 5 } },
  { id: 'cpu_11', tier: 11, mass: 21, rarity: 'Legendary', name: { RU: 'Кибер-мозг "Альфа"', EN: 'Cyberbrain "Alpha"' }, description: { RU: 'Сверхсознание. Крит: 25%. Предсказание: 7с. Энергия: 120.', EN: 'Overmind. Crit: 25%. Prediction: 7s. Energy: 120.' }, cost: { ancientTech: 250, emeralds: 50, nanoSwarm: 400 }, baseStats: { critChance: 25, energyCost: 120, luck: 40, predictionTime: 7 } },
  { id: 'cpu_12', tier: 12, mass: 22, rarity: 'Legendary', name: { RU: 'Предсказатель', EN: 'Forecaster' }, description: { RU: 'Взгляд сквозь время. Крит: 30%. Предсказание: 10с. Энергия: 180.', EN: 'Gaze through time. Crit: 30%. Prediction: 10s. Energy: 180.' }, cost: { ancientTech: 600, diamonds: 50, nanoSwarm: 800 }, baseStats: { critChance: 30, energyCost: 180, luck: 50, predictionTime: 10 } },
  { id: 'cpu_13', tier: 13, mass: 23, rarity: 'Godly', name: { RU: 'Система "Доминация"', EN: 'System "Domination"' }, description: { RU: 'Доминация разума. Крит: 35%. Предсказание: 15с. Энергия: 250.', EN: 'Mind domination. Crit: 35%. Prediction: 15s. Energy: 250.' }, cost: { ancientTech: 1500, nanoSwarm: 2000 }, baseStats: { critChance: 35, energyCost: 250, luck: 75, predictionTime: 15 } },
  { id: 'cpu_14', tier: 14, mass: 24, rarity: 'Godly', name: { RU: 'Матрица Братана', EN: 'Brotan Matrix' }, description: { RU: 'Сила единства. Крит: 50%. Предсказание: 20с. Энергия: 400.', EN: 'Power of unity. Crit: 50%. Prediction: 20s. Energy: 400.' }, cost: { ancientTech: 4000, diamonds: 500, nanoSwarm: 3000 }, baseStats: { critChance: 50, energyCost: 400, luck: 100, predictionTime: 20 } },
  { id: 'cpu_15', tier: 15, mass: 25, rarity: 'Godly', name: { RU: 'Божественный Архитектор', EN: 'Divine Architect' }, description: { RU: 'Всеведение. Крит: 100%. Предсказание: 30с. Энергия: 800.', EN: 'Omniscience. Crit: 100%. Prediction: 30s. Energy: 800.' }, cost: { ancientTech: 10000, nanoSwarm: 8000 }, baseStats: { critChance: 100, energyCost: 800, luck: 200, predictionTime: 30 } }
];


export const CONTROL_UNITS: ControlPart[] = [
  { id: 'ctrl_1', tier: 1, mass: 8, rarity: 'Common', name: { RU: 'Старая кнопка', EN: 'Old Button' }, description: { RU: 'x1.0', EN: 'x1.0' }, cost: { clay: 10 }, baseStats: { clickMultiplier: 1.0, energyCost: 0, ventSpeed: 1.0 } },
  { id: 'ctrl_2', tier: 2, mass: 13, rarity: 'Common', name: { RU: 'Механический тумблер', EN: 'Mechanical Toggle' }, description: { RU: 'x1.2', EN: 'x1.2' }, cost: { stone: 50 }, baseStats: { clickMultiplier: 1.2, energyCost: 1, ventSpeed: 1.1 } },
  { id: 'ctrl_3', tier: 3, mass: 16, rarity: 'Common', name: { RU: 'Педаль газа', EN: 'Gas Pedal' }, description: { RU: 'Мульт: x1.5. Продув: 1.2. Энергия: 2.', EN: 'Mult: x1.5. Vent: 1.2. Energy: 2.' }, cost: { copper: 150 }, baseStats: { clickMultiplier: 1.5, energyCost: 2, ventSpeed: 1.2 } },
  { id: 'ctrl_4', tier: 4, mass: 20, rarity: 'Rare', name: { RU: 'Джойстик "Ретро"', EN: 'Retro Joystick' }, description: { RU: 'Мульт: x2.0. Продув: 1.5. Энергия: 3.', EN: 'Mult: x2.0. Vent: 1.5. Energy: 3.' }, cost: { iron: 300 }, baseStats: { clickMultiplier: 2.0, energyCost: 3, ventSpeed: 1.5 } },
  { id: 'ctrl_5', tier: 5, mass: 23, rarity: 'Rare', name: { RU: 'Сенсорный ввод', EN: 'Touch Input' }, description: { RU: 'Мульт: x2.5. Продув: 1.8. Энергия: 5.', EN: 'Mult: x2.5. Vent: 1.8. Energy: 5.' }, cost: { silver: 600 }, baseStats: { clickMultiplier: 2.5, energyCost: 5, ventSpeed: 1.8 } },
  { id: 'ctrl_6', tier: 6, mass: 26, rarity: 'Rare', name: { RU: 'Кинетик-сенсор', EN: 'Kinetic Sensor' }, description: { RU: 'Мульт: x3.0. Продув: 2.0. Энергия: 8.', EN: 'Mult: x3.0. Vent: 2.0. Energy: 8.' }, cost: { gold: 1000 }, baseStats: { clickMultiplier: 3.0, energyCost: 8, ventSpeed: 2.0 } },
  { id: 'ctrl_7', tier: 7, mass: 28, rarity: 'Epic', name: { RU: 'Голо-панель', EN: 'Holo Panel' }, description: { RU: 'Мульт: x4.0. Продув: 3.0. Энергия: 12.', EN: 'Mult: x4.0. Vent: 3.0. Energy: 12.' }, cost: { titanium: 1500, nanoSwarm: 20 }, baseStats: { clickMultiplier: 4.0, energyCost: 12, ventSpeed: 3.0 } },
  { id: 'ctrl_8', tier: 8, mass: 31, rarity: 'Epic', name: { RU: 'Перчатка силы', EN: 'Power Glove' }, description: { RU: 'Мульт: x6.0. Продув: 4.0. Энергия: 20.', EN: 'Mult: x6.0. Vent: 4.0. Energy: 20.' }, cost: { uranium: 800, rubies: 10 }, baseStats: { clickMultiplier: 6.0, energyCost: 20, ventSpeed: 4.0 } },
  { id: 'ctrl_9', tier: 9, mass: 33, rarity: 'Epic', name: { RU: 'Мысленный шлем', EN: 'Thought Helmet' }, description: { RU: 'Мульт: x10. Продув: 6.0. Энергия: 35.', EN: 'Mult: x10. Vent: 6.0. Energy: 35.' }, cost: { ancientTech: 25, nanoSwarm: 50 }, baseStats: { clickMultiplier: 10.0, energyCost: 35, ventSpeed: 6.0 } },
  { id: 'ctrl_10', tier: 10, mass: 36, rarity: 'Legendary', name: { RU: 'Нейро-имплант', EN: 'Neuro-implant' }, description: { RU: 'Мульт: x15. Продув: 8.0. Энергия: 50.', EN: 'Mult: x15. Vent: 8.0. Energy: 50.' }, cost: { ancientTech: 100, nanoSwarm: 200 }, baseStats: { clickMultiplier: 15.0, energyCost: 50, ventSpeed: 8.0 } },
  { id: 'ctrl_11', tier: 11, mass: 38, rarity: 'Legendary', name: { RU: 'Прямое подключение', EN: 'Direct Connection' }, description: { RU: 'Мульт: x25. Продув: 12. Энергия: 80.', EN: 'Mult: x25. Vent: 12. Energy: 80.' }, cost: { ancientTech: 250, nanoSwarm: 400 }, baseStats: { clickMultiplier: 25.0, energyCost: 80, ventSpeed: 12.0 } },
  { id: 'ctrl_12', tier: 12, mass: 40, rarity: 'Legendary', name: { RU: 'Волевой интерфейс', EN: 'Will Interface' }, description: { RU: 'Мульт: x50. Продув: 20. Энергия: 120.', EN: 'Mult: x50. Vent: 20. Energy: 120.' }, cost: { ancientTech: 600, nanoSwarm: 800, diamonds: 50 }, baseStats: { clickMultiplier: 50.0, energyCost: 120, ventSpeed: 20.0 } },
  { id: 'ctrl_13', tier: 13, mass: 42, rarity: 'Godly', name: { RU: 'Симбиоз', EN: 'Symbiosis' }, description: { RU: 'Мульт: x100. Продув: 50. Энергия: 200.', EN: 'Mult: x100. Vent: 50. Energy: 200.' }, cost: { ancientTech: 1500, nanoSwarm: 2000, emeralds: 200 }, baseStats: { clickMultiplier: 100.0, energyCost: 200, ventSpeed: 50.0 } },
  { id: 'ctrl_14', tier: 14, mass: 44, rarity: 'Godly', name: { RU: 'Единство души', EN: 'Unity of Soul' }, description: { RU: 'Мульт: x500. Продув: 100. Энергия: 400.', EN: 'Mult: x500. Vent: 100. Energy: 400.' }, cost: { ancientTech: 5000, nanoSwarm: 5000 }, baseStats: { clickMultiplier: 500.0, energyCost: 400, ventSpeed: 100.0 } },
  { id: 'ctrl_15', tier: 15, mass: 47, rarity: 'Godly', name: { RU: 'Творец', EN: 'Creator' }, description: { RU: 'Мульт: x1000. Продув: 500. Энергия: 800.', EN: 'Mult: x1000. Vent: 500. Energy: 800.' }, cost: { ancientTech: 20000, nanoSwarm: 10000 }, baseStats: { clickMultiplier: 1000.0, energyCost: 800, ventSpeed: 500.0 } }
];


export const GEARBOXES: GearboxPart[] = [
  { id: 'gear_1', tier: 1, mass: 50, rarity: 'Common', name: { RU: 'Ремни и шкивы', EN: 'Belts and Pulleys' }, description: { RU: 'Игнор 2%', EN: 'Ignore 2%' }, cost: { clay: 50 }, baseStats: { torque: 2, energyCost: 1 } },
  { id: 'gear_2', tier: 2, mass: 87, rarity: 'Common', name: { RU: 'Шестерни из меди', EN: 'Copper Gears' }, description: { RU: 'Игнор 5%', EN: 'Ignore 5%' }, cost: { copper: 200 }, baseStats: { torque: 5, energyCost: 2 } },
  { id: 'gear_3', tier: 3, mass: 120, rarity: 'Common', name: { RU: 'Стальной червяк', EN: 'Steel Worm' }, description: { RU: 'Тихая работа. Игнор: 10%. Энергия: 4.', EN: 'Quiet work. Ignore: 10%. Energy: 4.' }, cost: { iron: 400 }, baseStats: { torque: 10, energyCost: 4 } },
  { id: 'gear_4', tier: 4, mass: 152, rarity: 'Rare', name: { RU: 'Планетарная передача', EN: 'Planetary Gear' }, description: { RU: 'Компактная мощь. Игнор: 15%. Энергия: 7.', EN: 'Compact power. Ignore: 15%. Energy: 7.' }, cost: { silver: 800 }, baseStats: { torque: 15, energyCost: 7 } },
  { id: 'gear_5', tier: 5, mass: 181, rarity: 'Rare', name: { RU: 'Гидравлика "Напор"', EN: 'Hydraulics "Pressure"' }, description: { RU: 'Жидкостная тяга. Игнор: 20%. Энергия: 12.', EN: 'Fluid traction. Ignore: 20%. Energy: 12.' }, cost: { gold: 1200 }, baseStats: { torque: 20, energyCost: 12 } },
  { id: 'gear_6', tier: 6, mass: 210, rarity: 'Rare', name: { RU: 'Магнитная муфта', EN: 'Magnetic Clutch' }, description: { RU: 'Без лишнего трения. Игнор: 25%. Энергия: 18.', EN: 'No friction. Ignore: 25%. Energy: 18.' }, cost: { titanium: 2000, diamonds: 5 }, baseStats: { torque: 25, energyCost: 18 } },
  { id: 'gear_7', tier: 7, mass: 237, rarity: 'Epic', name: { RU: 'Титановый редуктор', EN: 'Titanium Reducer' }, description: { RU: 'Твердость титана. Игнор: 30%. Энергия: 25.', EN: 'Titanium hardness. Ignore: 30%. Energy: 25.' }, cost: { uranium: 1000, diamonds: 10 }, baseStats: { torque: 30, energyCost: 25 } },
  { id: 'gear_8', tier: 8, mass: 264, rarity: 'Epic', name: { RU: 'Алмазные зубья', EN: 'Diamond Teeth' }, description: { RU: 'Вечные шестерни. Игнор: 40%. Энергия: 35.', EN: 'Eternal gears. Ignore: 40%. Energy: 35.' }, cost: { ancientTech: 20, diamonds: 30 }, baseStats: { torque: 40, energyCost: 35 } },
  { id: 'gear_9', tier: 9, mass: 290, rarity: 'Epic', name: { RU: 'Герметичный привод', EN: 'Hermetic Drive' }, description: { RU: 'Для работы в магме. Игнор: 50%. Энергия: 50.', EN: 'For magma work. Ignore: 50%. Energy: 50.' }, cost: { ancientTech: 60, nanoSwarm: 50 }, baseStats: { torque: 50, energyCost: 50 } },
  { id: 'gear_10', tier: 10, mass: 315, rarity: 'Legendary', name: { RU: 'Грави-стабилизатор', EN: 'Gravi-stabilizer' }, description: { RU: 'Антигравитация. Игнор: 60%. Энергия: 70.', EN: 'Anti-gravity. Ignore: 60%. Energy: 70.' }, cost: { ancientTech: 150, emeralds: 50 }, baseStats: { torque: 60, energyCost: 70 } },
  { id: 'gear_11', tier: 11, mass: 340, rarity: 'Legendary', name: { RU: 'Модуль "Прорыв"', EN: 'Module "Breakthrough"' }, description: { RU: 'Снос преград. Игнор: 70%. Энергия: 100.', EN: 'Barrier demolition. Ignore: 70%. Energy: 100.' }, cost: { ancientTech: 400, diamonds: 100, scrap: 800 }, baseStats: { torque: 70, energyCost: 100 } },
  { id: 'gear_12', tier: 12, mass: 365, rarity: 'Legendary', name: { RU: 'Вариатор "Тьма"', EN: 'Variator "Darkness"' }, description: { RU: 'Поворот искривления. Игнор: 80%. Энергия: 150.', EN: 'Curvature turn. Ignore: 80%. Energy: 150.' }, cost: { ancientTech: 1000, nanoSwarm: 500, rubies: 50, scrap: 2500 }, baseStats: { torque: 80, energyCost: 150 } },
  { id: 'gear_13', tier: 13, mass: 389, rarity: 'Godly', name: { RU: 'Разрушитель связей', EN: 'Bond Breaker' }, description: { RU: 'Распад связей. Игнор: 90%. Энергия: 200.', EN: 'Bond decay. Ignore: 90%. Energy: 200.' }, cost: { ancientTech: 3000, diamonds: 300, nanoSwarm: 1000 }, baseStats: { torque: 90, energyCost: 200 } },
  { id: 'gear_14', tier: 14, mass: 413, rarity: 'Godly', name: { RU: 'Нулевое сопротивление', EN: 'Zero Resistance' }, description: { RU: 'Скольжение в вакууме. Игнор: 95%. Энергия: 300.', EN: 'Sliding in vacuum. Ignore: 95%. Energy: 300.' }, cost: { ancientTech: 8000, nanoSwarm: 3000 }, baseStats: { torque: 95, energyCost: 300 } },
  { id: 'gear_15', tier: 15, mass: 436, rarity: 'Godly', name: { RU: 'Абсолютная тяга', EN: 'Absolute Traction' }, description: { RU: 'Торнадо в шахте. Игнор: 100%. Энергия: 500.', EN: 'Tornado in the mine. Ignore: 100%. Energy: 500.' }, cost: { ancientTech: 20000, diamonds: 1000 }, baseStats: { torque: 100, energyCost: 500 } }
];


export const POWER_CORES: PowerCorePart[] = [
  { id: 'pwr_1', tier: 1, mass: 100, rarity: 'Common', name: { RU: 'Батарейка АА', EN: 'AA Battery' }, description: { RU: 'Выход: 10 ед. энергии.', EN: 'Output: 10 energy units.' }, cost: { clay: 50 }, baseStats: { energyOutput: 10, droneEfficiency: 1.0 } },
  { id: 'pwr_2', tier: 2, mass: 180, rarity: 'Common', name: { RU: 'Свинцовый АКБ', EN: 'Lead Battery' }, description: { RU: '25 ед.', EN: '25 units.' }, cost: { copper: 150 }, baseStats: { energyOutput: 25, droneEfficiency: 1.05 } },
  { id: 'pwr_3', tier: 3, mass: 254, rarity: 'Common', name: { RU: 'Бензогенератор', EN: 'Gasoline Generator' }, description: { RU: '50 ед.', EN: '50 units.' }, cost: { iron: 300 }, baseStats: { energyOutput: 50, droneEfficiency: 1.1 } },
  { id: 'pwr_4', tier: 4, mass: 325, rarity: 'Rare', name: { RU: 'Солнечная панель', EN: 'Solar Panel' }, description: { RU: '80 ед.', EN: '80 units.' }, cost: { silver: 600 }, baseStats: { energyOutput: 80, droneEfficiency: 1.2 } },
  { id: 'pwr_5', tier: 5, mass: 393, rarity: 'Rare', name: { RU: 'Изотопный элемент', EN: 'Isotope Element' }, description: { RU: '120 ед.', EN: '120 units.' }, cost: { gold: 1000 }, baseStats: { energyOutput: 120, droneEfficiency: 1.3 } },
  { id: 'pwr_6', tier: 6, mass: 459, rarity: 'Rare', name: { RU: 'Ядерная ячейка', EN: 'Nuclear Cell' }, description: { RU: '180 ед.', EN: '180 units.' }, cost: { titanium: 1500, rubies: 5 }, baseStats: { energyOutput: 180, droneEfficiency: 1.5 } },
  { id: 'pwr_7', tier: 7, mass: 523, rarity: 'Epic', name: { RU: 'Термоядерный узел', EN: 'Thermonuclear Node' }, description: { RU: '300 ед.', EN: '300 units.' }, cost: { uranium: 1000, rubies: 15 }, baseStats: { energyOutput: 300, droneEfficiency: 1.8 } },
  { id: 'pwr_8', tier: 8, mass: 586, rarity: 'Epic', name: { RU: 'Плазменный шар', EN: 'Plasma Sphere' }, description: { RU: 'Ядро плазмы. Выход: 500. Дроны: 2.2x', EN: 'Plasma core. Output: 500. Drones: 2.2x' }, cost: { ancientTech: 20, rubies: 30 }, baseStats: { energyOutput: 500, droneEfficiency: 2.2 } },
  { id: 'pwr_9', tier: 9, mass: 647, rarity: 'Epic', name: { RU: 'Антиматериевый бак', EN: 'Antimatter Tank' }, description: { RU: 'Чистая энергия. Выход: 800. Дроны: 2.6x', EN: 'Pure energy. Output: 800. Drones: 2.6x' }, cost: { ancientTech: 50, nanoSwarm: 50 }, baseStats: { energyOutput: 800, droneEfficiency: 2.6 } },
  { id: 'pwr_10', tier: 10, mass: 708, rarity: 'Legendary', name: { RU: 'Кварковая ячейка', EN: 'Quark Cell' }, description: { RU: 'Кварковый синтез. Выход: 1200. Дроны: 3.5x', EN: 'Quark synthesis. Output: 1200. Drones: 3.5x' }, cost: { ancientTech: 120, rubies: 50, nanoSwarm: 100 }, baseStats: { energyOutput: 1200, droneEfficiency: 3.5 } },
  { id: 'pwr_11', tier: 11, mass: 768, rarity: 'Legendary', name: { RU: 'Звездное ядро', EN: 'Star Core' }, description: { RU: 'Микро-звезда. Выход: 1800. Дроны: 4.5x', EN: 'Micro-star. Output: 1800. Drones: 4.5x' }, cost: { ancientTech: 300, rubies: 100, diamonds: 50 }, baseStats: { energyOutput: 1800, droneEfficiency: 4.5 } },
  { id: 'pwr_12', tier: 12, mass: 827, rarity: 'Legendary', name: { RU: 'Сингулярность', EN: 'Singularity' }, description: { RU: 'Горизонт событий. Выход: 3000. Дроны: 6x', EN: 'Event horizon. Output: 3000. Drones: 6x' }, cost: { ancientTech: 800, nanoSwarm: 500, emeralds: 50 }, baseStats: { energyOutput: 3000, droneEfficiency: 6.0 } },
  { id: 'pwr_13', tier: 13, mass: 885, rarity: 'Godly', name: { RU: 'Энергия Пустоты', EN: 'Void Energy' }, description: { RU: 'Извлечение из пустоты. Выход: 6000. Дроны: 10x', EN: 'Extraction from void. Output: 6000. Drones: 10x' }, cost: { ancientTech: 2000, rubies: 500, nanoSwarm: 1000 }, baseStats: { energyOutput: 6000, droneEfficiency: 10.0 } },
  { id: 'pwr_14', tier: 14, mass: 942, rarity: 'Godly', name: { RU: 'Дыхание Вселенной', EN: 'Breath of the Universe' }, description: { RU: 'Космический такт. Выход: 15000. Дроны: 20x', EN: 'Cosmic tact. Output: 15000. Drones: 20x' }, cost: { ancientTech: 5000, rubies: 1000, diamonds: 500 }, baseStats: { energyOutput: 15000, droneEfficiency: 20.0 } },
  { id: 'pwr_15', tier: 15, mass: 999, rarity: 'Godly', name: { RU: 'Вечный Двигатель', EN: 'Perpetual Motion' }, description: { RU: 'Энергия без границ. Выход: ∞. Дроны: 50x', EN: 'Limitless energy. Output: ∞. Drones: 50x' }, cost: { ancientTech: 15000, nanoSwarm: 5000 }, baseStats: { energyOutput: 99999, droneEfficiency: 50.0 } }
];


export const ARMORS: ArmorPart[] = [
  { id: 'arm_1', tier: 1, mass: 150, rarity: 'Common', name: { RU: 'Фольга', EN: 'Foil' }, description: { RU: 'Защита 1%. 0 энергии.', EN: 'Defense 1%. 0 energy.' }, cost: { clay: 50 }, baseStats: { defense: 1, energyCost: 0, hazardResist: 0 } },
  { id: 'arm_2', tier: 2, mass: 280, rarity: 'Common', name: { RU: 'Листы стали', EN: 'Steel Sheets' }, description: { RU: '5%', EN: '5%' }, cost: { iron: 200 }, baseStats: { defense: 5, energyCost: 2, hazardResist: 0 } },
  { id: 'arm_3', tier: 3, mass: 403, rarity: 'Common', name: { RU: 'Керамика', EN: 'Ceramics' }, description: { RU: 'Термозащита. Защ: 10%. Жар: +5%. Энергия: 5.', EN: 'Thermal protection. Def: 10%. Heat: +5%. Energy: 5.' }, cost: { stone: 400 }, baseStats: { defense: 10, energyCost: 5, hazardResist: 5 } },
  { id: 'arm_4', tier: 4, mass: 522, rarity: 'Rare', name: { RU: 'Свинец', EN: 'Lead' }, description: { RU: 'Противорад. Защ: 15%. Рад: +10%. Энергия: 10.', EN: 'Anti-rad. Def: 15%. Rad: +10%. Energy: 10.' }, cost: { copper: 600 }, baseStats: { defense: 15, energyCost: 10, hazardResist: 10 } },
  { id: 'arm_5', tier: 5, mass: 639, rarity: 'Rare', name: { RU: 'Титан', EN: 'Titanium' }, description: { RU: 'Титановый щит. Защ: 15%. Все: +15%. Энергия: 15.', EN: 'Titanium shield. Def: 15%. All: +15%. Energy: 15.' }, cost: { titanium: 800 }, baseStats: { defense: 15, energyCost: 15, hazardResist: 15 } },
  { id: 'arm_6', tier: 6, mass: 752, rarity: 'Rare', name: { RU: 'Композит', EN: 'Composite' }, description: { RU: 'Слоистая броня. Защ: 25%. Все: +20%. Энергия: 20.', EN: 'Layered armor. Def: 25%. All: +20%. Energy: 20.' }, cost: { silver: 1200 }, baseStats: { defense: 25, energyCost: 20, hazardResist: 20 } },
  { id: 'arm_7', tier: 7, mass: 864, rarity: 'Epic', name: { RU: 'Магнитное поле', EN: 'Magnetic Field' }, description: { RU: 'Поле Фарадея. Защ: 30%. Все: +30%. Энергия: 30.', EN: 'Faraday field. Def: 30%. All: +30%. Energy: 30.' }, cost: { gold: 2000, emeralds: 10 }, baseStats: { defense: 30, energyCost: 30, hazardResist: 30 } },
  { id: 'arm_8', tier: 8, mass: 975, rarity: 'Epic', name: { RU: 'Ионный щит', EN: 'Ionic Shield' }, description: { RU: 'Энерго-барьер. Защ: 35%. Все: +40%. Энергия: 40.', EN: 'Energy barrier. Def: 35%. All: +40%. Energy: 40.' }, cost: { uranium: 1000, rubies: 20 }, baseStats: { defense: 35, energyCost: 40, hazardResist: 40 } },
  { id: 'arm_9', tier: 9, mass: 1084, rarity: 'Epic', name: { RU: 'Вольфрамовая броня', EN: 'Tungsten Armor' }, description: { RU: 'Вольфрамовый блеск. Защ: 40%. Все: +50%. Энергия: 50.', EN: 'Tungsten shine. Def: 40%. All: +50%. Energy: 50.' }, cost: { ancientTech: 20, diamonds: 20 }, baseStats: { defense: 40, energyCost: 50, hazardResist: 50 } },
  { id: 'arm_10', tier: 10, mass: 1191, rarity: 'Legendary', name: { RU: 'Силовое поле "Зенит"', EN: 'Force Field "Zenith"' }, description: { RU: 'Полное поглощение. Защ: 50%. Все: +60%. Энергия: 70.', EN: 'Full absorption. Def: 50%. All: +60%. Energy: 70.' }, cost: { ancientTech: 60, rubies: 50, nanoSwarm: 50 }, baseStats: { defense: 50, energyCost: 70, hazardResist: 60 } },
  { id: 'arm_11', tier: 11, mass: 1298, rarity: 'Legendary', name: { RU: 'Нейтронный слой', EN: 'Neutron Layer' }, description: { RU: 'Плотность звезды. Защ: 60%. Все: +70%. Энергия: 90.', EN: 'Star density. Def: 60%. All: +70%. Energy: 90.' }, cost: { ancientTech: 150, emeralds: 50, nanoSwarm: 100 }, baseStats: { defense: 60, energyCost: 90, hazardResist: 70 } },
  { id: 'arm_12', tier: 12, mass: 1404, rarity: 'Legendary', name: { RU: 'Пространственный сдвиг', EN: 'Spatial Shift' }, description: { RU: 'Сдвиг фазы. Защ: 70%. Все: +80%. Энергия: 120.', EN: 'Phase shift. Def: 70%. All: +80%. Energy: 120.' }, cost: { ancientTech: 400, diamonds: 50, nanoSwarm: 300 }, baseStats: { defense: 70, energyCost: 120, hazardResist: 80 } },
  { id: 'arm_13', tier: 13, mass: 1509, rarity: 'Godly', name: { RU: 'Щит "Абсолют"', EN: 'Shield "Absolute"' }, description: { RU: 'Абсолютная защита. Защ: 80%. Все: +90%. Энергия: 200.', EN: 'Absolute defense. Def: 80%. All: +90%. Energy: 200.' }, cost: { ancientTech: 1000, emeralds: 300, diamonds: 200 }, baseStats: { defense: 80, energyCost: 200, hazardResist: 90 } },
  { id: 'arm_14', tier: 14, mass: 1613, rarity: 'Godly', name: { RU: 'Фрактальная броня', EN: 'Fractal Armor' }, description: { RU: 'Бесконечное дробление. Защ: 90%. Все: +95%. Энергия: 300.', EN: 'Infinite fragmentation. Def: 90%. All: +95%. Energy: 300.' }, cost: { ancientTech: 3000, nanoSwarm: 2000 }, baseStats: { defense: 90, energyCost: 300, hazardResist: 95 } },
  { id: 'arm_15', tier: 15, mass: 1716, rarity: 'Godly', name: { RU: 'Божественная длань', EN: 'Divine Hand' }, description: { RU: 'Иммунитет Творца. Защ: 100%. Энергия: 600.', EN: 'Creator immunity. Def: 100%. Energy: 600.' }, cost: { ancientTech: 10000, rubies: 1000, emeralds: 1000, diamonds: 1000 }, baseStats: { defense: 100, energyCost: 600, hazardResist: 100 } }
];


export const CARGO_BAYS: CargoBayPart[] = [
  { id: 'cargo_1', tier: 1, mass: 200, rarity: 'Common', name: { RU: 'Ржавый ящик', EN: 'Rusty Crate' }, description: { RU: 'Грубо сваренные листы металла.', EN: 'Roughly welded metal sheets.' }, cost: { clay: 20 }, baseStats: { cargoCapacity: 1000, energyCost: 2 } },
  { id: 'cargo_2', tier: 2, mass: 361, rarity: 'Common', name: { RU: 'Сварной контейнер', EN: 'Welded Container' }, description: { RU: 'Сталь. HP: 150. Груз: 2к. Энергия: 4.', EN: 'Steel. HP: 150. Cargo: 2k. Energy: 4.' }, cost: { stone: 100 }, baseStats: { cargoCapacity: 2000, energyCost: 4 } },
  { id: 'cargo_3', tier: 3, mass: 509, rarity: 'Common', name: { RU: 'Сетчатый органайзер', EN: 'Mesh Organizer' }, description: { RU: 'Сетка. HP: 200. Груз: 3.5к. Энергия: 8.', EN: 'Mesh. HP: 200. Cargo: 3.5k. Energy: 8.' }, cost: { copper: 300 }, baseStats: { cargoCapacity: 3500, energyCost: 8 } },
  { id: 'cargo_4', tier: 4, mass: 650, rarity: 'Rare', name: { RU: 'Стальной сейф', EN: 'Steel Safe' }, description: { RU: 'Сейф. HP: 400. Груз: 6к. Энергия: 15.', EN: 'Safe. HP: 400. Cargo: 6k. Energy: 15.' }, cost: { iron: 600 }, baseStats: { cargoCapacity: 6000, energyCost: 15 } },
  { id: 'cargo_5', tier: 5, mass: 786, rarity: 'Rare', name: { RU: 'Укрепленный модуль', EN: 'Reinforced Module' }, description: { RU: 'Прочный. HP: 500. Груз: 10к. Энергия: 25.', EN: 'Tough. HP: 500. Cargo: 10k. Energy: 25.' }, cost: { silver: 1200 }, baseStats: { cargoCapacity: 10000, energyCost: 25 } },
  { id: 'cargo_6', tier: 6, mass: 917, rarity: 'Rare', name: { RU: 'Титановая капсула', EN: 'Titanium Capsule' }, description: { RU: 'Легкий. HP: 1000. Груз: 20к. Энергия: 40.', EN: 'Light. HP: 1000. Cargo: 20k. Energy: 40.' }, cost: { gold: 2000, emeralds: 5 }, baseStats: { cargoCapacity: 20000, energyCost: 40 } },
  { id: 'cargo_7', tier: 7, mass: 1046, rarity: 'Epic', name: { RU: 'Вакуумный компрессор', EN: 'Vacuum Compressor' }, description: { RU: 'Сжатие. HP: 800. Груз: 40к. Энергия: 70.', EN: 'Compression. HP: 800. Cargo: 40k. Energy: 70.' }, cost: { titanium: 3500, emeralds: 15 }, baseStats: { cargoCapacity: 40000, energyCost: 70 } },
  { id: 'cargo_8', tier: 8, mass: 1171, rarity: 'Epic', name: { RU: 'Магнитный расширитель', EN: 'Magnetic Expander' }, description: { RU: 'Поле. HP: 600. Груз: 80к. Энергия: 120.', EN: 'Field. HP: 600. Cargo: 80k. Energy: 120.' }, cost: { uranium: 1200, diamonds: 10 }, baseStats: { cargoCapacity: 80000, energyCost: 120 } },
  { id: 'cargo_9', tier: 9, mass: 1295, rarity: 'Epic', name: { RU: 'Нано-структурный блок', EN: 'Nano-structural Block' }, description: { RU: 'Нано-сборка. HP: 1500. Груз: 150к. Энергия: 200.', EN: 'Nano-assembly. HP: 1500. Cargo: 150k. Energy: 200.' }, cost: { ancientTech: 40, rubies: 20, nanoSwarm: 50 }, baseStats: { cargoCapacity: 150000, energyCost: 200 } },
  { id: 'cargo_10', tier: 10, mass: 1416, rarity: 'Legendary', name: { RU: 'Гравитационный стабилизатор', EN: 'Gravitational Stabilizer' }, description: { RU: 'Невесомость. HP: 2500. Груз: 300к. Энергия: 350.', EN: 'Weightlessness. HP: 2500. Cargo: 300k. Energy: 350.' }, cost: { ancientTech: 150, emeralds: 50, nanoSwarm: 200 }, baseStats: { cargoCapacity: 300000, energyCost: 350 } },
  { id: 'cargo_11', tier: 11, mass: 1535, rarity: 'Legendary', name: { RU: 'Пространственный карман', EN: 'Spatial Pocket' }, description: { RU: 'Больше внутри. HP: 3000. Груз: 600к. Энергия: 500.', EN: 'Bigger inside. HP: 3000. Cargo: 600k. Energy: 500.' }, cost: { ancientTech: 400, diamonds: 50, nanoSwarm: 500 }, baseStats: { cargoCapacity: 600000, energyCost: 500 } },
  { id: 'cargo_12', tier: 12, mass: 1653, rarity: 'Legendary', name: { RU: 'Подпространственный склад', EN: 'Subspace Warehouse' }, description: { RU: 'Склад в пустоте. HP: 3500. Груз: 1.2М. Энергия: 800.', EN: 'Void warehouse. HP: 3500. Cargo: 1.2M. Energy: 800.' }, cost: { ancientTech: 1200, nanoSwarm: 1500, rubies: 100 }, baseStats: { cargoCapacity: 1200000, energyCost: 800 } },
  // FUSION ONLY
  { id: 'cargo_13', tier: 13, mass: 1770, rarity: 'Godly', name: { RU: 'Квантовый накопитель', EN: 'Quantum Accumulator' }, description: { RU: 'Квантовый сдвиг. HP: 5000. Груз: 3М. Энергия: 1200.', EN: 'Quantum shift. HP: 5000. Cargo: 3M. Energy: 1200.' }, cost: { ancientTech: 3000, rubies: 1000, diamonds: 500 }, baseStats: { cargoCapacity: 3000000, energyCost: 1200 } },
  { id: 'cargo_14', tier: 14, mass: 1885, rarity: 'Godly', name: { RU: 'Сингулярное хранилище', EN: 'Singular Storage' }, description: { RU: 'Сингулярность. HP: 8000. Груз: 8М. Энергия: 2000.', EN: 'Singularity. HP: 8000. Cargo: 8M. Energy: 2000.' }, cost: { ancientTech: 8000, emeralds: 1000, nanoSwarm: 3000 }, baseStats: { cargoCapacity: 8000000, energyCost: 2000 } },
  { id: 'cargo_15', tier: 15, mass: 1999, rarity: 'Godly', name: { RU: 'Бесконечный Горизонт', EN: 'Infinite Horizon' }, description: { RU: 'Объем планеты. HP: 20000. Груз: 20М. Энергия: 4000.', EN: 'Planet volume. HP: 20000. Cargo: 20M. Energy: 4000.' }, cost: { ancientTech: 20000, diamonds: 1000, nanoSwarm: 8000 }, baseStats: { cargoCapacity: 20000000, energyCost: 4000 } }
];


export const FUSION_RECIPES: MergeRecipe[] = [
  // === DRILL BITS ===
  {
    id: 'fusion_bit_13',
    resultId: 'bit_13',
    componentAId: 'bit_12',
    componentBId: 'bit_12',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 1000 },
    condition: { type: 'DEPTH_REACHED', target: 100000, description: { RU: 'Достигните глубины 100,000м', EN: 'Reach depth 100,000m' } },
    description: { RU: 'Два Антиматериевых пера создают Разлом Реальности', EN: 'Two Antimatter Nibs create Reality Breach' }
  },
  {
    id: 'fusion_bit_14',
    resultId: 'bit_14',
    componentAId: 'bit_13',
    componentBId: 'bit_13',
    catalyst: { resource: ResourceType.NANO_SWARM, amount: 2000 },
    condition: { type: 'ZERO_HEAT', target: 0, description: { RU: 'Слияние при нулевом нагреве', EN: 'Fusion at zero heat' } },
    description: { RU: 'Два Разлома создают Спираль Судьбы', EN: 'Two Breaches create Spiral of Fate' }
  },
  {
    id: 'fusion_bit_15',
    resultId: 'bit_15',
    componentAId: 'bit_14',
    componentBId: 'bit_14',
    catalyst: { resource: ResourceType.DIAMONDS, amount: 500 },
    condition: { type: 'NO_DAMAGE', target: 100, description: { RU: 'Слияние при 100% HP', EN: 'Fusion at 100% HP' } },
    description: { RU: 'Две Спирали создают Пронзающий Пустоту', EN: 'Two Spirals create Void Piercer' }
  },

  // === ENGINES ===
  {
    id: 'fusion_engine_13',
    resultId: 'fus_eng_13',
    componentAId: 'eng_12',
    componentBId: 'eng_12',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 1500 },
    condition: { type: 'MAX_HEAT', target: 100, description: { RU: 'Слияние при максимальном нагреве', EN: 'Fusion at max heat' } },
    description: { RU: 'Две Темные материи создают Нулевую точку', EN: 'Two Dark Matters create Zero Point' }
  },
  {
    id: 'fusion_engine_14',
    resultId: 'fus_eng_14',
    componentAId: 'fus_eng_13',
    componentBId: 'fus_eng_13',
    catalyst: { resource: ResourceType.NANO_SWARM, amount: 3000 },
    condition: { type: 'DEPTH_REACHED', target: 150000, description: { RU: 'Достигните глубины 150,000м', EN: 'Reach depth 150,000m' } },
    description: { RU: 'Две Нулевые точки создают Квантовый суперпозитор', EN: 'Two Zero Points create Quantum Superpositor' }
  },
  {
    id: 'fusion_engine_15',
    resultId: 'fus_eng_15',
    componentAId: 'fus_eng_14',
    componentBId: 'fus_eng_14',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 5000 },
    description: { RU: 'Два Суперпозитора создают Двигатель Воли', EN: 'Two Superpositors create Engine of Will' }
  },

  // === COOLING ===
  {
    id: 'fusion_cooling_13',
    resultId: 'cool_13',
    componentAId: 'cool_12',
    componentBId: 'cool_12',
    catalyst: { resource: ResourceType.ICE, amount: 5000 },
    condition: { type: 'ZERO_HEAT', target: 0, description: { RU: 'Слияние при нулевом нагреве', EN: 'Fusion at zero heat' } },
    description: { RU: 'Два Стрингера Пустоты создают Энтропийный якорь', EN: 'Two Void Stringers create Entropy Anchor' }
  },
  {
    id: 'fusion_cooling_14',
    resultId: 'cool_14',
    componentAId: 'cool_13',
    componentBId: 'cool_13',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 3000 },
    description: { RU: 'Два Энтропийных якоря создают Ледяное сердце звезды', EN: 'Two Entropy Anchors create Ice Heart of a Star' }
  },
  {
    id: 'fusion_cooling_15',
    resultId: 'cool_15',
    componentAId: 'cool_14',
    componentBId: 'cool_14',
    catalyst: { resource: ResourceType.DIAMONDS, amount: 1000 },
    description: { RU: 'Два Ледяных сердца создают Смерть Вселенной', EN: 'Two Ice Hearts create Death of the Universe' }
  },

  // === HULL ===
  {
    id: 'fusion_hull_13',
    resultId: 'hull_13',
    componentAId: 'hull_12',
    componentBId: 'hull_12',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 2000 },
    condition: { type: 'NO_DAMAGE', target: 100, description: { RU: 'Слияние при 100% HP', EN: 'Fusion at 100% HP' } },
    description: { RU: 'Два Зеркала создают Ковчег Предтеч', EN: 'Two Mirrors create Ark of the Precursors' }
  },
  {
    id: 'fusion_hull_14',
    resultId: 'hull_14',
    componentAId: 'hull_13',
    componentBId: 'hull_13',
    catalyst: { resource: ResourceType.NANO_SWARM, amount: 4000 },
    condition: { type: 'DEPTH_REACHED', target: 200000, description: { RU: 'Достигните глубины 200,000м', EN: 'Reach depth 200,000m' } },
    description: { RU: 'Два Ковчега создают Сингулярную оболочку', EN: 'Two Arks create Singular Shell' }
  },
  {
    id: 'fusion_hull_15',
    resultId: 'hull_15',
    componentAId: 'hull_14',
    componentBId: 'hull_14',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 10000 },
    description: { RU: 'Две Оболочки создают Несокрушимый', EN: 'Two Shells create Indestructible' }
  },

  // === LOGIC ===
  {
    id: 'fusion_logic_13',
    resultId: 'cpu_13',
    componentAId: 'cpu_12',
    componentBId: 'cpu_12',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 1200 },
    condition: { type: 'DEPTH_REACHED', target: 120000, description: { RU: 'Достигните глубины 120,000м', EN: 'Reach depth 120,000m' } },
    description: { RU: 'Два Предсказателя создают Систему "Доминация"', EN: 'Two Forecasters create System "Domination"' }
  },
  {
    id: 'fusion_logic_14',
    resultId: 'cpu_14',
    componentAId: 'cpu_13',
    componentBId: 'cpu_13',
    catalyst: { resource: ResourceType.NANO_SWARM, amount: 2500 },
    condition: { type: 'ZERO_HEAT', target: 0, description: { RU: 'Слияние при нулевом нагреве', EN: 'Fusion at zero heat' } },
    description: { RU: 'Две Системы создают Матрицу Братана', EN: 'Two Systems create Brotan Matrix' }
  },
  {
    id: 'fusion_logic_15',
    resultId: 'cpu_15',
    componentAId: 'cpu_14',
    componentBId: 'cpu_14',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 8000 },
    description: { RU: 'Две Матрицы создают Божественного Архитектора', EN: 'Two Matrices create Divine Architect' }
  },

  // === CONTROL ===
  {
    id: 'fusion_control_13',
    resultId: 'ctrl_13',
    componentAId: 'ctrl_12',
    componentBId: 'ctrl_12',
    catalyst: { resource: ResourceType.NANO_SWARM, amount: 1500 },
    condition: { type: 'ZERO_HEAT', target: 0, description: { RU: 'Слияние при нулевом нагреве', EN: 'Fusion at zero heat' } },
    description: { RU: 'Два Волевых интерфейса создают Симбиоз', EN: 'Two Will Interfaces create Symbiosis' }
  },
  {
    id: 'fusion_control_14',
    resultId: 'ctrl_14',
    componentAId: 'ctrl_13',
    componentBId: 'ctrl_13',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 4000 },
    description: { RU: 'Два Симбиоза создают Единство души', EN: 'Two Symbioses create Unity of Soul' }
  },
  {
    id: 'fusion_control_15',
    resultId: 'ctrl_15',
    componentAId: 'ctrl_14',
    componentBId: 'ctrl_14',
    catalyst: { resource: ResourceType.NANO_SWARM, amount: 8000 },
    description: { RU: 'Два Единства создают Творца', EN: 'Two Unities create Creator' }
  },

  // === GEARBOX ===
  {
    id: 'fusion_gearbox_13',
    resultId: 'gear_13',
    componentAId: 'gear_12',
    componentBId: 'gear_12',
    catalyst: { resource: ResourceType.DIAMONDS, amount: 300 },
    condition: { type: 'MAX_HEAT', target: 100, description: { RU: 'Слияние при максимальном нагреве', EN: 'Fusion at max heat' } },
    description: { RU: 'Два Вариатора "Тьма" создают Разрушитель связей', EN: 'Two Variators "Darkness" create Bond Breaker' }
  },
  {
    id: 'fusion_gearbox_14',
    resultId: 'gear_14',
    componentAId: 'gear_13',
    componentBId: 'gear_13',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 6000 },
    description: { RU: 'Два Разрушителя создают Нулевое сопротивление', EN: 'Two Breakers create Zero Resistance' }
  },
  {
    id: 'fusion_gearbox_15',
    resultId: 'gear_15',
    componentAId: 'gear_14',
    componentBId: 'gear_14',
    catalyst: { resource: ResourceType.DIAMONDS, amount: 800 },
    description: { RU: 'Два Нулевых создают Абсолютную тягу', EN: 'Two Zeros create Absolute Traction' }
  },

  // === POWER CORE ===
  {
    id: 'fusion_power_13',
    resultId: 'pwr_13',
    componentAId: 'pwr_12',
    componentBId: 'pwr_12',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 1800 },
    condition: { type: 'NO_DAMAGE', target: 100, description: { RU: 'Слияние при 100% HP', EN: 'Fusion at 100% HP' } },
    description: { RU: 'Две Сингулярности создают Энергию Пустоты', EN: 'Two Singularities create Void Energy' }
  },
  {
    id: 'fusion_power_14',
    resultId: 'pwr_14',
    componentAId: 'pwr_13',
    componentBId: 'pwr_13',
    catalyst: { resource: ResourceType.NANO_SWARM, amount: 3500 },
    description: { RU: 'Две Энергии создают Дыхание Вселенной', EN: 'Two Energies create Breath of the Universe' }
  },
  {
    id: 'fusion_power_15',
    resultId: 'pwr_15',
    componentAId: 'pwr_14',
    componentBId: 'pwr_14',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 12000 },
    description: { RU: 'Два Дыхания создают Вечный Двигатель', EN: 'Two Breaths create Perpetual Motion' }
  },

  // === ARMOR ===
  {
    id: 'fusion_armor_13',
    resultId: 'arm_13',
    componentAId: 'arm_12',
    componentBId: 'arm_12',
    catalyst: { resource: ResourceType.EMERALDS, amount: 300 },
    condition: { type: 'DEPTH_REACHED', target: 180000, description: { RU: 'Достигните глубины 180,000м', EN: 'Reach depth 180,000m' } },
    description: { RU: 'Два Пространственных сдвига создают Щит "Абсолют"', EN: 'Two Spatial Shifts create Shield "Absolute"' }
  },
  {
    id: 'fusion_armor_14',
    resultId: 'arm_14',
    componentAId: 'arm_13',
    componentBId: 'arm_13',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 2500 },
    condition: { type: 'NO_DAMAGE', target: 100, description: { RU: 'Слияние при 100% HP', EN: 'Fusion at 100% HP' } },
    description: { RU: 'Два Щита создают Фрактальную броню', EN: 'Two Shields create Fractal Armor' }
  },
  {
    id: 'fusion_armor_15',
    resultId: 'arm_15',
    componentAId: 'arm_14',
    componentBId: 'arm_14',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 8000 },
    description: { RU: 'Две Брони создают Божественную длань', EN: 'Two Armors create Divine Hand' }
  },

  // === CARGO BAY ===
  {
    id: 'fusion_cargo_13',
    resultId: 'cargo_13',
    componentAId: 'cargo_12',
    componentBId: 'cargo_12',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 2500 },
    condition: { type: 'ZERO_HEAT', target: 0, description: { RU: 'Слияние при нулевом нагреве', EN: 'Fusion at zero heat' } },
    description: { RU: 'Два Подпространственных склада создают Квантовый накопитель', EN: 'Two Subspace Warehouses create Quantum Accumulator' }
  },
  {
    id: 'fusion_cargo_14',
    resultId: 'cargo_14',
    componentAId: 'cargo_13',
    componentBId: 'cargo_13',
    catalyst: { resource: ResourceType.NANO_SWARM, amount: 4000 },
    description: { RU: 'Два Накопителя создают Сингулярное хранилище', EN: 'Two Accumulators create Singular Storage' }
  },
  {
    id: 'fusion_cargo_15',
    resultId: 'cargo_15',
    componentAId: 'cargo_14',
    componentBId: 'cargo_14',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 15000 },
    description: { RU: 'Два Хранилища создают Бесконечный Горизонт', EN: 'Two Storages create Infinite Horizon' }
  }
];

export const DRONES: DroneDefinition[] = [
  {
    id: DroneType.COLLECTOR,
    name: { RU: 'СБОРЩИК MK-1', EN: 'COLLECTOR MK-1' },
    description: { RU: 'Требуется: Медь + Изумруды (сенсоры).', EN: 'Requires: Copper + Emeralds (sensors).' },
    baseCost: { clay: 500, copper: 200, emeralds: 5 },
    costMultiplier: 1.5,
    maxLevel: 10,
    color: '#00FF00',
    effectDescription: (lvl) => ({
      RU: `Множитель сбора: x${(1 + lvl * 0.2).toFixed(1)}`,
      EN: `Collection multiplier: x${(1 + lvl * 0.2).toFixed(1)}`
    })
  },
  {
    id: DroneType.COOLER,
    name: { RU: 'КРИО-БОТ MK-2', EN: 'CRYO-BOT MK-2' },
    description: { RU: 'Требуется: Серебро + Железо (радиатор).', EN: 'Requires: Silver + Iron (radiator).' },
    baseCost: { iron: 800, silver: 400 },
    costMultiplier: 1.6,
    maxLevel: 10,
    color: '#00FFFF',
    effectDescription: (lvl) => ({
      RU: `Охлаждение: -${(1.5 * lvl).toFixed(1)}/сек`,
      EN: `Cooling: -${(1.5 * lvl).toFixed(1)}/sec`
    })
  },
  {
    id: DroneType.BATTLE,
    name: { RU: 'ОХРАННИК MK-3', EN: 'GUARDIAN MK-3' },
    description: { RU: 'Требуется: Титан + Рубины (лазер).', EN: 'Requires: Titanium + Rubies (laser).' },
    baseCost: { gold: 1500, titanium: 600, rubies: 10 },
    costMultiplier: 1.8,
    maxLevel: 10,
    color: '#FF0000',
    effectDescription: (lvl) => ({
      RU: `Урон боссам: ${(50 * lvl)}/сек`,
      EN: `Boss damage: ${(50 * lvl)}/sec`
    })
  },
  {
    id: DroneType.REPAIR,
    name: { RU: 'НАНО-ВРАЧ MK-4', EN: 'NANO-DOCTOR MK-4' },
    description: { RU: 'Требуется: Уран + Нано-рой.', EN: 'Requires: Uranium + Nano-swarm.' },
    baseCost: { uranium: 1000, nanoSwarm: 200 },
    costMultiplier: 2.0,
    maxLevel: 10,
    color: '#FFD700',
    effectDescription: (lvl) => ({
      RU: `Ремонт: +${(0.2 * lvl).toFixed(1)}/сек`,
      EN: `Repair: +${(0.2 * lvl).toFixed(1)}/sec`
    })
  },
  {
    id: DroneType.MINER,
    name: { RU: 'БУР-ДРОН MK-5', EN: 'DRILL-DRONE MK-5' },
    description: { RU: 'Требуется: Ancient Tech + Алмазы (бур).', EN: 'Requires: Ancient Tech + Diamonds (drill).' },
    baseCost: { ancientTech: 50, diamonds: 20 },
    costMultiplier: 2.5,
    maxLevel: 10,
    color: '#FF00FF',
    effectDescription: (lvl) => ({
      RU: `Добыча: ${(lvl * 5)}/сек`,
      EN: `Mining: ${(lvl * 5)}/sec`
    })
  }
];

export const GAME_VERSION = '4.5.0';

