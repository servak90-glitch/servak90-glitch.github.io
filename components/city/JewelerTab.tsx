import React from 'react';
import { JewelerTabProps } from './types';
import { getResourceLabel } from '../../services/gameMath';
import { GEM_TRADES } from '../../constants/balance';
import { useGameStore } from '../../store/gameStore';
import { getActivePerkIds } from '../../services/factionLogic';
import { t, TL } from '../../services/localization';
import { audioEngine } from '../../services/audioEngine';
import { ScrollText, Trophy, Gem, Diamond as DiamondIcon } from 'lucide-react';

const JewelerTab: React.FC<JewelerTabProps> = ({ resources, onTrade }) => {
    const reputation = useGameStore(s => s.reputation);
    const lang = useGameStore(s => s.settings.language);
    const activePerks = React.useMemo(() => getActivePerkIds(reputation), [reputation]);
    const hasResearchGrant = activePerks.includes('RESEARCH_GRANT');

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in pb-12">
            {/* LAB HEADER */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 via-transparent to-purple-500/20 blur opacity-40"></div>
                <div className="relative bg-black/60 backdrop-blur-xl border border-white/5 p-8 md:p-12 text-center">
                    <div className="flex items-center justify-center gap-4 mb-3">
                        <div className="h-0.5 w-12 bg-purple-500" />
                        <h3 className="text-xl md:text-2xl font-black text-white tracking-[0.4em] uppercase italic">
                            {t({ RU: 'ГЕО-ЛАБОРАТОРИЯ', EN: 'GEO-ANALYTICS LAB' }, lang)}
                        </h3>
                        <div className="h-0.5 w-12 bg-purple-500" />
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono italic tracking-widest uppercase mb-6">
                        {t({
                            RU: '"МЫ ПРЕВРАЩАЕМ РЕДКИЕ КРИСТАЛЛЫ В ОПЫТ И ТЕХНОЛОГИИ."',
                            EN: '"TRANSMUTING GEOLOGICAL ANOMALIES INTO EMPIRICAL DATA."'
                        }, lang)}
                    </p>
                    {hasResearchGrant && (
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-sm">
                            <span className="text-[10px] text-green-500 font-black uppercase tracking-widest italic tracking-tighter">RESEARCH_GRANT_ACTIVE // 10% BONUS GRANTED</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {GEM_TRADES.map((trade) => {
                    // @ts-ignore
                    const userAmount = resources[trade.gem] || 0;
                    const canAfford = userAmount >= 1;
                    const gemColors = {
                        rubies: 'text-red-500 border-red-500/30 shadow-red-500/20',
                        emeralds: 'text-green-500 border-green-500/30 shadow-green-500/20',
                        diamonds: 'text-cyan-400 border-cyan-400/30 shadow-cyan-400/20'
                    }[trade.gem as string] || 'text-white border-white/30';

                    return (
                        <div key={trade.gem} className="group relative bg-white/5 border border-white/5 p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-8 hover:bg-white/10 transition-all">
                            <div className="flex items-center gap-8 w-full">
                                <div className={`w-20 h-20 flex items-center justify-center border bg-black/40 transform group-hover:rotate-12 transition-transform duration-500 ${gemColors}`}>
                                    <Gem className="w-10 h-10" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-base font-black text-white uppercase tracking-[0.2em] italic">{t(trade.label, lang)}</h4>
                                        <span className="text-[8px] font-mono text-zinc-500 uppercase">Analysis: Stable</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-purple-500 w-[70%]" />
                                        </div>
                                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em]">
                                            {t({ RU: 'НА СКЛАДЕ', EN: 'IN_STOCK' }, lang)}: <span className="text-white font-mono">{Math.floor(userAmount)}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                                {/* SELL FOR XP */}
                                <button
                                    disabled={!canAfford}
                                    onClick={() => onTrade({ [trade.gem]: 1 }, { XP: Math.floor(trade.xp * (hasResearchGrant ? 1.1 : 1)) })}
                                    className={`w-full sm:w-48 py-4 font-black uppercase tracking-[0.2em] text-[10px] transition-all
                                        ${canAfford ? 'bg-purple-600 text-white hover:bg-white hover:text-black shadow-[0_10px_20px_rgba(147,51,234,0.2)]' : 'bg-transparent text-zinc-800 border border-zinc-900 cursor-not-allowed'}
                                    `}
                                >
                                    +{Math.floor(trade.xp * (hasResearchGrant ? 1.1 : 1))} XP UNITS
                                </button>

                                {/* SELL FOR MONEY */}
                                <button
                                    disabled={!canAfford}
                                    onClick={() => onTrade({ [trade.gem]: 1 }, { [trade.moneyRes]: Math.floor(trade.moneyAmount * (hasResearchGrant ? 1.1 : 1)) })}
                                    className={`w-full sm:w-48 py-4 font-black uppercase tracking-[0.2em] text-[10px] transition-all
                                        ${canAfford ? 'bg-white text-black hover:bg-amber-500 hover:text-white shadow-[0_10px_20px_rgba(255,255,255,0.1)]' : 'bg-transparent text-zinc-800 border border-zinc-900 cursor-not-allowed'}
                                    `}
                                >
                                    +{Math.floor(trade.moneyAmount * (hasResearchGrant ? 1.1 : 1))} {t(getResourceLabel(trade.moneyRes), lang)}
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* DECORATIVE FOOTER */}
            <div className="text-center opacity-10">
                <div className="text-[8px] font-black uppercase tracking-[1em] mb-2">CRYPTO-GEOLOGICAL ANALYSIS COMPLETE</div>
                <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="w-1 h-1 bg-white" />)}
                </div>
            </div>
        </div>
    );
};

export default JewelerTab;
