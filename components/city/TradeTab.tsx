import React from 'react';
import { TradeTabProps } from './types';
import { getResourceLabel } from '../../services/gameMath';
import { REVERSE_TRADES, CITY_TRADES } from '../../constants/balance';
import { useGameStore } from '../../store/gameStore';
import { t } from '../../services/localization';

const TradeTab: React.FC<TradeTabProps> = ({ resources, onTrade }) => {
    const lang = useGameStore(s => s.settings.language);
    const tradeCost = CITY_TRADES.BASIC_EXCHANGE.cost;
    const tradeReward = CITY_TRADES.BASIC_EXCHANGE.reward;
    const canAffordTrade = resources.clay >= (tradeCost.clay || 0);

    return (
        <div className="max-w-md mx-auto space-y-4 md:space-y-8">
            {/* Basic Trade */}
            <div className="bg-zinc-900 border border-zinc-700 p-4 md:p-6">
                <h3 className="text-base md:text-lg font-bold text-zinc-200 mb-2 md:mb-4 pixel-text">СКУПЩИК УТИЛЯ</h3>
                <div className="flex items-center justify-between bg-black p-3 md:p-4 border border-zinc-800 mb-4 md:mb-6">
                    <div className="text-center">
                        <div className="text-lg md:text-xl font-bold text-amber-600">500</div>
                        <div className="text-[9px] md:text-[10px] text-zinc-500">ГЛИНА</div>
                    </div>
                    <div className="text-zinc-600">➔</div>
                    <div className="text-center">
                        <div className="text-lg md:text-xl font-bold text-white">50</div>
                        <div className="text-[9px] md:text-[10px] text-zinc-500">КАМЕНЬ</div>
                    </div>
                </div>
                <button
                    disabled={!canAffordTrade}
                    onClick={() => onTrade(tradeCost, tradeReward)}
                    className={`w-full py-3 md:py-4 font-black pixel-text text-xs md:text-sm transition-all active:scale-95 ${canAffordTrade ? 'bg-amber-700 hover:bg-amber-600 text-white' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
                >
                    {canAffordTrade ? 'ОБМЕНЯТЬ' : 'НЕДОСТАТОЧНО РЕСУРСОВ'}
                </button>
            </div>

            {/* Reverse Trades */}
            <div className="bg-zinc-900 border border-zinc-700 p-4 md:p-6">
                <h3 className="text-base md:text-lg font-bold text-zinc-200 mb-2 pixel-text">ПРОМЫШЛЕННАЯ ДРОБИЛКА</h3>
                <div className="space-y-2 md:space-y-3">
                    {REVERSE_TRADES.map((trade, idx) => {
                        const canSee = resources[trade.source] > 0 || resources[trade.target] > 100;
                        if (!canSee) return null;
                        const costVal = 10;
                        const rewardVal = 50;
                        const canAfford = resources[trade.source] >= costVal;
                        return (
                            <div key={idx} className="bg-black border border-zinc-800 p-2 md:p-3 flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="text-[9px] md:text-[10px] text-zinc-500 font-bold mb-1">{trade.label}</div>
                                    <div className="flex items-center gap-1 md:gap-2 font-mono text-[10px] md:text-xs">
                                        <span className="text-amber-600">{costVal} {t(getResourceLabel(trade.source), lang)}</span>
                                        <span className="text-zinc-600">➔</span>
                                        <span className="text-green-500">{rewardVal} {t(getResourceLabel(trade.target), lang)}</span>
                                    </div>
                                </div>
                                <button
                                    disabled={!canAfford}
                                    onClick={() => onTrade({ [trade.source]: costVal }, { [trade.target]: rewardVal })}
                                    className={`px-3 py-1.5 md:px-4 md:py-2 text-[9px] md:text-[10px] font-bold border transition-colors ${canAfford ? 'border-zinc-500 hover:bg-zinc-800 text-white' : 'border-zinc-800 text-zinc-700 cursor-not-allowed'}`}
                                >
                                    ЗАПУСК
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TradeTab;
