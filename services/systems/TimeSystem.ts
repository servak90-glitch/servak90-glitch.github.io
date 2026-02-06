import { ChronosTime } from '../../types';

/**
 * Chronos Protocol: Логика расчёта времени
 * 1 минута реального времени = 1 игровой час
 * 1 секунда реального времени = 1 игровая минута
 * По умолчанию: 1 игровой день = 24 часа = 1440 игровых минут
 */

export const CHRONOS_CONSTANTS = {
    SECONDS_PER_MINUTE: 60,
    MINUTES_PER_HOUR: 60,
    HOURS_PER_DAY: 24,
    DAYS_PER_WEEK: 7,
    WEEKS_PER_MONTH: 4,
    DAYS_PER_MONTH: 28, // 7 * 4
};

/**
 * Рассчитывает компоненты времени из общих игровых секунд
 */
export function calculateChronosTime(totalSeconds: number): ChronosTime {
    const totalMinutes = Math.floor(totalSeconds / 60);

    const minutes = totalMinutes % 60;
    const totalHours = Math.floor(totalMinutes / 60);

    const hours = totalHours % 24;
    const totalDays = Math.floor(totalHours / 24);

    const days = (totalDays % 28) + 1; // 1-28
    const weeks = Math.floor((totalDays % 28) / 7) + 1; // 1-4
    const months = Math.floor(totalDays / 28) + 1; // 1+

    const seconds = Math.floor(totalSeconds % 60);

    return {
        seconds,
        minutes,
        hours,
        days,
        weeks,
        months,
        totalHours,
        totalDays
    };
}

/**
 * Форматирует игровое время в строку HH:mm или HH:mm:ss
 */
export function formatGameTime(time: ChronosTime, showSeconds: boolean = false): string {
    const h = time.hours.toString().padStart(2, '0');
    const m = time.minutes.toString().padStart(2, '0');
    const s = time.seconds.toString().padStart(2, '0');
    return showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`;
}

/**
 * Возвращает полное название дня недели/месяца? 
 * (Задел на будущее для локализации)
 */
