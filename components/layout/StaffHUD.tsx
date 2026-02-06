
import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { OPERATORS, CREW_MEMBERS } from '../../constants/rpg';
import { t } from '../../services/localization';
import { motion, AnimatePresence } from 'framer-motion';

export const StaffHUD: React.FC = () => {
    const { operatorId, hiredCrewIds, settings } = useGameStore();
    const lang = settings.language;

    const operator = OPERATORS.find(o => o.id === operatorId);
    const hiredCrew = CREW_MEMBERS.filter(c => hiredCrewIds.includes(c.id));

    if (!operator && hiredCrew.length === 0) return null;

    return (
        <div className="fixed top-24 left-4 z-40 flex flex-col gap-3 pointer-events-auto">
            {/* Header / Label */}
            <div className="flex items-center gap-2 mb-1">
                <div className="h-px w-4 bg-cyan-500/50" />
                <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] font-technical">Mission Staff</span>
            </div>

            <div className="flex flex-col gap-2">
                {/* Operator */}
                <AnimatePresence mode="popLayout">
                    {operator && (
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="group relative"
                        >
                            <div className="w-12 h-12 border border-cyan-500/30 bg-black/40 p-0.5 overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:border-cyan-400 group-hover:scale-105 transition-all">
                                <img
                                    src={operator.portraitPath}
                                    className="w-full h-full object-cover filter brightness-90 group-hover:brightness-100 transition-all"
                                    alt={t(operator.name, lang)}
                                />
                                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-cyan-900/40 to-transparent" />
                                <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-500 border-l border-b border-black" />
                            </div>

                            {/* Hover Tooltip */}
                            <div className="absolute left-14 top-0 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                                <div className="glass-panel p-2.5 min-w-[140px] border-cyan-500/30 bg-black/90 shadow-2xl">
                                    <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest border-b border-cyan-500/20 pb-1 mb-1.5 flex items-center justify-between">
                                        {t(operator.name, lang)}
                                        <span className="text-[8px] text-white/30 lowercase font-mono">operator</span>
                                    </div>
                                    <div className="text-[9px] text-zinc-300 font-medium leading-tight mb-1.5 italic">
                                        {t(operator.passiveBonus, lang)}
                                    </div>
                                    <div className="text-[8px] text-zinc-500 font-mono tracking-tighter">
                                        {t(operator.uniqueTrait, lang)}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Crew Members */}
                <div className="flex flex-col gap-2">
                    <AnimatePresence mode="popLayout">
                        {hiredCrew.map((crew) => (
                            <motion.div
                                key={crew.id}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="group relative"
                            >
                                <div className="w-10 h-10 border border-white/10 bg-black/40 p-0.5 overflow-hidden hover:border-white/30 group-hover:scale-105 transition-all">
                                    <img
                                        src={crew.portraitPath}
                                        className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all"
                                        alt={t(crew.name, lang)}
                                    />
                                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100" />
                                </div>

                                {/* Hover Tooltip */}
                                <div className="absolute left-12 top-0 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                                    <div className="glass-panel p-2 border-white/10 bg-black/90 shadow-2xl min-w-[120px]">
                                        <div className="text-[9px] font-black text-white uppercase tracking-widest border-b border-white/5 pb-1 mb-1 flex items-center justify-between">
                                            {t(crew.name, lang)}
                                            <span className="text-[7px] text-white/20 lowercase font-mono">crew</span>
                                        </div>
                                        <div className="text-[8px] text-zinc-400 font-medium leading-normal">
                                            {t(crew.effectDesc, lang)}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
