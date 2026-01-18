
import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Resources } from '../../types';
import { getResourceLabel, formatCompactNumber } from '../../services/gameMath';
import { t, TEXT_IDS } from '../../services/localization';

const COMMON_RESOURCES: (keyof Resources)[] = ['clay', 'stone', 'copper', 'iron', 'silver', 'gold'];
const RARE_RESOURCES: (keyof Resources)[] = ['titanium', 'uranium', 'nanoSwarm', 'ancientTech', 'rubies', 'emeralds', 'diamonds'];

const ResourceItem: React.FC<{ name: string; amount: number; label: string; color?: string; compact?: boolean }> = ({ amount, label, color, compact }) => (
    <div
        className={`flex flex-col items-center justify-center border-zinc-900 ${compact ? 'border-b py-2' : 'border-r px-1 py-1 min-w-[45px]'} bg-black/40 backdrop-blur-sm cursor-help hover:bg-zinc-900 transition-colors`}
        title={`${label}: ${amount.toLocaleString()}`}
        onClick={() => alert(`${label}: ${amount.toLocaleString()}`)}
    >
        <span className={`text-[6px] uppercase font-black truncate w-full text-center mb-0.5 ${color || 'text-zinc-500'}`}>{label}</span>
        <span className="text-[10px] font-black text-white font-mono tracking-tighter">{formatCompactNumber(amount)}</span>
    </div>
);

interface GameHeaderProps {
    onOpenMenu: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ onOpenMenu }) => {
    const resources = useGameStore(s => s.resources);
    const lang = useGameStore(s => s.settings.language);
    const [isRareMenuOpen, setIsRareMenuOpen] = useState(false);

    return (
        <div className="flex bg-zinc-950 border-b border-zinc-800 shrink-0 h-10 relative pointer-events-auto z-50">
            {/* LEFT: COMMON RESOURCES */}
            <div className="flex-1 flex overflow-x-auto scrollbar-hide touch-pan-x">
                {COMMON_RESOURCES.map(key => resources[key] > 0 ? (
                    <ResourceItem key={key} name={key} amount={resources[key]} label={t(getResourceLabel(key), lang)} />
                ) : null)}
            </div>

            {/* RIGHT: ACTION GROUP */}
            <div className="flex items-stretch border-l border-zinc-800">
                {/* RARE TOGGLE */}
                <button
                    onClick={() => setIsRareMenuOpen(!isRareMenuOpen)}
                    className={`w-12 flex flex-col items-center justify-center border-r border-zinc-800 hover:bg-zinc-900 transition-colors ${isRareMenuOpen ? 'bg-zinc-900 text-cyan-400' : 'text-zinc-500'}`}
                >
                    <span className="text-sm">💎</span>
                </button>

                {/* MENU TOGGLE (HAMBURGER) */}
                <button
                    onClick={onOpenMenu}
                    className="w-12 flex flex-col items-center justify-center hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
                >
                    <div className="space-y-1">
                        <div className="w-5 h-0.5 bg-current"></div>
                        <div className="w-5 h-0.5 bg-current"></div>
                        <div className="w-5 h-0.5 bg-current"></div>
                    </div>
                </button>
            </div>

            {/* DROPDOWN: RARE RESOURCES */}
            {isRareMenuOpen && (
                <div className="absolute top-full right-0 w-48 bg-zinc-900/95 border border-zinc-700 shadow-2xl z-[60] backdrop-blur animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-[9px] font-bold text-zinc-500 py-1 px-2 text-center uppercase tracking-widest border-b border-zinc-800 bg-black/50">
                        {t(TEXT_IDS.HEADER_RARE_RESOURCES, lang)}
                    </h4>
                    <div className="max-h-[60vh] overflow-y-auto">
                        {RARE_RESOURCES.map(key => (
                            <div
                                key={key}
                                className="flex justify-between items-center px-3 py-2 border-b border-zinc-800/50 hover:bg-white/5 cursor-help"
                                title={`${t(getResourceLabel(key), lang)}: ${resources[key].toLocaleString()}`}
                            >
                                <span className="text-[10px] font-mono text-zinc-400">{t(getResourceLabel(key), lang)}</span>
                                <span className={`text-xs font-mono font-bold ${['rubies', 'emeralds', 'diamonds'].includes(key) ? 'text-purple-400' : 'text-cyan-400'}`}>
                                    {formatCompactNumber(resources[key])}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameHeader;
