import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { BASE_COSTS, BASE_BUILD_TIMES, BASE_STORAGE_CAPACITY } from '../constants/playerBases';
import { RegionId, BaseType } from '../types';
import { t, TL } from '../services/localization';
import { formatCompactNumber } from '../services/gameMath';

interface BuildBaseModalProps {
    regionId: RegionId;
    onClose: () => void;
    onBuild: (baseType: BaseType) => void;
}

export const BuildBaseModal: React.FC<BuildBaseModalProps> = ({ regionId, onClose, onBuild }) => {
    const resources = useGameStore(s => s.resources);
    const lang = useGameStore(s => s.settings.language);

    const baseTypes: BaseType[] = ['outpost', 'camp', 'station'];

    const canAfford = (baseType: BaseType): boolean => {
        const cost = BASE_COSTS[baseType];

        // Проверка credits (rubies)
        if (resources.rubies < cost.credits) return false;

        // Проверка материалов
        for (const [resource, amount] of Object.entries(cost.materials)) {
            if ((resources[resource as keyof typeof resources] || 0) < (amount || 0)) {
                return false;
            }
        }

        return true;
    };

    const formatBuildTime = (ms: number): string => {
        if (ms === 0) return lang === 'RU' ? 'Мгновенно' : 'Instant';
        const minutes = Math.floor(ms / 60000);
        if (minutes < 60) return `${minutes} ${lang === 'RU' ? 'мин' : 'min'}`;
        const hours = Math.floor(minutes / 60);
        return `${hours} ${lang === 'RU' ? 'ч' : 'h'}`;
    };

    const getBaseFeatures = (baseType: BaseType): string[] => {
        const features: string[] = [];

        if (baseType === 'outpost') {
            features.push('📦 Storage only');
        }

        if (baseType === 'camp') {
            features.push('🔧 Workshop (Tier 1-5)');
            features.push('📦 Medium storage');
        }

        if (baseType === 'station') {
            features.push('🔧 Workshop (Tier 1-10)');
            features.push('💰 Market access');
            features.push('⛽ Fuel facilities');
            features.push('📦 Large storage');
        }

        return features;
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="w-full max-w-4xl bg-gray-900 border-2 border-cyan-500 rounded-lg p-4 md:p-6 max-h-[90vh] overflow-y-auto"
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl md:text-3xl font-black text-cyan-400 pixel-text">
                            🏗️ BUILD BASE
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white text-2xl font-bold transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Region info */}
                    <div className="mb-6 p-3 bg-gray-800/50 border border-gray-700 rounded">
                        <p className="text-sm text-gray-400">Region:</p>
                        <p className="text-lg font-bold text-white">{t(TL.regions[regionId], lang)}</p>
                    </div>

                    {/* Base type cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {baseTypes.map(baseType => {
                            const cost = BASE_COSTS[baseType];
                            const canBuild = canAfford(baseType);
                            const buildTime = BASE_BUILD_TIMES[baseType];
                            const storage = BASE_STORAGE_CAPACITY[baseType];
                            const features = getBaseFeatures(baseType);

                            return (
                                <div
                                    key={baseType}
                                    className={`border-2 rounded-lg p-4 transition-all ${canBuild
                                        ? 'border-cyan-500 bg-cyan-500/10 hover:bg-cyan-500/20'
                                        : 'border-gray-700 bg-gray-800/50 opacity-60'
                                        }`}
                                >
                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-white mb-2 capitalize">
                                        {baseType === 'outpost' && '🏕️ Outpost'}
                                        {baseType === 'camp' && '⛺ Camp'}
                                        {baseType === 'station' && '🏙️ Station'}
                                    </h3>

                                    {/* Build time */}
                                    <div className="mb-3 p-2 bg-black/30 rounded">
                                        <p className="text-xs text-gray-400">Build Time:</p>
                                        <p className="text-sm font-bold text-cyan-400">{formatBuildTime(buildTime)}</p>
                                    </div>

                                    {/* Storage */}
                                    <div className="mb-3 p-2 bg-black/30 rounded">
                                        <p className="text-xs text-gray-400">Storage Capacity:</p>
                                        <p className="text-sm font-bold text-green-400">{formatCompactNumber(storage)} kg</p>
                                    </div>

                                    {/* Features */}
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-400 mb-1">Features:</p>
                                        <ul className="space-y-1">
                                            {features.map((feature, idx) => (
                                                <li key={idx} className="text-xs text-gray-300">
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Cost */}
                                    <div className="mb-4 border-t border-gray-700 pt-3">
                                        <p className="text-xs text-gray-400 mb-2">Cost:</p>

                                        {/* Credits */}
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs text-gray-300">💎 Rubies</span>
                                            <span className={`text-sm font-bold ${resources.rubies >= cost.credits ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                {formatCompactNumber(resources.rubies)} / {formatCompactNumber(cost.credits)}
                                            </span>
                                        </div>

                                        {/* Materials */}
                                        {Object.entries(cost.materials).map(([resource, amount]) => (
                                            <div key={resource} className="flex justify-between items-center mb-1">
                                                <span className="text-xs text-gray-300 capitalize">{resource}</span>
                                                <span className={`text-sm font-bold ${(resources[resource as keyof typeof resources] || 0) >= (amount || 0)
                                                    ? 'text-green-400'
                                                    : 'text-red-400'
                                                    }`}>
                                                    {formatCompactNumber(resources[resource as keyof typeof resources] || 0)} / {formatCompactNumber(amount || 0)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Build button */}
                                    <button
                                        onClick={() => canBuild && onBuild(baseType)}
                                        disabled={!canBuild}
                                        className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${canBuild
                                            ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        {canBuild ? `🏗️ BUILD ${baseType.toUpperCase()}` : '❌ INSUFFICIENT RESOURCES'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Help text */}
                    <div className="mt-6 p-3 bg-blue-900/20 border border-blue-700 rounded">
                        <p className="text-xs text-blue-300">
                            💡 <strong>Tip:</strong> Each region can only have ONE base. Choose wisely!
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
