import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ResourceType } from '../../types';
import { getResourceLabel, formatCompactNumber } from '../../services/gameMath';
import { t, TEXT_IDS } from '../../services/localization';
import {
    Menu,
    Diamond,
    Settings2,
    Box,
    ChevronDown,
    Activity,
    Gem,
    Coins
} from 'lucide-react';

const COMMON_RESOURCES: ResourceType[] = [
    ResourceType.CLAY, ResourceType.STONE, ResourceType.COPPER,
    ResourceType.IRON, ResourceType.SILVER, ResourceType.GOLD
];
const RARE_RESOURCES: ResourceType[] = [
    ResourceType.TITANIUM, ResourceType.URANIUM, ResourceType.NANO_SWARM,
    ResourceType.ANCIENT_TECH, ResourceType.RUBIES, ResourceType.EMERALDS,
    ResourceType.DIAMONDS
];

const ResourceItem: React.FC<{ name: string; amount: number; label: React.ReactNode }> = ({ amount, label }) => (
    <div
        className="flex flex-col items-center justify-center border-r border-white/5 bg-white/5 backdrop-blur-md px-3 min-w-[56px] transition-colors hover:bg-white/10 group cursor-help"
    >
        <div className="text-[10px] text-white/30 group-hover:text-white/50 transition-colors mb-0.5">
            {label}
        </div>
        <span className="text-[11px] font-bold font-technical text-white tracking-tighter">
            {formatCompactNumber(amount)}
        </span>
    </div>
);

interface GameHeaderProps {
    onOpenMenu: () => void;
    onOpenInventory?: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ onOpenMenu, onOpenInventory }) => {
    const resources = useGameStore(s => s.resources);
    const lang = useGameStore(s => s.settings.language);
    const [isRareMenuOpen, setIsRareMenuOpen] = useState(false);

    return (
        <div className="flex glass-panel border-x-0 border-t-0 rounded-none shrink-0 h-11 relative z-[100] bg-black/40 pointer-events-auto">
            {/* LEFT: COMMON RESOURCES (Prioritize Credits on mobile) */}
            <div className="flex-1 flex overflow-x-auto scrollbar-hide touch-pan-x items-center">
                <div className="px-2 md:px-3 flex items-center border-r border-white/5 h-full bg-white/5">
                    <Activity className="w-3 md:w-4 h-3 md:h-4 text-cyan-400 opacity-60" />
                </div>

                {/* Always show Credits if > 0 */}
                <ResourceItem name={ResourceType.CREDITS} amount={resources.credits} label={<Coins className="w-3 h-3" />} />

                {/* Hide other common resources on extra small screens, show on md+ */}
                <div className="hidden sm:flex items-stretch h-full">
                    {COMMON_RESOURCES.map(key => resources[key] > 0 ? (
                        <ResourceItem key={key} name={key} amount={resources[key]} label={t(getResourceLabel(key), lang)} />
                    ) : null)}
                </div>
            </div>

            {/* RIGHT: ACTION GROUP */}
            <div className="flex items-stretch border-l border-white/5">
                {/* RARE TOGGLE */}
                <button
                    onClick={() => setIsRareMenuOpen(!isRareMenuOpen)}
                    className={`w-12 flex flex-col items-center justify-center border-r border-white/5 transition-all
                        ${isRareMenuOpen ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}
                    `}
                    title="Rare Resources"
                >
                    <Gem className="w-4 h-4" />
                    <ChevronDown className={`w-2.5 h-2.5 mt-0.5 transition-transform ${isRareMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* EQUIPMENT INVENTORY */}
                {onOpenInventory && (
                    <button
                        onClick={onOpenInventory}
                        className="w-12 flex items-center justify-center border-r border-white/5 text-white/40 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                        title="Storage (I)"
                    >
                        <Box className="w-4.5 h-4.5" />
                    </button>
                )}

                {/* MENU TOGGLE */}
                <button
                    onClick={onOpenMenu}
                    className="w-12 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            {/* DROPDOWN: RARE & ALL RESOURCES */}
            {isRareMenuOpen && (
                <>
                    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm" onClick={() => setIsRareMenuOpen(false)} />
                    <div className="fixed md:absolute top-0 md:top-full left-0 md:left-auto right-0 bottom-0 md:bottom-auto md:w-72 glass-panel md:mt-2 p-4 md:p-1 border-white/10 shadow-2xl z-[120] animate-in fade-in zoom-in-95 md:slide-in-from-top-2 duration-300 flex flex-col">
                        <div className="px-3 py-4 md:py-2 border-b border-white/5 flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Diamond className="w-4 md:w-3 h-4 md:h-3 text-cyan-400" />
                                <h4 className="text-xs md:text-[9px] font-black md:font-bold text-white uppercase tracking-[0.2em] font-technical">
                                    {t(TEXT_IDS.HEADER_RARE_RESOURCES, lang)}
                                </h4>
                            </div>
                            <button onClick={() => setIsRareMenuOpen(false)} className="md:hidden p-2 text-white/40"><Box className="w-6 h-6 rotate-45" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto scrollbar-hide py-1 space-y-1">
                            {/* Show basic resources in menu on mobile */}
                            <div className="sm:hidden mb-4 space-y-1">
                                <div className="px-3 py-1 text-[8px] text-zinc-600 font-black uppercase tracking-widest">Base Assets</div>
                                {COMMON_RESOURCES.map(key => (
                                    <div key={key} className="flex justify-between items-center px-4 py-3 bg-white/[0.02] rounded-sm">
                                        <span className="text-xs font-technical text-white/40 uppercase tracking-tighter">{t(getResourceLabel(key), lang)}</span>
                                        <span className="text-sm font-technical font-bold text-white">{resources[key].toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="px-3 py-1 text-[8px] text-zinc-600 font-black uppercase tracking-widest">Rare Assets</div>
                            {RARE_RESOURCES.map(key => (
                                <div
                                    key={key}
                                    className="flex justify-between items-center px-4 py-3 md:py-2 hover:bg-white/5 transition-colors cursor-help rounded-sm group"
                                    title={`${t(getResourceLabel(key), lang)}: ${resources[key].toLocaleString()}`}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-[11px] md:text-[10px] font-technical text-white/40 group-hover:text-white/60 uppercase tracking-tighter">
                                            {t(getResourceLabel(key), lang)}
                                        </span>
                                    </div>
                                    <span className={`text-base md:text-[11px] font-technical font-bold ${['rubies', 'emeralds', 'diamonds'].includes(key) ? 'neon-text-purple' : 'text-cyan-400'}`}>
                                        {formatCompactNumber(resources[key])}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setIsRareMenuOpen(false)}
                            className="mt-4 md:hidden w-full py-4 bg-white text-black font-black uppercase tracking-[0.3em] text-xs"
                        >
                            Close Terminal
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default GameHeader;
