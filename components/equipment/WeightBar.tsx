/**
 * WeightBar - индикатор M_total (общая масса)
 * Использует calculateTotalMass из mathEngine
 * Цветовая индикация: зелёный < 70%, жёлтый 70-90%, красный > 90%
 */

import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { calculateTotalMass } from '../../services/mathEngine';

export const WeightBar: React.FC = () => {
    const drill = useGameStore(s => s.drill);
    const resources = useGameStore(s => s.resources);
    const inventory = useGameStore(s => s.equipmentInventory);

    // Используем mathEngine для расчёта M_total
    const totalMass = calculateTotalMass(drill, resources, inventory);
    const maxCapacity = drill.cargoBay.baseStats.cargoCapacity || 10000;
    const percentage = (totalMass / maxCapacity) * 100;

    // Цвет индикатора
    const barColor = percentage > 90
        ? 'bg-red-500'
        : percentage > 70
            ? 'bg-yellow-500'
            : 'bg-green-500';

    const textColor = percentage > 90
        ? 'text-red-400 animate-pulse'
        : percentage > 70
            ? 'text-yellow-400'
            : 'text-gray-300';

    return (
        <div className="mb-2">
            <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-gray-400">МАССА ГРУЗА (M_total)</span>
                <span className={textColor}>
                    {totalMass.toFixed(0)}kg / {maxCapacity}kg ({percentage.toFixed(1)}%)
                </span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded overflow-hidden">
                <div
                    className={`h-full ${barColor} transition-all duration-500`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
            {percentage > 90 && (
                <div className="text-xs text-red-400 mt-1 animate-pulse">
                    ⚠️ ПЕРЕГРУЗ! Расход топлива увеличен
                </div>
            )}
        </div>
    );
};
