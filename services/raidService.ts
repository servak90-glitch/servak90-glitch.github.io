
import { PlayerBase, Resources } from '../types';
import { DEFENSE_UNITS } from '../constants/defenseUnits';

export interface RaidResult {
    success: boolean;
    damageDealt: number; // Integrity loss %
    resourceLoss: Partial<Resources>;
    unitsLost: {
        infantry: number;
        drones: number;
        turrets: number;
    };
    report: { RU: string; EN: string };
}

/**
 * Рассчитывает результат налета на базу
 */
export const calculateRaidOutcome = (base: PlayerBase, attackPower: number): RaidResult => {
    // Fallback для старых баз без defense
    const defense = base.defense ?? {
        integrity: 100,
        shields: 0,
        infantry: 0,
        drones: 0,
        turrets: 0
    };

    const defensePower =
        defense.infantry * DEFENSE_UNITS.infantry.defensePower +
        defense.drones * DEFENSE_UNITS.drone.defensePower +
        defense.turrets * DEFENSE_UNITS.turret.defensePower;

    // Щиты поглощают часть урона (до 50%)
    const shieldAbsorb = (defense.shields / 100) * 0.5;
    const effectiveAP = attackPower * (1 - shieldAbsorb);

    const isSuccess = defensePower >= effectiveAP;

    let damageDealt = 0;
    const resourceLoss: Partial<Resources> = {};
    const unitsLost = { infantry: 0, drones: 0, turrets: 0 };

    if (!isSuccess) {
        // Провал: база получает урон и теряет ресурсы
        const failMargin = (effectiveAP - defensePower) / effectiveAP; // 0.1 - 1.0
        damageDealt = Math.floor(failMargin * 30) + 10; // 10-40% урона

        // Потеря ресурсов (10-30% от хранящихся)
        Object.entries(base.storedResources).forEach(([res, amount]) => {
            if (amount && amount > 0) {
                resourceLoss[res as keyof Resources] = Math.floor(amount * (0.1 + Math.random() * 0.2));
            }
        });

        // Потеря юнитов
        unitsLost.infantry = Math.floor(defense.infantry * (0.2 + Math.random() * 0.3));
        unitsLost.drones = Math.floor(defense.drones * (0.1 + Math.random() * 0.2));
        unitsLost.turrets = Math.floor(defense.turrets * (0.05 + Math.random() * 0.1));
    } else {
        // Успех: небольшая потеря пехоты
        unitsLost.infantry = Math.floor(defense.infantry * 0.1);
        damageDealt = Math.floor(Math.random() * 5); // 0-5% косметического урона
    }

    const report = {
        RU: isSuccess
            ? `🛡️ Налет отражен! Наши силы (DP: ${defensePower}) успешно защитили базу от атаки силой ${attackPower.toFixed(0)}.`
            : `💀 База прорвана! Вражеская атака (AP: ${effectiveAP.toFixed(0)}) оказалась сильнее нашей обороны (DP: ${defensePower}).`,
        EN: isSuccess
            ? `🛡️ Raid repelled! Our forces (DP: ${defensePower}) successfully defended the base against an attack of power ${attackPower.toFixed(0)}.`
            : `💀 Base breached! Enemy attack (AP: ${effectiveAP.toFixed(0)}) was stronger than our defense (DP: ${defensePower}).`
    };

    return {
        success: isSuccess,
        damageDealt,
        resourceLoss,
        unitsLost,
        report
    };
};
