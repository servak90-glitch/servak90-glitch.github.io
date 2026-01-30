/**
 * CraftingJobCard - отображение задания в очереди крафта
 * Показывает прогресс, оставшееся время, кнопки действий
 */

import React, { useState, useEffect } from 'react';
import { CraftingJob } from '../../types';
import { getPartDefinition } from '../../store/slices/craftSlice';
import { t, TL } from '../../services/localization';
import { useGameStore } from '../../store/gameStore';
import {
    Clock,
    CheckCircle2,
    XCircle,
    Package,
    Loader2
} from 'lucide-react';

interface CraftingJobCardProps {
    job: CraftingJob;
    onCollect: () => void;
    onCancel: () => void;
}

export const CraftingJobCard: React.FC<CraftingJobCardProps> = ({ job, onCollect, onCancel }) => {
    const [now, setNow] = useState(Date.now());
    const lang = useGameStore(s => s.settings.language);

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const remaining = Math.max(0, job.completionTime - now);
    const totalTime = job.completionTime - job.startTime;
    const progress = totalTime > 0 ? Math.min(1, 1 - (remaining / totalTime)) : 1;

    const remainingMin = Math.floor(remaining / 60000);
    const remainingSec = Math.floor((remaining % 60000) / 1000);
    const timeStr = `${remainingMin}:${remainingSec.toString().padStart(2, '0')}`;

    const partDef = getPartDefinition(job.partId);
    const displayName = partDef ? t(partDef.name, lang) : job.partId;

    const isReady = job.status === 'ready_to_collect';

    return (
        <div className={`glass-panel p-4 transition-all duration-300 relative overflow-hidden
            ${isReady ? 'border-green-500/50 bg-green-500/5' : 'border-cyan-500/20 bg-white/5'}
        `}>
            {/* Background shimmers/glows */}
            {!isReady && (
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent animate-shimmer" />
            )}

            <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] md:text-xs font-technical text-white/40 uppercase tracking-tighter">
                            {t(TL.ui[`tab${job.slotType.charAt(0) + job.slotType.slice(1).toLowerCase() as any}` as any] || TL.ui.module_label, lang)}
                        </span>
                        {isReady ? (
                            <CheckCircle2 className="w-3 h-3 text-green-400 animate-pulse" />
                        ) : (
                            <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
                        )}
                    </div>
                    <span className="text-white font-bold font-technical text-sm md:text-base tracking-wide">{displayName.toUpperCase()}</span>
                </div>

                <div className="flex items-center gap-1.5 glass-panel py-1 px-2 border-white/5 bg-black/40">
                    <Clock className="w-3 h-3 text-white/40" />
                    <span className={`text-xs md:text-sm font-technical font-bold ${isReady ? 'text-green-400' : 'text-cyan-400'}`}>
                        {isReady ? t(TL.ui.ready, lang) : timeStr}
                    </span>
                </div>
            </div>

            {/* Progress Area */}
            <div className="mb-4">
                <div className="flex justify-between text-[9px] md:text-xs font-technical text-white/30 uppercase mb-1">
                    <span>{t(TL.ui.assemblyState, lang)}</span>
                    <span>{Math.round(progress * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
                    <div
                        className={`h-full transition-all duration-1000 ease-out relative ${isReady ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                            }`}
                        style={{ width: `${progress * 100}%` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                {isReady ? (
                    <button
                        onClick={onCollect}
                        className="flex-1 bg-green-500/10 border border-green-500/50 hover:bg-green-500 hover:text-black py-2 rounded font-bold font-technical text-[10px] md:text-xs tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Package className="w-3.5 h-3.5" />
                        {t(TL.ui.collectItem, lang)}
                    </button>
                ) : (
                    <button
                        onClick={onCancel}
                        className="flex-1 bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 py-2 rounded font-technical text-[10px] md:text-xs tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 group/cancel"
                    >
                        <XCircle className="w-3.5 h-3.5 text-white/20 group-hover/cancel:text-red-400" />
                        {t(TL.ui.abortOperation, lang)}
                    </button>
                )}
            </div>
        </div>
    );
};
