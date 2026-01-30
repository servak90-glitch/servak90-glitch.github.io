import React from 'react';
import { LocalizedString } from '../../types';

interface EquipmentIconProps {
    iconPath?: string;
    name: LocalizedString;
    tier: number;
    size?: number;
    className?: string;
}

/**
 * Компонент для отображения иконки оборудования
 * Автоматически показывает fallback если иконка не найдена
 */
export const EquipmentIcon: React.FC<EquipmentIconProps> = ({
    iconPath,
    name,
    tier,
    size = 64,
    className = ''
}) => {
    const [imageError, setImageError] = React.useState(false);

    // Получить текст из LocalizedString
    const getName = (name: LocalizedString): string => {
        return typeof name === 'string' ? name : name.RU;
    };

    // Определяем цвет рамки по тиру (редкости)
    const getRarityColor = (tier: number): string => {
        if (tier <= 3) return 'border-gray-500'; // Common
        if (tier <= 6) return 'border-blue-500'; // Rare
        if (tier <= 9) return 'border-purple-500'; // Epic
        if (tier <= 12) return 'border-yellow-500'; // Legendary
        return 'border-white'; // Godly
    };

    // Определяем свечение по тиру
    const getRarityGlow = (tier: number): string => {
        if (tier <= 3) return ''; // Common - без свечения
        if (tier <= 6) return 'shadow-[0_0_10px_rgba(59,130,246,0.5)]'; // Rare - синее
        if (tier <= 9) return 'shadow-[0_0_10px_rgba(168,85,247,0.5)]'; // Epic - фиолетовое
        if (tier <= 12) return 'shadow-[0_0_10px_rgba(234,179,8,0.5)]'; // Legendary - золотое
        return 'shadow-[0_0_15px_rgba(255,255,255,0.7)]'; // Godly - белое
    };

    // Fallback: показываем тир в виде текста
    if (!iconPath || imageError) {
        return (
            <div
                className={`flex items-center justify-center bg-gray-800 border-2 ${getRarityColor(tier)} ${getRarityGlow(tier)} ${className}`}
                style={{ width: size, height: size }}
                title={getName(name)}
            >
                <span className="text-white font-bold text-xs">T{tier}</span>
            </div>
        );
    }

    return (
        <div
            className={`relative border-2 ${getRarityColor(tier)} ${getRarityGlow(tier)} ${className}`}
            style={{ width: size, height: size }}
            title={getName(name)}
        >
            <img
                src={iconPath}
                alt={getName(name)}
                className="w-full h-full object-contain"
                onError={() => setImageError(true)}
            />
            {/* Тир в углу */}
            <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[8px] font-bold px-1 rounded-tl">
                T{tier}
            </div>
        </div>
    );
};
