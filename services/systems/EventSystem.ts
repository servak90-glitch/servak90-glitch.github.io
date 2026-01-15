/**
 * EventSystem — управление случайными событиями
 * 
 * Отвечает за:
 * - Периодическую проверку на события
 * - Добавление событий в очередь
 * - Предотвращение повторов
 */

import { GameState, VisualEvent, GameEvent } from '../../types';
import { rollRandomEvent } from '../eventRegistry';
import { calculateStats } from '../gameMath';

export interface EventUpdate {
    eventCheckTick: number;
    eventQueue: GameEvent[];
    recentEventIds: string[];

    integrity?: number;
    depth?: number;
    xp?: number;
    heat?: number;
}

/**
 * Обработка случайных событий
 */
export function processEvents(state: GameState, stats: ReturnType<typeof calculateStats>): { update: EventUpdate; events: VisualEvent[] } {
    const visualEvents: VisualEvent[] = [];

    let eventCheckTick = (state.eventCheckTick || 0) + 1;
    let eventQueue = state.eventQueue;
    let recentEventIds = state.recentEventIds;

    const updates: Partial<EventUpdate> = {};

    // Проверка каждые 50 тиков (5 секунд)
    if (eventCheckTick >= 50 && eventQueue.length === 0 && !state.currentBoss && !state.combatMinigame?.active) {
        eventCheckTick = 0;

        // 10% шанс события
        if (Math.random() < 0.1) {
            const newEvent = rollRandomEvent(recentEventIds, state.depth, state.heat);

            if (newEvent) {
                eventQueue = [...eventQueue, newEvent];
                recentEventIds = [...recentEventIds, newEvent.id];

                // Хранить только 5 последних
                if (recentEventIds.length > 5) recentEventIds.shift();

                visualEvents.push({ type: 'SOUND', sfx: 'LOG' });
                visualEvents.push({
                    type: 'LOG',
                    msg: `>> СОБЫТИЕ: ${newEvent.title}`,
                    color: "text-cyan-400"
                });

                // --- INSTANT EFFECTS (HARDCORE) ---
                if (newEvent.instantDamage) {
                    const dmg = Math.floor(stats.integrity * newEvent.instantDamage);
                    updates.integrity = Math.max(0, state.integrity - dmg);
                    visualEvents.push({ type: 'LOG', msg: `>> КРИТИЧЕСКИЙ УРОН: -${dmg} HP`, color: 'text-red-500 font-bold' });
                    visualEvents.push({ type: 'TEXT', x: window.innerWidth / 2, y: window.innerHeight / 2, text: `-${dmg}`, style: 'DAMAGE' });
                }

                if (newEvent.instantDepth) {
                    updates.depth = state.depth + newEvent.instantDepth;
                    visualEvents.push({ type: 'LOG', msg: `>> СКАЧОК: +${newEvent.instantDepth}м`, color: 'text-purple-400 font-bold' });
                }

                if (newEvent.instantXp) {
                    updates.xp = state.xp + newEvent.instantXp;
                    visualEvents.push({ type: 'LOG', msg: `>> ОПЫТ: +${newEvent.instantXp} XP`, color: 'text-green-400' });
                }

                if (newEvent.instantHeat) {
                    updates.heat = Math.min(100, state.heat + newEvent.instantHeat);
                    visualEvents.push({ type: 'LOG', msg: `>> НАГРЕВ: +${newEvent.instantHeat}`, color: 'text-orange-500' });
                }
            }
        }
    }

    return {
        update: { eventCheckTick, eventQueue, recentEventIds, ...updates },
        events: visualEvents
    };
}
