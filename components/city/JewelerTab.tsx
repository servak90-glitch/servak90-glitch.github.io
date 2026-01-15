import React from 'react';
import { JewelerTabProps } from './types';
import { getResourceLabel } from '../../services/gameMath';
import { GEM_TRADES } from '../../constants/balance';

const JewelerTab: React.FC<JewelerTabProps> = ({ resources, onTrade }) => {
    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
            <div className="bg-zinc-900/80 border border-purple-900/50 p-6 text-center">
                <h3 className="text-xl pixel-text text-purple-400 mb-2">ГЕО-ЛАБОРАТОРИЯ</h3>
                <p className="text-xs text-zinc-400 font-mono">
                    "Мы превращаем редкие кристаллы в опыт и технологии."
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {GEM_TRADES.map((trade) => {
                    // @ts-ignore
                    const userAmount = resources[trade.gem] || 0;
                    const canAfford = userAmount >= 1;
                    return (
                        <div key={trade.gem} className="bg-black border border-zinc-800 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className={`w-12 h-12 flex items-center justify-center border-2 text-2xl
                  ${trade.gem === 'rubies' ? 'border-red-500 text-red-500' :
                                        trade.gem === 'emeralds' ? 'border-green-500 text-green-500' : 'border-cyan-400 text-cyan-400'}
                `}>
                                    ♦
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">{trade.label}</div>
                                    <div className="text-xs text-zinc-500 font-mono">НА СКЛАДЕ: {Math.floor(userAmount)}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                {/* SELL FOR XP */}
                                <button
                                    disabled={!canAfford}
                                    onClick={() => onTrade({ [trade.gem]: 1 }, { XP: trade.xp })}
                                    className={`px-4 py-2 border text-xs font-bold font-mono min-w-[100px]
                    ${canAfford ? 'border-purple-500 text-purple-400 hover:bg-purple-900/20' : 'border-zinc-800 text-zinc-600'}
                  `}
                                >
                                    +{trade.xp} XP
                                </button>

                                {/* SELL FOR MONEY */}
                                <button
                                    disabled={!canAfford}
                                    onClick={() => onTrade({ [trade.gem]: 1 }, { [trade.moneyRes]: trade.moneyAmount })}
                                    className={`px-4 py-2 border text-xs font-bold font-mono min-w-[120px]
                    ${canAfford ? 'border-amber-500 text-amber-400 hover:bg-amber-900/20' : 'border-zinc-800 text-zinc-600'}
                  `}
                                >
                                    +{trade.moneyAmount} {getResourceLabel(trade.moneyRes)}
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default JewelerTab;
