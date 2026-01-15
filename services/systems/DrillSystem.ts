/**
 * DrillSystem — управление бурением и добычей
 * 
 * Отвечает за:
 * - Увеличение глубины
 * - Добыча ресурсов по биому
 * - Эффективность бурения
 * - Разблокировка контента по глубине
 */

import { GameState, VisualEvent, Stats, ResourceType } from '../../types';
import { BIOMES } from '../../constants';
import { ResourceChanges } from './types';

export interface DrillUpdate {
    depth: number;
    forgeUnlocked: boolean;
    cityUnlocked: boolean;
    skillsUnlocked: boolean;
    storageLevel: number;
}

/**
 * Обработка бурения
 */
export function processDrilling(
    state: GameState,
    stats: Stats,
    activeEffects: GameState['activeEffects'],
    isDrilling: boolean,
    isOverheated: boolean
): { update: DrillUpdate; resourceChanges: ResourceChanges; events: VisualEvent[] } {
    const events: VisualEvent[] = [];
    const resourceChanges: ResourceChanges = {};

    let depth = state.depth;
    let { forgeUnlocked, cityUnlocked, skillsUnlocked, storageLevel } = state;

    // Разблокировка контента по глубине
    if (!forgeUnlocked && depth >= 50) forgeUnlocked = true;
    if (!cityUnlocked && depth >= 200) cityUnlocked = true;
    if (!skillsUnlocked && depth >= 400) skillsUnlocked = true;
    if (storageLevel === 0 && depth >= 600) storageLevel = 1;
    if (storageLevel === 1 && Object.keys(state.inventory).length > 0) storageLevel = 2;

    // Бурение активно
    if (isDrilling && !isOverheated && !state.isBroken && !state.currentBoss) {
        // Лог предупреждения при низкой эффективности
        if (stats.drillingEfficiency < 0.5 && Math.random() < 0.02) {
            events.push({
                type: 'LOG',
                msg: `ОШИБКА: ПЛОТНОСТЬ ПОРОДЫ > ТВЕРДОСТЬ БУРА. ТРЕБУЕТСЯ TIER ${stats.requiredTier}.`,
                color: "text-orange-500 font-mono"
            });
        }

        // Расчёт скорости с учётом твёрдости породы
        const hardness = Math.min(1.0, (depth / 10000));
        const torque = stats.torque / 100;
        const effHardness = Math.max(0, hardness - torque);
        const speedPenalty = Math.max(0.1, 1.0 - effHardness);

        // Модификаторы от эффектов
        let speedMult = 1;
        let resMult = 1;
        activeEffects.forEach(e => {
            if (e.modifiers.drillSpeedMultiplier) speedMult *= e.modifiers.drillSpeedMultiplier;
            if (e.modifiers.resourceMultiplier) resMult *= e.modifiers.resourceMultiplier;
        });

        // Итоговая мощность бурения
        let drillPower = stats.totalSpeed * speedPenalty * speedMult;
        if (state.isOverdrive) drillPower *= 100;

        // Увеличение глубины (только если не выбран конкретный биом)
        if (!state.selectedBiome) {
            depth += drillPower;
        }

        // Добыча ресурсов
        const currentBiome = state.selectedBiome
            ? BIOMES.find(b => b.name === state.selectedBiome) || BIOMES[0]
            : BIOMES.slice().reverse().find(b => depth >= b.depth) || BIOMES[0];

        const resToAdd = drillPower * 0.3 * resMult;
        resourceChanges[currentBiome.resource] = (resourceChanges[currentBiome.resource] || 0) + resToAdd;
    }

    return {
        update: {
            depth,
            forgeUnlocked,
            cityUnlocked,
            skillsUnlocked,
            storageLevel
        },
        resourceChanges,
        events
    };
}
