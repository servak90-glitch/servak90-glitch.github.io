import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { BASE_COSTS, BASE_BUILD_TIMES, BASE_STORAGE_CAPACITY } from '../constants/playerBases';
import { RegionId, BaseType } from '../types';
import { t, TL } from '../services/localization';
import { formatCompactNumber } from '../services/gameMath';
import {
    X,
    Construction,
    Zap,
    Package,
    Hammer,
    Lock,
    AlertTriangle,
    CheckCircle2,
    Database,
    Cpu,
    MonitorDot,
    Compass,
    Factory
} from 'lucide-react';

interface BuildBaseModalProps {
    regionId: RegionId;
    onClose: () => void;
    onBuild: (baseType: BaseType) => void;
}

export const BuildBaseModal: React.FC<BuildBaseModalProps> = ({ regionId, onClose, onBuild }) => {
    const resources = useGameStore(s => s.resources);
    const lang = useGameStore(s => s.settings.language);

    const baseTypes: BaseType[] = ['outpost'];

    const canAfford = (baseType: BaseType): boolean => {
        const cost = BASE_COSTS[baseType];
        if (resources.credits < cost.credits) return false;
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
        if (minutes < 60) return `${minutes} ${lang === 'RU' ? 'МИН' : 'MIN'}`;
        const hours = Math.floor(minutes / 60);
        return `${hours} ${lang === 'RU' ? 'Ч' : 'H'}`;
    };

    const getBaseFeatures = (baseType: BaseType): string[] => {
        const features: string[] = [];
        if (baseType === 'outpost') {
            features.push(lang === 'RU' ? '📦 Базовое хранилище' : '📦 Base Storage');
        }
        if (baseType === 'camp') {
            features.push(lang === 'RU' ? '🔧 Мастерская (Тир 1-5)' : '🔧 Workshop (Tier 1-5)');
            features.push(lang === 'RU' ? '📦 Среднее хранилище' : '📦 Medium storage');
        }
        if (baseType === 'station') {
            features.push(lang === 'RU' ? '🔧 Мастерская (Тир 1-10)' : '🔧 Workshop (Tier 1-10)');
            features.push(lang === 'RU' ? '💰 Доступ к рынку' : '💰 Market access');
            features.push(lang === 'RU' ? '⛽ Заправка' : '⛽ Fuel facilities');
            features.push(lang === 'RU' ? '📦 Большое хранилище' : '📦 Large storage');
        }
        return features;
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[120] flex items-center justify-center bg-void/80 backdrop-blur-xl p-6"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <div className="absolute inset-0 mesh-bg opacity-20 pointer-events-none" />

                <motion.div
                    className="w-full max-w-4xl glass-panel border-cyan-500/30 bg-black/60 overflow-hidden relative font-technical flex flex-col shadow-[0_0_100px_rgba(34,211,238,0.1)]"
                    initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Hub */}
                    <div className="p-8 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                        <div className="flex items-center gap-6">
                            <div className="p-3 glass-panel border-cyan-500/40 bg-cyan-500/10 text-cyan-400">
                                <Construction className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-1">
                                    {t(TL.ui.build_base_title, lang)}
                                </h2>
                                <div className="flex items-center gap-3">
                                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Sector_Deployment // {t(TL.regions[regionId], lang)}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 glass-panel border-white/10 hover:border-white/40 text-white/40 hover:text-white transition-all group">
                            <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                        </button>
                    </div>

                    <div className="p-10 flex flex-col gap-10">
                        {/* Blueprint Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {baseTypes.map(baseType => {
                                const cost = BASE_COSTS[baseType];
                                const canBuild = canAfford(baseType);
                                const buildTime = BASE_BUILD_TIMES[baseType];
                                const storage = BASE_STORAGE_CAPACITY[baseType];
                                const features = getBaseFeatures(baseType);

                                return (
                                    <div
                                        key={baseType}
                                        className={`glass-panel p-8 border-2 transition-all flex flex-col gap-6 relative group overflow-hidden
                                            ${canBuild ? 'border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-400' : 'border-white/5 bg-white/5 opacity-40grayscale'}
                                        `}
                                    >
                                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Factory className="w-24 h-24" />
                                        </div>

                                        <div className="space-y-1 relative z-10">
                                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">
                                                {baseType.toUpperCase()}
                                            </h3>
                                            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">CLASS_01_DEPLOYMENT</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 relative z-10">
                                            <div className="p-3 glass-panel border-white/5 bg-black/40 space-y-1">
                                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Build_Cycle</span>
                                                <div className="text-xs font-black text-cyan-400">{formatBuildTime(buildTime)}</div>
                                            </div>
                                            <div className="p-3 glass-panel border-white/5 bg-black/40 space-y-1">
                                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Payload_Cap</span>
                                                <div className="text-xs font-black text-emerald-400">{formatCompactNumber(storage)} KG</div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 relative z-10">
                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] italic">Authorized_Modules</span>
                                            <div className="space-y-2">
                                                {features.map((feature, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-[9px] font-black uppercase text-white/60 tracking-wider">
                                                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                                                        {feature.replace(/📦|🔧|💰|⛽/, '').trim()}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-white/5 relative z-10">
                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] italic">Req_Resources</span>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center px-1">
                                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none">Credits (CR)</span>
                                                    <span className={`text-[10px] font-black ${resources.credits >= cost.credits ? 'text-white' : 'text-rose-500'}`}>
                                                        {cost.credits.toLocaleString()}
                                                    </span>
                                                </div>
                                                {Object.entries(cost.materials).map(([resource, amount]) => (
                                                    <div key={resource} className="flex justify-between items-center px-1">
                                                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none">{t(resource, lang)}</span>
                                                        <span className={`text-[10px] font-black ${(resources[resource as keyof typeof resources] || 0) >= (amount || 0) ? 'text-white' : 'text-rose-500'}`}>
                                                            {amount}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => canBuild && onBuild(baseType)}
                                            disabled={!canBuild}
                                            className={`w-full py-5 font-black uppercase text-xs tracking-[0.4em] italic shadow-[0_0_30px_rgba(34,211,238,0.1)] transition-all relative overflow-hidden group/btn
                                                ${canBuild ? 'bg-cyan-500 text-black hover:bg-cyan-400' : 'bg-white/5 text-white/10 cursor-not-allowed border border-white/5'}
                                            `}
                                        >
                                            {canBuild ? 'Establish_Sector' : 'Insufficient_Payload'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Telemetry Log */}
                        <div className="bg-black/40 border border-white/5 p-6 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="p-3 glass-panel border-cyan-500/20 bg-cyan-500/5 text-cyan-400">
                                    <MonitorDot className="w-5 h-5 animate-pulse" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">Sector_Guidelines</span>
                                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest italic">{t(TL.ui.one_base_per_region, lang)}</p>
                                </div>
                            </div>
                            <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">Auth_Status: Ready_For_Payload</div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
