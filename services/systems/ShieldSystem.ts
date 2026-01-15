/**
 * ShieldSystem — управление энергощитом
 * 
 * Отвечает за:
 * - Заряд щита при бурении
 * - Разряд при активной защите
 * - Пассивная утечка
 */

import { GameState, VisualEvent } from '../../types';

export interface ShieldUpdate {
    shieldCharge: number;
    isShielding: boolean;
}

/**
 * Обработка заряда/разряда щита
 */
export function processShield(state: GameState): ShieldUpdate {
    let shieldCharge = state.shieldCharge;
    let isShielding = false;

    if (state.isDrilling && !state.isOverheated) {
        // Заряд при бурении: +5 в секунду (0.5 за тик)
        shieldCharge = Math.min(100, shieldCharge + 0.5);
    } else if (!state.isDrilling && !state.isOverheated && shieldCharge > 0 && !state.isCoolingGameActive) {
        // Разряд при активной защите: -20 в секунду (2.0 за тик)
        shieldCharge = Math.max(0, shieldCharge - 2.0);
        if (shieldCharge > 0) isShielding = true;
    } else {
        // Пассивная утечка
        shieldCharge = Math.max(0, shieldCharge - 0.1);
    }

    return { shieldCharge, isShielding };
}
