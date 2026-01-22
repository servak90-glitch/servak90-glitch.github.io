/**
 * ComparisonTooltip - тултип сравнения детали в инвентаре с установленной
 */

import React from 'react';
import { EquipmentItem, DrillSlot } from '../../types';
import { useGameStore } from '../../store/gameStore';
import { calculateStats } from '../../services/gameMath';
import { t } from '../../services/localization';

interface ComparisonTooltipProps {
    item: EquipmentItem;
}

export const ComparisonTooltip: React.FC<ComparisonTooltipProps> = ({ item }) => {
    const drill = useGameStore(s => s.drill);
    const skillLevels = useGameStore(s => s.skillLevels);
    const inventory = useGameStore(s => s.inventory);
    const equippedArtifacts = useGameStore(s => s.equippedArtifacts);
    const depth = useGameStore(s => s.depth);

    const equippedPart = drill[item.slotType as DrillSlot];

    // Защита от undefined equipment
    if (!equippedPart || !item || !item.slotType) return null;

    // Защита от невалидной конфигурации drill
    if (!drill.bit || !drill.engine || !drill.cooling || !drill.hull ||
        !drill.logic || !drill.control || !drill.gearbox || !drill.power || !drill.armor) {
        return null;
    }

    // Расчет статов для текущей конфигурации
    const currentStats = calculateStats(drill, skillLevels, equippedArtifacts.filter(Boolean) as string[], inventory, depth);

    // Расчет статов с новой деталью
    // Для ghostDrill нужно использовать equippedPart как шаблон и обновить tier
    // item из EquipmentItem не содержит baseStats напрямую, используем equippedPart с обновленными данными
    const ghostDrill = { ...drill, [item.slotType]: { ...equippedPart, tier: item.tier } };
    const nextStats = calculateStats(ghostDrill, skillLevels, equippedArtifacts.filter(Boolean) as string[], inventory, depth);

    // Характеристики для сравнения
    const statsToCompare = [
        { key: 'totalDamage', label: 'Урон', unit: '', format: (v: number) => v.toFixed(1) },
        { key: 'totalSpeed', label: 'Скорость', unit: '', format: (v: number) => v.toFixed(1) },
        { key: 'totalCooling', label: 'Охлаждение', unit: '', format: (v: number) => v.toFixed(1) },
        { key: 'energyCons', label: 'Энергия', unit: 'W', format: (v: number) => Math.round(v).toString() }
    ];

    const tierDiff = item.tier - equippedPart.tier;

    return (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-[#0a0e17]/95 backdrop-blur-md border border-gray-700/50 rounded-lg p-2.5 shadow-2xl z-[60] pointer-events-none animate-in fade-in slide-in-from-bottom-2">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-800/50 pb-1.5 flex justify-between">
                <span>Сравнение</span>
                <span className={tierDiff > 0 ? 'text-green-400' : tierDiff < 0 ? 'text-red-400' : 'text-white'}>
                    TIER {equippedPart.tier} → {item.tier}
                </span>
            </div>

            <div className="space-y-1">
                {statsToCompare.map(stat => {
                    const currentVal = (currentStats as any)[stat.key];
                    const nextVal = (nextStats as any)[stat.key];
                    const diff = nextVal - currentVal;
                    const isGood = stat.key === 'energyCons' ? diff < 0 : diff > 0;
                    const isNeutral = Math.abs(diff) < 0.01;

                    if (isNeutral) return null;

                    return (
                        <div key={stat.key} className="flex justify-between items-center text-[10px]">
                            <span className="text-gray-500">{stat.label}:</span>
                            <div className="flex items-center gap-1 font-mono">
                                <span className="text-gray-300">{stat.format(currentVal)}</span>
                                <span className={isGood ? 'text-green-400' : 'text-red-400'}>
                                    {diff > 0 ? '+' : ''}{stat.format(diff)}{stat.unit}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-2 pt-1.5 border-t border-gray-800/50">
                <div className="flex justify-between items-center text-[9px] text-gray-500 uppercase font-bold">
                    <span>Итог:</span>
                    {tierDiff > 0 ? (
                        <span className="text-green-400">▲ УЛУЧШЕНИЕ</span>
                    ) : tierDiff < 0 ? (
                        <span className="text-red-400">▼ УХУДШЕНИЕ</span>
                    ) : (
                        <span className="text-blue-400">● ЗАМЕНА</span>
                    )}
                </div>
            </div>
        </div>
    );
};
