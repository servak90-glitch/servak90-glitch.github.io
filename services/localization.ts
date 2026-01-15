
import { Language } from '../types';

export const TEXT_IDS = {
  INIT_BUTTON: 'INIT_BUTTON',
  SETTINGS_BUTTON: 'SETTINGS_BUTTON',
  EXIT_BUTTON: 'EXIT_BUTTON',
  SETTINGS_TITLE: 'SETTINGS_TITLE',
  MUSIC_VOLUME: 'MUSIC_VOLUME',
  SFX_VOLUME: 'SFX_VOLUME',
  RESET_PROGRESS: 'RESET_PROGRESS',
  RESET_CONFIRM_TITLE: 'RESET_CONFIRM_TITLE',
  RESET_CONFIRM_BODY: 'RESET_CONFIRM_BODY',
  BTN_OK: 'BTN_OK',
  BTN_CANCEL: 'BTN_CANCEL',
  MENU_DRILL: 'MENU_DRILL',
  MENU_FORGE: 'MENU_FORGE',
  MENU_SKILLS: 'MENU_SKILLS',
  MENU_CITY: 'MENU_CITY',
  MENU_ARTIFACTS: 'MENU_ARTIFACTS',
  AI_INIT: 'AI_INIT',
  AI_READY: 'AI_READY',
  MANUAL_BUTTON: 'MANUAL_BUTTON',
  
  // NEW
  HARDCORE_WARNING: 'HARDCORE_WARNING',
  FIRST_RUN_TITLE: 'FIRST_RUN_TITLE',
  FIRST_RUN_BODY: 'FIRST_RUN_BODY',
  BTN_ACKNOWLEDGE: 'BTN_ACKNOWLEDGE',
  HELP_SECTION_SAVE_TITLE: 'HELP_SECTION_SAVE_TITLE',
  HELP_SECTION_SAVE_BODY: 'HELP_SECTION_SAVE_BODY',
  HELP_SECTION_EXPORT_TITLE: 'HELP_SECTION_EXPORT_TITLE',
  HELP_SECTION_EXPORT_BODY: 'HELP_SECTION_EXPORT_BODY'
};

const DICTIONARY: Record<Language, Record<string, string>> = {
  RU: {
    [TEXT_IDS.INIT_BUTTON]: "ИНИЦИАЛИЗАЦИЯ",
    [TEXT_IDS.SETTINGS_BUTTON]: "НАСТРОЙКИ",
    [TEXT_IDS.EXIT_BUTTON]: "ГЛАВНОЕ МЕНЮ",
    [TEXT_IDS.SETTINGS_TITLE]: "НАСТРОЙКИ СИСТЕМЫ",
    [TEXT_IDS.MUSIC_VOLUME]: "МУЗЫКА",
    [TEXT_IDS.SFX_VOLUME]: "ЭФФЕКТЫ",
    [TEXT_IDS.RESET_PROGRESS]: "СБРОС ПРОГРЕССА",
    [TEXT_IDS.RESET_CONFIRM_TITLE]: "ВНИМАНИЕ: СТИРАНИЕ ДАННЫХ",
    [TEXT_IDS.RESET_CONFIRM_BODY]: "Вы потеряете весь прогресс, ресурсы и улучшения. Это действие необратимо и не дает наград. Продолжить?",
    [TEXT_IDS.BTN_OK]: "ОК",
    [TEXT_IDS.BTN_CANCEL]: "ОТМЕНА",
    [TEXT_IDS.MENU_DRILL]: "БУР",
    [TEXT_IDS.MENU_FORGE]: "ЦЕХ",
    [TEXT_IDS.MENU_SKILLS]: "МОЗГ",
    [TEXT_IDS.MENU_CITY]: "ГОРОД",
    [TEXT_IDS.MENU_ARTIFACTS]: "СКЛАД",
    [TEXT_IDS.AI_INIT]: "СИСТЕМА ИНИЦИАЛИЗИРОВАНА...",
    [TEXT_IDS.AI_READY]: "ПИТАНИЕ ПОДАНО. БУР ГОТОВ К РАБОТЕ.",
    [TEXT_IDS.MANUAL_BUTTON]: "РУКОВОДСТВО ОПЕРАТОРА",
    
    [TEXT_IDS.HARDCORE_WARNING]: "ВНИМАНИЕ: ПСИХОЛОГИЧЕСКАЯ УГРОЗА. НЕ ЯВЛЯЕТСЯ ПЕСОЧНИЦЕЙ. ВЫЗЫВАЕТ СТРЕСС И СТРАДАНИЯ.",
    [TEXT_IDS.FIRST_RUN_TITLE]: "ПРОТОКОЛ БЕЗОПАСНОСТИ",
    [TEXT_IDS.FIRST_RUN_BODY]: "Автоматическое сохранение ОТКЛЮЧЕНО. Прогресс зависит только от вашей дисциплины. Изучите 'ЧЕРНЫЙ ЯЩИК' в Руководстве Оператора во избежание потери данных.",
    [TEXT_IDS.BTN_ACKNOWLEDGE]: "ПРИНЯТЬ ОТВЕТСТВЕННОСТЬ",
    [TEXT_IDS.HELP_SECTION_SAVE_TITLE]: "7. ЧЕРНЫЙ ЯЩИК (СОХРАНЕНИЕ)",
    [TEXT_IDS.HELP_SECTION_SAVE_BODY]: "СИСТЕМА НЕ СОХРАНЯЕТ ДАННЫЕ АВТОМАТИЧЕСКИ. Вы обязаны вручную записывать прогресс через меню НАСТРОЙКИ -> ЧЕРНЫЙ ЯЩИК. Закрытие канала связи без записи приведет к потере данных. Это цена работы в Пустоте.",
    [TEXT_IDS.HELP_SECTION_EXPORT_TITLE]: "8. ЭКСТРЕННЫЙ ПРОТОКОЛ (РЕЗЕРВНАЯ КОПИЯ)",
    [TEXT_IDS.HELP_SECTION_EXPORT_BODY]: "Для переноса сознания (прогресса) между терминалами используйте меню НАСТРОЙКИ -> РЕЗЕРВНОЕ КОПИРОВАНИЕ. \n\n1. ЭКСПОРТ: Генерирует нейро-слепок в виде текстового кода (Base64). Сохраните этот код в надежном месте (Заметки, Файл).\n2. ИМПОРТ: Позволяет восстановить состояние из кода. \n\nВАЖНО: Импорт полностью перезаписывает текущую память!"
  },
  EN: {
    [TEXT_IDS.INIT_BUTTON]: "INITIALIZE",
    [TEXT_IDS.SETTINGS_BUTTON]: "SETTINGS",
    [TEXT_IDS.EXIT_BUTTON]: "MAIN MENU",
    [TEXT_IDS.SETTINGS_TITLE]: "SYSTEM SETTINGS",
    [TEXT_IDS.MUSIC_VOLUME]: "MUSIC",
    [TEXT_IDS.SFX_VOLUME]: "SFX",
    [TEXT_IDS.RESET_PROGRESS]: "RESET PROGRESS",
    [TEXT_IDS.RESET_CONFIRM_TITLE]: "WARNING: DATA WIPE",
    [TEXT_IDS.RESET_CONFIRM_BODY]: "You will lose all progress, resources, and upgrades. This action is irreversible and grants no rewards. Continue?",
    [TEXT_IDS.BTN_OK]: "OK",
    [TEXT_IDS.BTN_CANCEL]: "CANCEL",
    [TEXT_IDS.MENU_DRILL]: "DRILL",
    [TEXT_IDS.MENU_FORGE]: "FORGE",
    [TEXT_IDS.MENU_SKILLS]: "MIND",
    [TEXT_IDS.MENU_CITY]: "CITY",
    [TEXT_IDS.MENU_ARTIFACTS]: "VAULT",
    [TEXT_IDS.AI_INIT]: "SYSTEM INITIALIZED...",
    [TEXT_IDS.AI_READY]: "POWER ON. DRILL READY.",
    [TEXT_IDS.MANUAL_BUTTON]: "OPERATOR MANUAL",

    [TEXT_IDS.HARDCORE_WARNING]: "WARNING: PSYCHOLOGICAL HAZARD. NOT A SANDBOX. CAUSES STRESS AND SUFFERING.",
    [TEXT_IDS.FIRST_RUN_TITLE]: "SAFETY PROTOCOL",
    [TEXT_IDS.FIRST_RUN_BODY]: "Auto-save is DISABLED. Progress depends solely on your discipline. Study the 'BLACK BOX' section in the Operator Manual to avoid data loss.",
    [TEXT_IDS.BTN_ACKNOWLEDGE]: "ACCEPT RESPONSIBILITY",
    [TEXT_IDS.HELP_SECTION_SAVE_TITLE]: "7. BLACK BOX (PERSISTENCE)",
    [TEXT_IDS.HELP_SECTION_SAVE_BODY]: "THE SYSTEM DOES NOT AUTO-SAVE. You must manually record progress via SETTINGS -> BLACK BOX. Closing the connection without recording results in total data loss. This is the price of the Void.",
    [TEXT_IDS.HELP_SECTION_EXPORT_TITLE]: "8. EMERGENCY PROTOCOL (BACKUP)",
    [TEXT_IDS.HELP_SECTION_EXPORT_BODY]: "To transfer consciousness (progress) between terminals, use SETTINGS -> BACKUP DATA. \n\n1. EXPORT: Generates a neuro-snapshot as a text code (Base64). Save this code safely (Notes, File).\n2. IMPORT: Restores state from the code. \n\nWARNING: Import completely overwrites current memory!"
  }
};

export const t = (key: string, lang: Language): string => {
  return DICTIONARY[lang][key] || key;
};
