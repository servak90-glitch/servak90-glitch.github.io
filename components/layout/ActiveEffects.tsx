import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../store/gameStore';
import { t } from '../../services/localization';
import { ActiveEffect } from '../../types';
import {
    Zap,
    ShieldAlert,
    Sparkles,
    Clock,
    Radiation,
    Activity
} from 'lucide-react';

const EffectBadge: React.FC<{ effect: ActiveEffect; lang: 'RU' | 'EN' }> = ({ effect, lang }) => {
    const secondsLeft = Math.ceil(effect.duration / 10);

    let Icon = Sparkles;
    let colorClass = 'text-emerald-400';
    let bgClass = 'bg-emerald-500/10';
    let borderClass = 'border-emerald-500/30';
    let glowClass = 'shadow-[0_0_10px_rgba(16,185,129,0.2)]';

    switch (effect.type) {
        case 'BUFF':
            Icon = Zap;
            colorClass = 'text-cyan-400';
            bgClass = 'bg-cyan-500/10';
            borderClass = 'border-cyan-500/30';
            glowClass = 'shadow-[0_0_10px_rgba(34,211,238,0.2)]';
            break;
        case 'DEBUFF':
            Icon = ShieldAlert;
            colorClass = 'text-rose-400';
            bgClass = 'bg-rose-500/10';
            borderClass = 'border-rose-500/30';
            glowClass = 'shadow-[0_0_10px_rgba(244,63,94,0.2)]';
            break;
        case 'ANOMALY':
            Icon = Radiation;
            colorClass = 'text-purple-400';
            bgClass = 'bg-purple-500/10';
            borderClass = 'border-purple-500/30';
            glowClass = 'shadow-[0_0_10px_rgba(168,85,247,0.2)]';
            break;
    }

    return (
        <div className={`flex items-center gap-2 px-3 py-1 glass-panel border ${borderClass} ${bgClass} ${glowClass} animate-in fade-in zoom-in duration-300 group`}>
            <div className={`transition-transform duration-300 group-hover:scale-110 ${colorClass}`}>
                <Icon className="w-3 h-3" />
            </div>
            <div className="flex flex-col">
                <span className={`text-[9px] font-black font-technical uppercase tracking-wider leading-none ${colorClass}`}>
                    {t(effect.name, lang)}
                </span>
            </div>
            <div className="flex items-center gap-1 ml-1 pl-2 border-l border-white/10">
                <Clock className="w-2.5 h-2.5 text-white/30" />
                <span className="text-[10px] font-bold font-technical text-white/60 tracking-tighter">
                    {secondsLeft}s
                </span>
            </div>
        </div>
    );
};

const ActiveEffects: React.FC = () => {
    const { effects, lang } = useGameStore(useShallow(s => ({
        effects: s.activeEffects,
        lang: s.settings.language
    })));

    if (effects.length === 0) return null;

    return (
        <div className="w-full flex flex-wrap gap-2 px-4 py-2 bg-transparent pointer-events-none z-30 justify-center">
            {effects.map(effect => (
                <EffectBadge key={effect.id} effect={effect} lang={lang} />
            ))}
        </div>
    );
};

export default ActiveEffects;
