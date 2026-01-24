import React, { useRef, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { View } from '../../types';
import { t, TEXT_IDS } from '../../services/localization';
import {
    Pickaxe,
    Landmark,
    Map as MapIcon,
    Hammer,
    Zap,
    Library,
    Terminal,
    ChevronRight
} from 'lucide-react';

interface GameFooterProps {
    logs: {
        msg: string;
        color?: string;
        icon?: string;
        detail?: string;
        timestamp?: string;
    }[];
}

const GameFooter: React.FC<GameFooterProps> = ({ logs }) => {
    const activeView = useGameStore(s => s.activeView);
    const setView = useGameStore(s => s.setView);
    const currentBoss = useGameStore(s => s.currentBoss);
    const lang = useGameStore(s => s.settings.language);

    const forgeUnlocked = useGameStore(s => s.forgeUnlocked);
    const skillsUnlocked = useGameStore(s => s.skillsUnlocked);
    const cityUnlocked = useGameStore(s => s.cityUnlocked);

    const consoleEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeView === View.DRILL || activeView === View.COMBAT) {
            consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, activeView]);

    const navButtons = [
        { id: View.DRILL, label: t(TEXT_IDS.MENU_DRILL, lang), icon: <Pickaxe className="w-4.5 h-4.5" /> },
        ...(cityUnlocked ? [{ id: View.CITY, label: t(TEXT_IDS.MENU_CITY, lang), icon: <Landmark className="w-4.5 h-4.5" /> }] : []),
        ...(cityUnlocked ? [{ id: View.GLOBAL_MAP, label: t(TEXT_IDS.MENU_MAP, lang), icon: <MapIcon className="w-4.5 h-4.5" /> }] : []),
        ...(forgeUnlocked ? [{ id: View.FORGE, label: t(TEXT_IDS.MENU_FORGE, lang), icon: <Hammer className="w-4.5 h-4.5" /> }] : []),
        ...(skillsUnlocked ? [{ id: View.SKILLS, label: t(TEXT_IDS.MENU_SKILLS, lang), icon: <Zap className="w-4.5 h-4.5" /> }] : []),
        { id: View.CODEX, label: t(TEXT_IDS.MENU_ARCHIVE, lang), icon: <Library className="w-4.5 h-4.5" /> }
    ];

    return (
        <div className="flex flex-col shrink-0 z-30 transition-all duration-300 pointer-events-auto">
            {/* LOG CONSOLE (Terminal Style) */}
            {(activeView === View.DRILL || activeView === View.COMBAT) && (
                <div className="h-28 md:h-52 glass-panel border-x-0 border-b-0 rounded-none bg-black/60 p-3 font-mono text-[10px] md:text-[11px] overflow-y-auto scrollbar-hide space-y-2 relative touch-pan-y overscroll-contain">
                    <div className="flex items-center gap-2 mb-3 opacity-30 border-b border-white/5 pb-1">
                        <Terminal className="w-3 h-3" />
                        <span className="text-[9px] uppercase tracking-[0.2em] font-technical">System_Event_Log_Stream</span>
                    </div>
                    {logs.map((log, i) => (
                        <div key={i} className={`flex items-start gap-3 ${log.color || 'text-white/60'} border-l border-white/5 pl-3 py-1 animate-in fade-in slide-in-from-right-4 duration-300`}>
                            {/* Timestamp */}
                            <span className="text-[9px] font-technical opacity-20 shrink-0 select-none font-bold">[{log.timestamp}]</span>

                            {/* Content */}
                            <div className="flex flex-col flex-1">
                                <div className="flex items-center gap-2">
                                    {log.icon && <span className="opacity-50 text-[12px]">{log.icon}</span>}
                                    <span className="leading-tight font-technical tracking-wide">{log.msg}</span>
                                </div>
                                {log.detail && (
                                    <div className="flex items-center gap-1.5 mt-1 text-[9px] text-white/30 italic font-technical">
                                        <ChevronRight className="w-2.5 h-2.5 opacity-20" />
                                        <span>{log.detail}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={consoleEndRef} />
                </div>
            )}

            {/* NAVIGATION BAR */}
            <div className="h-16 md:h-16 glass-panel border-x-0 border-b-0 rounded-none bg-void/80 flex items-stretch">
                {navButtons.map(btn => (
                    <button
                        key={btn.id}
                        disabled={!!currentBoss}
                        onClick={() => !currentBoss && setView(btn.id as View)}
                        className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all border-r border-white/5 last:border-0 relative group
                            ${activeView === btn.id ? 'bg-white/5 text-cyan-400' : 'text-white/30 hover:text-white/60 hover:bg-white/[0.02]'} 
                            ${currentBoss ? 'opacity-20 cursor-not-allowed' : 'active:scale-95'}
                        `}
                    >
                        <div className={`transition-transform duration-300 ${activeView === btn.id ? 'md:scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'group-hover:scale-105'} [&>svg]:w-5 [&>svg]:h-5 md:[&>svg]:w-4.5 md:[&>svg]:h-4.5`}>
                            {btn.icon}
                        </div>
                        <span className="hidden sm:block text-[9px] font-bold font-technical uppercase tracking-widest text-center px-1">
                            {btn.label}
                        </span>

                        {activeView === btn.id && (
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default GameFooter;
