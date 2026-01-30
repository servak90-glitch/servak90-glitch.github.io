/**
 * EquipmentCard - карточка одной детали equipment в инвентаре
 * Показывает: partId, tier, scrapValue
 * Кнопки: EQUIP (swap), Scrap (♻️), Sell (💰)
 * Нельзя scrap/sell установленную деталь
 */

import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { EquipmentItem } from '../../types';
import { ComparisonTooltip } from './ComparisonTooltip';
import { getPartDefinition } from '../../store/slices/craftSlice';
import { t } from '../../services/localization';
import { EquipmentIcon } from './EquipmentIcon';

interface EquipmentCardProps {
    item: EquipmentItem;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({ item }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const equipEquipment = useGameStore(s => s.equipEquipment);
    const scrapEquipment = useGameStore(s => s.scrapEquipment);
    const sellEquipment = useGameStore(s => s.sellEquipment);
    const lang = useGameStore(s => s.settings.language);

    // Получить название детали
    const partDef = getPartDefinition(item.partId);
    const displayName = partDef ? t(partDef.name, lang) : item.partId;

    // Безопасное получение iconPath (есть только у BaseDrillPart)
    const iconPath = partDef && 'iconPath' in partDef ? partDef.iconPath : undefined;
    const partName = partDef?.name || { RU: item.partId, EN: item.partId };

    return (
        <div
            className="relative bg-gray-900 border border-gray-700 rounded p-2 hover:border-[#3b82f6]/50 transition-all flex flex-col items-center"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {/* Иконка оборудования */}
            <div className="mb-2">
                <EquipmentIcon
                    iconPath={iconPath}
                    name={partName}
                    tier={item.tier}
                    size={64}
                    className="rounded"
                />
            </div>

            {/* Название */}
            <div className="text-xs font-bold text-white mb-1 text-center truncate w-full">{displayName}</div>

            {item.isEquipped && (
                <span className="text-green-400 text-xs block mb-2">✓ УСТАНОВЛЕНО</span>
            )}

            <div className="text-[10px] text-gray-500 mb-2">
                Scrap: {item.scrapValue}
            </div>

            {/* Кнопки */}
            {!item.isEquipped && (
                <div className="flex gap-1 w-full">
                    <button
                        onClick={() => equipEquipment(item.instanceId)}
                        className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs py-1 rounded transition-colors font-bold"
                    >
                        EQUIP
                    </button>
                    <button
                        onClick={() => scrapEquipment(item.instanceId)}
                        className="bg-yellow-600 hover:bg-yellow-500 text-white text-xs py-1 px-2 rounded transition-colors"
                        title="Разобрать на Scrap"
                    >
                        ♻️
                    </button>
                    <button
                        onClick={() => sellEquipment(item.instanceId)}
                        className="bg-green-600 hover:bg-green-500 text-white text-xs py-1 px-2 rounded transition-colors"
                        title="Продать (TODO: Credits)"
                    >
                        💰
                    </button>
                </div>
            )}

            {/* Comparison Tooltip */}
            {showTooltip && !item.isEquipped && (
                <ComparisonTooltip item={item} />
            )}
        </div>
    );
};
