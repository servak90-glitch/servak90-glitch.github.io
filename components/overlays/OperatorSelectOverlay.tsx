import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { OPERATORS } from '../../constants/rpg';
import { OperatorId } from '../../types';
import { t } from '../../services/localization';

export const OperatorSelectOverlay: React.FC = () => {
    const { operatorId, selectOperator, enterGame, settings } = useGameStore();
    const lang = settings.language;
    const [selectedId, setSelectedId] = useState<OperatorId>(OperatorId.GEOLOGIST);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const activeOp = OPERATORS.find(o => o.id === selectedId) || OPERATORS[0];
    const isNewPlayer = operatorId === null;

    // If user already has an operatoror game is not started, do not show this overlay
    const { isGameActive } = useGameStore();

    if (operatorId || !isGameActive) {
        return null;
    }

    const handleConfirm = () => {
        selectOperator(selectedId);
        setIsConfirmed(true);
        if (isNewPlayer) {
            enterGame();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in duration-700">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('/assets/ui/noise.png')] mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none" />

            <div className="relative z-10 text-center mb-8 md:mb-12">
                <h1 className="text-3xl md:text-5xl font-black tracking-widest text-white mb-2 uppercase italic skew-x-[-10deg]">
                    {isNewPlayer ? 'BIOMETRIC CERTIFICATION' : 'PROTOCOL UPDATE'}
                </h1>
                <p className="text-cyan-400 font-mono text-xs md:text-sm animate-pulse uppercase tracking-[0.3em]">
                    {isNewPlayer ? 'Select your operational profile' : 'Re-evaluating operator class for current sector'}
                </p>

                {/* Lore message for existing players */}
                {!isNewPlayer && (
                    <div className="mt-6 max-w-2xl mx-auto bg-orange-950/20 border border-orange-800/50 p-4 text-left">
                        <div className="flex items-start gap-3">
                            <div className="text-orange-400 text-xl flex-shrink-0">⚠</div>
                            <div>
                                <div className="text-sm font-bold text-orange-400 mb-2 uppercase tracking-wider">
                                    ВНИМАНИЕ, ОПЕРАТОР
                                </div>
                                <p className="text-xs text-orange-300/90 leading-relaxed font-mono">
                                    Обнаружено обновление протоколов Корпорации. Для продолжения работ на Aegis-7 требуется подтверждение вашей официальной специализации и прохождение биометрической сертификации.
                                </p>
                                <p className="text-xs text-zinc-500 mt-2 italic">
                                    Выбор класса бесплатен при первичной сертификации.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row gap-8 w-full max-w-7xl items-center lg:items-stretch">
                <div className="flex flex-row lg:flex-col gap-4 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 w-full lg:w-1/3">
                    {OPERATORS.map((op) => (
                        <button
                            key={op.id}
                            onClick={() => setSelectedId(op.id)}
                            className={`
                                relative group flex items-center gap-4 p-4 border-2 transition-all duration-300
                                ${selectedId === op.id
                                    ? 'bg-cyan-500/20 border-cyan-400 translate-x-2'
                                    : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-400 hover:bg-zinc-800/50'
                                }
                                text-left min-w-[200px] lg:min-w-0
                            `}
                        >
                            <div className={`w-12 h-12 border border-zinc-700 overflow-hidden bg-black flex-shrink-0`}>
                                <img src={op.portraitPath} alt={t(op.name, lang)} className={`w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all ${selectedId === op.id ? 'grayscale-0 scale-110' : ''}`} />
                            </div>
                            <div>
                                <div className={`font-bold uppercase tracking-widest text-sm ${selectedId === op.id ? 'text-cyan-400' : 'text-zinc-400'}`}>
                                    {t(op.name, lang)}
                                </div>
                                <div className="text-[10px] text-zinc-500 truncate max-w-[150px]">
                                    {t(op.uniqueTrait, lang)}
                                </div>
                            </div>
                            {selectedId === op.id && (
                                <div className="absolute right-[-2px] inset-y-0 w-1 bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex-1 bg-zinc-900/40 border-2 border-zinc-800 p-6 md:p-10 relative overflow-hidden flex flex-col md:flex-row gap-8">
                    <div className="relative w-full md:w-2/5 aspect-[3/4] border-2 border-zinc-800 overflow-hidden shadow-2xl skew-x-[-2deg]">
                        <img
                            key={activeOp.id}
                            src={activeOp.portraitPath}
                            alt={t(activeOp.name, lang)}
                            className="w-full h-full object-cover animate-in zoom-in-110 duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                        <div className="absolute bottom-4 left-4 right-4 animate-in slide-in-from-bottom-4 duration-500">
                            <span className="text-[10px] font-mono text-zinc-500 block mb-1 uppercase tracking-tighter">Physical Description</span>
                            <p className="text-[10px] text-zinc-400 leading-tight italic">{t(activeOp.visuals, lang)}</p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                        <div>
                            <div className="mb-6">
                                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">{t(activeOp.name, lang)}</h2>
                                <div className="h-1 w-20 bg-cyan-500" />
                            </div>

                            <p className="text-zinc-400 text-sm leading-relaxed mb-8 font-serif italic border-l-2 border-zinc-800 pl-4 py-2">
                                "{t(activeOp.lore, lang)}"
                            </p>

                            <div className="space-y-6">
                                <div>
                                    <div className="text-xs font-mono text-zinc-500 mb-2 uppercase underline decoration-cyan-500/50 underline-offset-4 tracking-[0.2em]">Passive Benefits</div>
                                    <p className="text-white font-medium text-sm pl-2 border-l border-zinc-700">{t(activeOp.passiveBonus, lang)}</p>
                                </div>
                                <div>
                                    <div className="text-xs font-mono text-zinc-500 mb-2 uppercase underline decoration-orange-500/50 underline-offset-4 tracking-[0.2em]">Unique Ability</div>
                                    <p className="text-orange-400 font-bold text-sm pl-2 border-l border-orange-800">{t(activeOp.uniqueTrait, lang)}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirm}
                            className="mt-8 group relative py-4 bg-cyan-600 hover:bg-cyan-500 text-black font-black uppercase tracking-[0.5em] transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(34,211,238,0.2)]"
                        >
                            CONFIRM ASSIGNMENT
                            <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/50 transition-all pointer-events-none" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white" />
                            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative z-10 mt-8 text-center max-w-xl">
                <p className="text-zinc-600 text-[9px] font-mono uppercase tracking-widest leading-none">
                    Warning: Sector Aegis-7 involves extreme depths and hazardous events. Certification choice is permanent (re-evaluation available via hub clinic at cost).
                </p>
                <div className="flex justify-center gap-12 mt-4 text-[8px] text-cyan-800 font-mono tracking-tighter">
                    <span>STRATA: VOID</span>
                    <span>PROTOCOL: TERMINAL</span>
                    <span>UUID: {Math.random().toString(16).slice(2, 10).toUpperCase()}</span>
                </div>
            </div>
        </div>
    );
};
