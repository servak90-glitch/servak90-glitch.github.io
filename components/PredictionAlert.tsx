import React, { useEffect, useState } from 'react';
import {
    AlertCircle,
    Search,
    Zap,
    Fuel,
    Sparkles,
    Activity,
    Clock,
    Terminal,
    Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PredictionAlertProps {
    eventTitle: string;
    eventType: string;
    timeRemaining: number;
    detailLevel: 'BASIC' | 'MEDIUM' | 'FULL';
    onDismiss: () => void;
}

export const PredictionAlert: React.FC<PredictionAlertProps> = ({
    eventTitle,
    eventType,
    timeRemaining,
    detailLevel,
    onDismiss
}) => {
    const [countdown, setCountdown] = useState(timeRemaining);

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onDismiss();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [onDismiss]);

    const getEventConfig = () => {
        if (eventType.includes('raid')) return { icon: <Activity className="text-rose-400" />, color: 'rose', label: 'COMBAT_LINK' };
        if (eventType.includes('discovery')) return { icon: <Search className="text-cyan-400" />, color: 'cyan', label: 'ANOMALY_SCAN' };
        if (eventType.includes('hazard')) return { icon: <AlertCircle className="text-amber-400" />, color: 'amber', label: 'HAZARD_DETECT' };
        if (eventType.includes('fuel')) return { icon: <Fuel className="text-orange-400" />, color: 'orange', label: 'MAT_CONVERSION' };
        if (eventType.includes('artifact')) return { icon: <Sparkles className="text-purple-400" />, color: 'purple', label: 'XENO_SIGNAL' };
        return { icon: <Target className="text-zinc-400" />, color: 'zinc', label: 'SYS_ALERT' };
    };

    const config = getEventConfig();
    const progress = (countdown / timeRemaining) * 100;

    return (
        <motion.div
            initial={{ y: -50, opacity: 0, x: '-50%' }}
            animate={{ y: 0, opacity: 1, x: '-50%' }}
            exit={{ y: -20, opacity: 0, x: '-50%' }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[60] pointer-events-auto w-full max-w-sm"
        >
            <div className={`
                glass-panel p-4 border-l-4 relative overflow-hidden shadow-2xl
                ${config.color === 'rose' ? 'border-rose-500 bg-rose-500/5' :
                    config.color === 'cyan' ? 'border-cyan-500 bg-cyan-500/5' :
                        config.color === 'amber' ? 'border-amber-500 bg-amber-500/5' :
                            config.color === 'purple' ? 'border-purple-500 bg-purple-500/5' :
                                'border-zinc-500 bg-zinc-500/5'}
            `}>
                {/* Background Shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-shimmer" />

                <div className="flex items-start gap-4 h-full relative z-10">
                    <div className="p-3 glass-panel border-inherit bg-inherit backdrop-blur-3xl shrink-0">
                        {config.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                            <span className={`text-[9px] font-black font-technical uppercase tracking-[0.2em] opacity-60`}>
                                {config.label} // LVL_{detailLevel}
                            </span>
                            <div className="flex items-center gap-1.5 text-white/40">
                                <Clock className="w-3 h-3" />
                                <span className="text-[10px] font-black font-technical font-mono">{countdown}S</span>
                            </div>
                        </div>

                        <div className="mb-3">
                            <h4 className="text-white font-black font-technical text-sm uppercase tracking-tight truncate">
                                {detailLevel === 'BASIC' ? 'SYS_PREDICTION_PENDING' : eventTitle}
                            </h4>
                            {detailLevel === 'FULL' && (
                                <p className="text-[10px] text-white/40 font-technical uppercase mt-1">
                                    Entity_Signature: <span className="text-inherit opacity-100">{eventType}</span>
                                </p>
                            )}
                        </div>

                        {/* Progress Tracker */}
                        <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${config.color === 'rose' ? 'bg-rose-500' : 'bg-cyan-500'}`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Deco */}
                <div className="flex justify-between mt-3 opacity-20">
                    <div className="flex gap-1">
                        <div className="w-1 h-1 bg-white" />
                        <div className="w-4 h-1 bg-white" />
                    </div>
                    <Terminal className="w-3 h-3 text-white" />
                </div>
            </div>
        </motion.div>
    );
};
