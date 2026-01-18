
import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { t } from '../../services/localization';
import { ActiveEffect } from '../../types';

const EffectBadge: React.FC<{ effect: ActiveEffect; lang: 'RU' | 'EN' }> = ({ effect, lang }) => {
    // Convert ticks to seconds (10 ticks = 1 sec)
    const secondsLeft = Math.ceil(effect.duration / 10);

    let bg = 'bg-zinc-800';
    let text = 'text-zinc-300';
    let border = 'border-zinc-600';

    switch (effect.type) {
        case 'BUFF':
            bg = 'bg-green-950/80';
            text = 'text-green-400';
            border = 'border-green-700';
            break;
        case 'DEBUFF':
            bg = 'bg-red-950/80';
            text = 'text-red-400';
            border = 'border-red-700';
            break;
        case 'ANOMALY':
            bg = 'bg-purple-950/80';
            text = 'text-purple-400';
            border = 'border-purple-700';
            break;
    }

    return (
        <div className={`flex items-center gap-2 px-2 py-0.5 rounded-sm border ${bg} ${border} animate-in fade-in zoom-in duration-300`}>
            <span className={`text-[10px] font-bold ${text}`}>{t(effect.name, lang)}</span>
            <span className="text-[10px] font-mono text-white/80">{secondsLeft}s</span>
        </div>
    );
};

const ActiveEffects: React.FC = () => {
    const effects = useGameStore(s => s.activeEffects);
    const lang = useGameStore(s => s.settings.language);

    if (effects.length === 0) return null;

    return (
        <div className="w-full flex flex-wrap gap-1 px-2 py-1 bg-transparent pointer-events-none z-30 justify-center">
            {effects.map(effect => (
                <EffectBadge key={effect.id} effect={effect} lang={lang} />
            ))}
        </div>
    );
};

export default ActiveEffects;
