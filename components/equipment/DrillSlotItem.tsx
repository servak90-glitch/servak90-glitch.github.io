/**
 * DrillSlotItem - один слот в кукле бура
 * Показывает тип детали, её название и тир
 */

import React from 'react';
import { DrillSlot } from '../../types';
import { useGameStore } from '../../store/gameStore';
import { t } from '../../services/localization';

interface DrillSlotItemProps {
    slotType: DrillSlot;
    isSelected?: boolean;
    onClick?: () => void;
}

export const DrillSlotItem: React.FC<DrillSlotItemProps> = ({ slotType, isSelected, onClick }) => {
    const drill = useGameStore(s => s.drill);
    const lang = useGameStore(s => s.settings.language);

    // Получаем текущую деталь в этом слоте
    // Типизация в DrillState позволяет обращаться по ключу
    const part = drill[slotType];

    if (!part) return null;

    return (
        <div
            onClick={onClick}
            className={`
                relative flex flex-col items-center justify-center p-2 rounded border-2 transition-all cursor-pointer
                ${isSelected
                    ? 'bg-[#3b82f6]/20 border-[#3b82f6] shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                    : 'bg-gray-900/50 border-gray-700 hover:border-gray-500'
                }
            `}
        >
            {/* Название слота (маленькое сверху) */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#0a0e17] px-1 text-[8px] text-gray-400 font-bold uppercase tracking-tighter">
                {slotType}
            </div>

            {/* Имя детали */}
            <div className="text-[10px] font-bold text-white text-center leading-tight truncate w-full">
                {t(part.name, lang)}
            </div>

            {/* Тир */}
            <div className="text-[9px] text-yellow-400 font-mono mt-1">
                TIER {part.tier}
            </div>

            {/* Тултип или индикатор статуса можно добавить сюда */}
        </div>
    );
};
