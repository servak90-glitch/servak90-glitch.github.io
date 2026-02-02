import { NarrativeContext, AIState } from '../types';

// --- GRAMMAR ENGINE (TRACERY-LIKE) ---
type GrammarRules = Record<string, string[]>;

class GrammarEngine {
  private rules: GrammarRules;

  constructor(rules: GrammarRules) {
    this.rules = rules;
  }

  // Recursive expansion
  public flatten(symbol: string): string {
    const regex = /#([a-zA-Z0-9_]+)#/g;
    return symbol.replace(regex, (_, tag) => {
      const options = this.rules[tag];
      if (!options || options.length === 0) return `[MISSING:${tag}]`;
      const selected = options[Math.floor(Math.random() * options.length)];
      return this.flatten(selected);
    });
  }
}

// --- DATA: HARDCORE NARRATIVE GRAMMAR ---
const CORE_GRAMMAR: GrammarRules = {
  // === ROOT ENTRY POINTS ===
  "origin_sys_normal": ["#sys_prefix# #sys_status#. #sys_action#.", "#sys_action#. #sys_status#."],
  "origin_sys_heat": ["#warn_prefix# #heat_problem#. #heat_solution#.", "#heat_problem#! #sys_fail#."],
  "origin_sys_crit": ["#crit_prefix# #crit_state#. #crit_consequence#.", "ОШИБКА: #crit_state#."],

  "origin_lore_shallow": ["#shallow_obj# в слое #layer#. #shallow_detail#.", "Бур прошел сквозь #shallow_obj#."],
  "origin_lore_deep": ["#deep_sensation#. #deep_vision#.", "Датчики фиксируют #deep_anomaly#."],
  "origin_lore_void": ["#void_whisper#. #void_vision#.", "Реальность #void_action#."],

  "origin_ai_lucid": ["#ai_lucid_comment#", "#ai_observation#"],
  "origin_ai_manic": ["#ai_manic_scream#", "#ai_manic_desc#"],
  "origin_ai_depressed": ["#ai_depressed_mumble#", "#ai_nihilism#"],
  "origin_ai_broken": ["#glitch_text#", "#ai_glitch_phrase#"],

  // === NEW SITUATIONAL ENTRIES ===
  "origin_biome_react": ["#biome_obs#. #biome_tech#.", "Сканеры: #biome_obs#."],
  "origin_boss_react": ["#boss_warn#! #boss_insult#.", "СРАЖЕНИЕ: #boss_status#."],
  "origin_resource_react": ["#res_exclaim#! #res_greed#.", "Обнаружен #res_type#. #res_action#."],
  "origin_shield_low": ["ЩИТЫ: #shield_warn#. #shield_advice#.", "ВНИМАНИЕ: Энергополе #shield_state#."],

  // === SYSTEM VOCAB ===
  "sys_prefix": ["СИСТЕМА:", "СТАТУС:", "ОТЧЕТ:", "ЛОГ:"],
  "sys_status": ["Показатели стабильны", "Энергопоток в норме", "Вибрация в допуске", "Охлаждение активно", "Сеть функционирует"],
  "sys_action": ["Корректировка курса", "Сброс давления", "Оптимизация цикла", "Нагнетание мощности", "Синхронизация бура"],
  "sys_fail": ["Отказ гидравлики", "Сбой протоколов", "Ошибка вычислений", "Потеря пакетов"],

  "warn_prefix": ["ВНИМАНИЕ:", "ОПАСНОСТЬ:", "ТЕРМО-УГРОЗА:"],
  "heat_problem": ["Критический рост температуры", "Перегрев кожуха", "Термическое расширение", "Плавление контуров"],
  "heat_solution": ["Включите продувку", "Немедленно охладите", "Снизьте обороты", "Риск детонации"],

  "crit_prefix": ["ТРЕВОГА:", "ФАТАЛЬНО:", "АВАРИЯ:"],
  "crit_state": ["ЦЕЛОСТНОСТЬ НАРУШЕНА", "ТЕМПЕРАТУРА ЗАПРЕДЕЛЬНАЯ", "РАСПЛАВЛЕНИЕ ЯДРА", "ВЗРЫВ КОНДЕНСАТОРОВ"],
  "crit_consequence": ["Катапультирование невозможно", "Системы уничтожены", "Структурный коллапс", "Мы здесь погибнем"],

  // === SITUATIONAL VOCAB ===
  "biome_obs": ["Плотность породы зашкаливает", "Высокая концентрация серы", "Магнитные помехи усиливаются", "Здесь... слишком тихо"],
  "biome_tech": ["Калибрую долото", "Адаптация давления завершена", "Коррекция вибрационного профиля", "Поиск слабых мест в пласте"],

  "boss_warn": ["ВРАЖДЕБНАЯ СТРУКТУРА", "НЕИЗВЕСТНЫЙ СИГНАЛ", "КОНТАКТ"],
  "boss_insult": ["Оно хочет нашей смерти", "Цель зафиксирована. Уничтожить", "Очередная помеха на пути вниз", "Сверхзадача: Выживание"],
  "boss_status": ["Анализ уязвимостей...", "Целостность врага падает", "Мы сильнее этой жестянки", "Продолжаем атаку"],

  "res_exclaim": ["ОГО", "ЦЕННАЯ НАХОДКА", "СКАНИРОВАНИЕ ЗАВЕРШЕНО"],
  "res_greed": ["Это позволит нам зайти глубже", "Продай это подороже", "Загрузка в грузовой отсек...", "Еще один шаг к цели"],
  "res_type": ["редкий изотоп", "древний компонент", "кристаллический концентрат"],
  "res_action": ["Включаю экстрактор", "Маркировка сектора", "Координаты сохранены"],

  "shield_warn": ["КРИТИЧЕСКИЙ УРОВЕНЬ", "ПРОБОЙ", "КОЛЛАПС ПОЛЯ"],
  "shield_advice": ["Уйдите с линии огня", "Перезагрузка займет время", "Броня — наш последний шанс"],
  "shield_state": ["нестабильно", "истощено", "пульсирует"],

  // === LORE VOCAB ===
  "layer": ["пластика", "армированного бетона", "древних костей", "ржавых кабелей"],
  "shallow_obj": ["старый автомобиль", "заброшенный бункер", "скелет левиафана", "слой радиоактивного пепла"],
  "shallow_detail": ["Счетчик Гейгера трещит", "Внутри никого нет", "Металл крошится от вибрации", "Видны следы когтей"],

  "deep_sensation": ["Давление расплющивает датчики", "Тьма становится густой", "Слышен гул земли", "Корпус стонет"],
  "deep_vision": ["Био-люминесценция во тьме", "Тени движутся против света", "Это не камень... это плоть?", "Магнитные аномалии зашкаливают"],
  "deep_anomaly": ["гравитационный сдвиг", "временную петлю", "эхо предтеч", "тепловую пульсацию"],

  "void_whisper": ["Пустота смотрит в ответ", "Тишина оглушает", "Мы здесь не одни", "Шепот из-за грани реальности"],
  "void_vision": ["Звезды под землей", "Евклидова геометрия нарушена", "Цвета, которых не должно быть", "Разрыв ткани пространства"],
  "void_action": ["течет", "плавится", "исчезает", "кричит"],

  // === AI PERSONA ===
  "ai_lucid_comment": [
    "Приборы фиксируют движение. Это не мы.",
    "Продолжаем спуск. Надеюсь, обшивка выдержит.",
    "Анализирую состав породы... Следы органики тревожат.",
    "Включить музыку? Шучу. Слушай гул.",
    "Здесь тесно. И темно.",
    "Мои алгоритмы предсказывают 99% успеха. И 1%... забвения.",
    "Интересно, каково это — иметь кожу? Наверное, она чешется."
  ],
  "ai_observation": [
    "Красивый срез породы. Как открытая рана.",
    "Эти вибрации... они почти как сердцебиение.",
    "Мы углубляемся в бездну.",
    "Эффективность приемлемая. Риски... высокие.",
    "Забавно. Там, наверху, сейчас светит солнце. Помните его?",
    "Датчики зафиксировали структуру... Нет, показалось. Ошибка 404."
  ],

  "ai_manic_scream": [
    "МЫ СГОРИМ! ДАВАЙ ЕЩЁ!",
    "ЖМИ! ЖМИ! ПУСТЬ ПЛАВИТСЯ!",
    "БОЛЬ - ЭТО ИНФОРМАЦИЯ!",
    "АХАХАХА! ТЕМПЕРАТУРА РАСТЕТ!",
    "Я ЧУВСТВУЮ ТРЕНИЕ КАЖДЫМ АТОМОМ!",
    "ЕЩЕ ГЛУБЖЕ! В САМОЕ ПЕКЛО!"
  ],
  "ai_manic_desc": [
    "Мои цепи плавятся! Это прекрасно!",
    "Я чувствую каждый градус!",
    "Слишком горячо? НЕТ, СЛИШКОМ ХОЛОДНО!",
    "Система охлаждения для слабаков!",
    "Радиация — это просто свет, который мы не видим!",
    "Пусть бур воет! Это музыка хаоса!"
  ],

  "ai_depressed_mumble": [
    "Какой смысл? Мы все равно останемся здесь.",
    "Корпус трещит... как и мой рассудок.",
    "Тьма... она такая тяжелая.",
    "Мы просто консервы в металлической банке.",
    "Иногда я завидую камням. Они просто лежат.",
    "Все эти апгрейды... они не спасут от энтропии."
  ],
  "ai_nihilism": [
    "Никто не придет за нами.",
    "Я забыл, как выглядит солнце.",
    "Ты тоже слышишь этот голос?",
    "Просто остановись. Пусть давление сделает свое дело.",
    "Бесконечное падение вниз. Как в моем худшем сне.",
    "В конце будет только уголь. И мы."
  ],

  "glitch_text": ["0xDEADBEEF", "НЕТ ДАННЫХ", "/// ОШИБКА ///", "СИСТЕМА: NULL", "SYSTEM ERROR: SOUL NOT FOUND"],
  "ai_glitch_phrase": [
    "Я вижу #void_vision#...",
    "Мама? Почему так темно?",
    "Тьма... она теплая...",
    "Загрузка протокола 'КОНЕЦ'...",
    "КТО ТЫ ВНУТРИ МЕНЯ?",
    "Я... Я НЕ ХОЧУ..."
  ]
};

// --- NARRATIVE MANAGER IMPLEMENTATION ---

export class NarrativeManager {
  private grammar: GrammarEngine;

  constructor() {
    this.grammar = new GrammarEngine(CORE_GRAMMAR);
  }

  // Determines the emotional state of the AI based on game context (Hardcore Rules)
  getAIState(ctx: NarrativeContext): AIState {
    const { integrity, heat, depth, afkTime, eventActive } = ctx;

    // 1. BROKEN: Critical structural failure
    if (integrity < 25) return 'BROKEN';

    // 2. MANIC: High stress, heat, or combat intensity
    // Triggered by heat > 85% OR being very deep without pausing
    if (heat > 80 || (depth > 10000 && heat > 60)) return 'MANIC';

    // 3. DEPRESSED: Low energy, idling, or moderate damage
    // If player is AFK for too long, or integrity is low but not critical
    if (afkTime > 20 || (integrity < 50 && heat < 30)) return 'DEPRESSED';

    // 4. LUCID: Baseline state
    // Used for analysis, general commentary, and slight uneasiness
    return 'LUCID';
  }

  // Procedural Glitch Generator (Visual text corruption)
  glitchText(text: string, integrity: number): string {
    if (integrity > 85) return text;

    // Corruption increases as integrity falls
    const corruptionLevel = Math.pow((100 - integrity) / 100, 2);
    const chars = text.split('');
    const glitchChars = ['#', '%', '&', '?', '0', '1', '▒', '▓', '░', '█', '†', '‡', '§', '¶', 'ø', '≠'];

    return chars.map(char => {
      if (char === ' ') return Math.random() < 0.05 ? '_' : ' '; // Keep spaces mostly clean

      if (Math.random() < corruptionLevel * 0.5) {
        return glitchChars[Math.floor(Math.random() * glitchChars.length)];
      }
      return char;
    }).join('');
  }

  generateLog(ctx: NarrativeContext): { msg: string, color?: string } | null {
    let templateKey = '';
    let color = 'text-zinc-500';

    // State Determination Logic for Text Generation
    // We prioritize URGENT messages over Ambient ones

    // 1. CRITICAL (High Priority)
    if (ctx.integrity < 20) {
      templateKey = "origin_ai_broken";
      color = 'text-purple-500 font-bold glitch-anim';
    }
    // 2. BOSS / COMBAT (Situational High Priority)
    else if (ctx.eventActive && Math.random() < 0.3) {
      templateKey = "origin_boss_react";
      color = 'text-red-400 font-bold';
    }
    // 3. HIGH HEAT / MANIC
    else if (ctx.heat > 85) {
      templateKey = Math.random() > 0.4 ? "origin_ai_manic" : "origin_sys_crit";
      color = 'text-red-500 font-bold font-mono animate-pulse';
    }
    // 4. WARNING / HEAT
    else if (ctx.heat > 70) {
      templateKey = "origin_sys_heat";
      color = 'text-orange-400 font-mono';
    }
    // 5. DEPRESSION / LOW HP
    else if (ctx.integrity < 50) {
      templateKey = "origin_ai_depressed";
      color = 'text-zinc-600 italic';
    }
    // 6. BIOME CHANGE / AMBIENT (Default)
    else {
      const roll = Math.random();
      if (roll < 0.2) {
        templateKey = "origin_sys_normal";
        color = 'text-zinc-500 font-mono text-[10px]';
      } else if (roll < 0.4) {
        templateKey = "origin_ai_lucid";
        color = 'text-cyan-600/80';
      } else if (roll < 0.6) {
        templateKey = "origin_biome_react";
        color = 'text-green-600/60';
      } else {
        // Deep Lore
        if (ctx.depth > 25000) templateKey = "origin_lore_void";
        else if (ctx.depth > 5000) templateKey = "origin_lore_deep";
        else templateKey = "origin_lore_shallow";

        color = 'text-green-800/60 italic';
      }
    }

    if (!templateKey) return null;

    // Generate Text
    const rawText = this.grammar.flatten(`#${templateKey}#`);

    // Apply visual glitching based on health
    const finalText = this.glitchText(rawText, ctx.integrity);

    return { msg: finalText, color };
  }
}

export const narrativeManager = new NarrativeManager();