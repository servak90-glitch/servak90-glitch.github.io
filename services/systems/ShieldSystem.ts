/**
 * ShieldSystem — управление энергощитом
 * 
 * Отвечает за:
 * - Заряд щита при бурении
 * - Разряд при активной защите
 * - Пассивная утечка
 */

import { GameState } from '../../types';

export interface ShieldUpdate {
    shieldCharge: number;
    isShielding: boolean;
}

/**
 * Обработка заряда/разряда щита
 */
export function processShield(state: GameState, dt: number): ShieldUpdate {
    const { stats } = state;
    const efficiency = stats.shieldEfficiency || 0; // 0.0 to 1.0
    const maxShield = stats.maxShield || 100;
    const rechargeMult = stats.shieldRechargeMult || 1.0;

    let shieldCharge = state.shieldCharge;
    let isShielding = false;

    if (state.isDrilling && !state.isOverheated) {
        // Заряд при бурении: +5 в секунду * множитель
        shieldCharge = Math.min(maxShield, shieldCharge + 5.0 * dt * rechargeMult);
    } else if (!state.isDrilling && !state.isOverheated && shieldCharge > 0 && !state.isCoolingGameActive) {
        // Разряд при активной защите: -20 в секунду (уменьшается эффективностью)
        const dischargeRate = 20.0 * (1 - efficiency);
        shieldCharge = Math.max(0, shieldCharge - dischargeRate * dt);
        if (shieldCharge > 0) isShielding = true;
    } else {
        // Пассивная утечка: -1 в секунду (уменьшается эффективностью)
        const leakageRate = 1.0 * (1 - efficiency);
        shieldCharge = Math.max(0, shieldCharge - leakageRate * dt);
    }

    return { shieldCharge, isShielding };
}
