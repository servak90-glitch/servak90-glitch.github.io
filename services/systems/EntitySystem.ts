/**
 * EntitySystem — управление летающими объектами
 * 
 * Отвечает за:
 * - Спавн спутников и жеод
 * - Движение объектов
 * - Удаление вышедших за экран
 */

import { GameState, VisualEvent, FlyingObject } from '../../types';

export interface EntityUpdate {
    flyingObjects: FlyingObject[];
}

/**
 * Обработка летающих объектов
 */
export function processEntities(state: GameState): { update: EntityUpdate; events: VisualEvent[] } {
    const events: VisualEvent[] = [];
    let flyingObjects = state.flyingObjects;
    let hasChanged = false;

    // Спавн новых объектов
    if (!state.currentBoss && !state.combatMinigame && !state.isCoolingGameActive && flyingObjects.length < 3) {
        if (Math.random() < 0.01) {
            const isDebris = Math.random() > 0.5;
            const hp = Math.floor(Math.random() * 9) + 7;
            const newObj: FlyingObject = {
                id: `fly_${Date.now()}_${Math.random()}`,
                x: Math.random() < 0.5 ? -10 : 110,
                y: 10 + Math.random() * 60,
                type: isDebris ? 'SATELLITE_DEBRIS' : 'GEODE_SMALL',
                vx: (Math.random() * 0.5 + 0.2) * (Math.random() < 0.5 ? 1 : -1),
                vy: (Math.random() - 0.5) * 0.2,
                hp,
                maxHp: hp
            };

            // Направление к центру
            if (newObj.x < 0) newObj.vx = Math.abs(newObj.vx);
            else newObj.vx = -Math.abs(newObj.vx);

            flyingObjects = [...flyingObjects, newObj];
            hasChanged = true;
        }
    }

    // Движение и фильтрация
    if (flyingObjects.length > 0) {
        flyingObjects = flyingObjects
            .map(obj => ({
                ...obj,
                x: obj.x + obj.vx,
                y: obj.y + obj.vy
            }))
            .filter(obj => obj.x > -20 && obj.x < 120 && obj.y > -10 && obj.y < 110);
        hasChanged = true;
    }

    return {
        update: { flyingObjects: hasChanged ? flyingObjects : state.flyingObjects },
        events
    };
}
