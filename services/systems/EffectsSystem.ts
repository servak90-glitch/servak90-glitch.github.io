/**
 * EffectsSystem — управление временными эффектами
 * 
 * Отвечает за:
 * - Уменьшение длительности эффектов
 * - Удаление истёкших эффектов
 * - Логирование окончания эффектов
 */

import { GameState, VisualEvent, ActiveEffect } from '../../types';

export interface EffectsUpdate {
    activeEffects: ActiveEffect[];
}

/**
 * Обработка таймеров эффектов
 */
export function processEffects(state: GameState, dt: number): { update: EffectsUpdate; events: VisualEvent[] } {
    const events: VisualEvent[] = [];
    let nextEffects = state.activeEffects;

    // Проверяем есть ли изменения
    if (nextEffects.length > 0) {
        nextEffects = state.activeEffects
            .map(e => ({ ...e, duration: e.duration - dt }))
            .filter(e => {
                if (e.duration <= 0) {
                    events.push({
                        type: 'LOG',
                        msg: `🚀 ЭФФЕКТ ИСТЕК: ${e.name}`,
                        color: 'text-zinc-500'
                    });
                    return false;
                }
                return true;
            });
    }

    return {
        update: { activeEffects: nextEffects },
        events
    };
}
