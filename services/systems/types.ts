/**
 * Общие типы для игровых подсистем
 * Каждая подсистема получает состояние и возвращает частичное обновление + события
 */

import { GameState, VisualEvent, ResourceType, Resources, Stats } from '../../types';

/**
 * Базовый интерфейс обновления от подсистемы
 */
export interface SystemUpdate {
    partialState: Partial<GameState>;
    events: VisualEvent[];
}

/**
 * Контекст для подсистем — общие данные, вычисляемые один раз
 */
export interface SystemContext {
    stats: Stats;
    currentTime: number;
}

/**
 * Изменения ресурсов (накапливаются от разных систем)
 */
export type ResourceChanges = Partial<Record<ResourceType, number>>;

/**
 * Утилита: создаёт пустое обновление
 */
export function emptyUpdate(): SystemUpdate {
    return { partialState: {}, events: [] };
}

/**
 * Утилита: объединяет несколько обновлений от подсистем
 */
export function mergeUpdates(...updates: SystemUpdate[]): SystemUpdate {
    const merged: SystemUpdate = { partialState: {}, events: [] };

    for (const update of updates) {
        Object.assign(merged.partialState, update.partialState);
        merged.events.push(...update.events);
    }

    return merged;
}

/**
 * Утилита: применить изменения ресурсов к текущему состоянию
 */
export function applyResourceChanges(
    currentResources: Resources,
    changes: ResourceChanges
): Resources {
    if (Object.keys(changes).length === 0) return currentResources;

    const newResources = { ...currentResources };
    for (const [key, value] of Object.entries(changes)) {
        const resKey = key as ResourceType;
        newResources[resKey] = Math.max(0, (newResources[resKey] || 0) + (value || 0));
    }
    return newResources;
}
