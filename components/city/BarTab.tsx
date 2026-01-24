import React, { useState } from 'react';
import { BarTabProps } from './types';
import { ResourceType, Resources } from '../../types';
import { useGameStore } from '../../store/gameStore';
import { getResourceLabel } from '../../services/gameMath';
import { BAR_DRINKS, GAMBLING } from '../../constants/balance';
import { ARTIFACTS } from '../../services/artifactRegistry';
import { t, TL } from '../../services/localization';
import { audioEngine } from '../../services/audioEngine';
import {
    ScrollText,
    Trophy,
    GlassWater,
    Martini,
    Radiation,
    Orbit,
    Dices,
    RotateCcw,
    Package,
    Coins,
    Crown,
    Sparkles,
    Skull,
    ArrowRight
} from 'lucide-react';

const DrinkIcon = ({ icon }: { icon: string }) => {
    switch (icon) {
        case '🍺': return <GlassWater className="w-8 h-8" />;
        case '🍷': return <Martini className="w-8 h-8" />;
        case '☢️': return <Radiation className="w-8 h-8" />;
        case '🌑': return <Orbit className="w-8 h-8" />;
        default: return <GlassWater className="w-8 h-8" />;
    }
};

const BarTab: React.FC<BarTabProps> = ({ resources }) => {
    const [barTab, setBarTab] = useState<'DRINKS' | 'DICE' | 'VIP'>('DRINKS');
    const [diceBetRes, setDiceBetRes] = useState<ResourceType>(ResourceType.STONE);
    const [diceBetAmount, setDiceBetAmount] = useState<number>(GAMBLING.MIN_BET);
    const [isRolling, setIsRolling] = useState(false);

    const buyCityBuff = useGameStore(s => s.buyCityBuff);
    const gambleResources = useGameStore(s => s.gambleResources);
    const gambleVIP = useGameStore(s => s.gambleVIP);
    const lang = useGameStore(s => s.settings.language);

    const [showResult, setShowResult] = useState(false);
    const [resultData, setResultData] = useState<{
        won: boolean;
        msg: string;
        amount?: number;
        res?: ResourceType;
        artifactId?: string;
        isVIP?: boolean;
    } | null>(null);


    // Обёртка для броска с анимацией результата
    const handleGamble = (gameType: 'DICE' | 'ROULETTE' | 'SHELLS' | 'SLOTS', res: ResourceType, amount: number) => {
        if (resources[res] < amount) return;

        setIsRolling(true);

        setTimeout(() => {
            const { won, bonusMsg, rewardAmt, rewardRes } = gambleResources(gameType, res, amount);
            const finalMsg = bonusMsg || (won ? t(TL.ui.win_label, lang) : t(TL.ui.loss_label, lang));

            setResultData({
                won,
                msg: finalMsg,
                amount: rewardAmt || amount,
                res: rewardRes || res
            });
            setShowResult(true);
            setIsRolling(false);

            if (won) {
                audioEngine.playAchievement();
            } else {
                audioEngine.playUIError();
            }
        }, 1200);
    };

    const handleGambleVIP = (type: 'XP' | 'ARTIFACT') => {
        const cost = type === 'XP' ? 750 : 2500;
        if (resources.credits < cost) return;

        setIsRolling(true);

        setTimeout(() => {
            const res = gambleVIP(type);
            setResultData({
                won: res.won,
                msg: res.msg,
                amount: res.rewardAmt || cost,
                res: res.rewardRes || ResourceType.CREDITS,
                artifactId: res.rewardArtifactId,
                isVIP: true
            });
            setShowResult(true);
            setIsRolling(false);
        }, 1500);
    };

    return (
        <div className="max-w-4xl mx-auto flex flex-col h-full space-y-8 pb-12">
            {/* SUB-TABS: GLASSMOPHISM NAVIGATION */}
            <div className="flex bg-black/60 backdrop-blur-xl p-1 border border-white/5 rounded-sm shrink-0">
                {(['DRINKS', 'DICE', 'VIP'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setBarTab(tab)}
                        className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative
                            ${barTab === tab ? 'text-black bg-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}
                        `}
                    >
                        {tab === 'DRINKS' ? t(TL.ui.menu_label, lang) : tab === 'DICE' ? t(TL.ui.gamble_label, lang) : 'EXECUTIVE LOUNGE'}
                        {barTab === tab && <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-500 shadow-[0_0_10px_#f59e0b]" />}
                    </button>
                ))}
            </div>

            {/* DRINKS SECTION */}
            {barTab === 'DRINKS' && (
                <div className="animate-in fade-in duration-700 space-y-8">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 via-transparent to-amber-500/20 blur opacity-30"></div>
                        <div className="relative bg-black/40 backdrop-blur-md border border-white/5 p-8 text-center">
                            <h3 className="text-xl font-black text-white tracking-[0.5em] uppercase italic mb-2">{t(TL.ui.barRustyNut, lang)}</h3>
                            <div className="h-px w-24 bg-amber-500 mx-auto mb-4" />
                            <p className="text-[10px] text-zinc-500 font-mono italic tracking-widest uppercase">{t(TL.ui.barTagline, lang)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {BAR_DRINKS.map(drink => {
                            const canAfford = resources[drink.res as ResourceType] >= drink.cost;
                            return (
                                <div key={drink.id} className="group relative bg-white/5 border border-white/5 p-6 transition-all hover:bg-white/10 hover:border-amber-500/30">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="group-hover:scale-110 transition-transform duration-500">
                                            <DrinkIcon icon={drink.icon} />
                                        </div>
                                        <div className={`px-3 py-1 border rounded-full text-[8px] font-black uppercase tracking-widest ${canAfford ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-500'}`}>
                                            {drink.cost} pts
                                        </div>
                                    </div>
                                    <div>
                                        <div className={`text-xs font-black ${drink.color} uppercase tracking-[0.2em] mb-2`}>{t(drink.name, lang)}</div>
                                        <p className="text-[10px] text-zinc-500 font-mono leading-relaxed h-12 overflow-hidden mb-6">{t(drink.desc, lang)}</p>
                                    </div>
                                    <button
                                        onClick={() => buyCityBuff(drink.cost, drink.res as ResourceType, drink.effectId)}
                                        disabled={!canAfford}
                                        className={`w-full py-3 text-[9px] font-black uppercase tracking-[0.3em] transition-all
                                            ${canAfford ? 'bg-amber-600 text-black hover:bg-white' : 'bg-transparent text-zinc-800 border border-zinc-900 cursor-not-allowed'}
                                        `}
                                    >
                                        Consume Protocol
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* GAMBLING SECTION */}
            {barTab === 'DICE' && (
                <div className="animate-in fade-in duration-700 space-y-8">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 via-transparent to-purple-500/20 blur opacity-30"></div>
                        <div className="relative bg-black/40 backdrop-blur-md border border-white/5 p-8 text-center">
                            <h3 className="text-xl font-black text-purple-400 tracking-[0.5em] uppercase italic mb-2">{t(TL.ui.gamblingZone, lang)}</h3>
                            <div className="h-px w-24 bg-purple-500 mx-auto mb-4" />
                            <p className="text-[10px] text-zinc-500 font-mono italic tracking-widest uppercase">{t(TL.ui.gamblingTagline, lang)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                        {/* DICE GAME CARD */}
                        <div className="relative group bg-white/5 border border-white/5 p-6 md:p-8 hover:bg-white/10 transition-all">
                            <div className="flex justify-between items-start mb-8">
                                <Dices className="w-10 h-10 text-purple-400" />
                                <div className="text-right">
                                    <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Calculated Payout</div>
                                    <div className="text-xl font-black text-purple-400 font-mono italic">X 2.0</div>
                                </div>
                            </div>
                            <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-2">{t(TL.ui.voidDice, lang)}</h4>
                            <p className="text-[10px] text-zinc-500 font-mono mb-8 uppercase tracking-tighter">45% Victory Probability Estimation</p>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-[9px] font-black text-zinc-500 uppercase">
                                    <span>Asset Type</span>
                                    <select
                                        value={diceBetRes}
                                        onChange={(e) => setDiceBetRes(e.target.value as ResourceType)}
                                        className="bg-black/40 border border-white/10 px-3 py-1 text-purple-400 outline-none"
                                    >
                                        <option value={ResourceType.STONE}>{t(TL.resources.stone, lang)}</option>
                                        <option value={ResourceType.IRON}>{t(TL.resources.iron, lang)}</option>
                                        <option value={ResourceType.GOLD}>{t(TL.resources.gold, lang)}</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[9px] font-black text-zinc-500 uppercase">
                                        <span>Investment Amount</span>
                                        <span className="text-white font-mono">{diceBetAmount} units</span>
                                    </div>
                                    <input
                                        type="range" min={10} max={1000} step={10}
                                        value={diceBetAmount}
                                        onChange={(e) => setDiceBetAmount(parseInt(e.target.value))}
                                        className="w-full accent-purple-500 h-1 bg-white/5 appearance-none rounded-full cursor-pointer"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => handleGamble('DICE', diceBetRes, diceBetAmount)}
                                disabled={resources[diceBetRes] < diceBetAmount || isRolling}
                                className={`w-full py-4 text-[10px] font-black uppercase tracking-[0.4em] transition-all
                                    ${resources[diceBetRes] >= diceBetAmount && !isRolling
                                        ? 'bg-purple-600 text-white hover:bg-white hover:text-black shadow-[0_10px_20px_rgba(147,51,234,0.3)]'
                                        : 'bg-white/5 text-zinc-700 cursor-not-allowed'}`}
                            >
                                {isRolling ? 'TRANSMITTING...' : 'INITIALIZE ROLL'}
                            </button>
                        </div>

                        {/* ROULETTE CARD */}
                        <div className="relative group bg-white/5 border border-white/5 p-6 md:p-8 hover:bg-white/10 transition-all">
                            <div className="flex justify-between items-start mb-8">
                                <RotateCcw className="w-10 h-10 text-yellow-400" />
                                <div className="text-right">
                                    <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Jackpot Pool</div>
                                    <div className="text-xl font-black text-yellow-400 font-mono italic">X 36.0</div>
                                </div>
                            </div>
                            <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-2">{t(TL.ui.seismicRoulette, lang)}</h4>
                            <p className="text-[10px] text-zinc-500 font-mono mb-8 uppercase tracking-tighter italic">High-frequency orbital resonance gambling</p>

                            <div className="bg-black/40 border border-white/5 p-4 mb-8 flex justify-between items-center">
                                <div className="text-[9px] font-black text-zinc-500 uppercase">Input Feed</div>
                                <div className="text-[10px] font-mono text-white">1000 <span className="text-zinc-600">STONE</span></div>
                            </div>

                            <button
                                onClick={() => handleGamble('ROULETTE', ResourceType.STONE, 1000)}
                                disabled={resources.stone < 1000 || isRolling}
                                className={`w-full py-4 text-[10px] font-black uppercase tracking-[0.4em] transition-all
                                    ${resources.stone >= 1000 && !isRolling
                                        ? 'bg-purple-800 text-white hover:bg-white hover:text-black shadow-[0_10px_20px_rgba(107,33,168,0.3)]'
                                        : 'bg-white/5 text-zinc-700 cursor-not-allowed'}`}
                            >
                                {isRolling ? 'SPINNING...' : 'ACTIVATE ROTOR'}
                            </button>
                        </div>

                        {/* MORE MINI GAMES: SHELLS & SLOTS */}
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/10 p-4 flex items-center justify-between group/mini hover:bg-white/10 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="group-hover/mini:rotate-12 transition-transform">
                                        <Package className="w-6 h-6 text-zinc-400" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-white uppercase tracking-widest">{t(TL.ui.fuelShells, lang)}</div>
                                        <div className="text-[8px] font-mono text-zinc-500">500 CLAY → 10 FUEL</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleGamble('SHELLS', ResourceType.CLAY, 500)}
                                    disabled={resources.clay < 500 || isRolling}
                                    className={`px-6 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${resources.clay >= 500 ? 'bg-zinc-800 text-white hover:bg-white hover:text-black' : 'text-zinc-800 border border-zinc-900'}`}
                                >
                                    ENGAGE
                                </button>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-4 flex items-center justify-between group/mini hover:bg-white/10 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="group-hover/mini:rotate-12 transition-transform">
                                        <Coins className="w-6 h-6 text-yellow-500" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-white uppercase tracking-widest">{t(TL.ui.voidSlots, lang)}</div>
                                        <div className="text-[8px] font-mono text-zinc-500">100 IRON → 20 CREDITS</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleGamble('SLOTS', ResourceType.IRON, 100)}
                                    disabled={resources.iron < 100 || isRolling}
                                    className={`px-6 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${resources.iron >= 100 ? 'bg-zinc-800 text-white hover:bg-white hover:text-black' : 'text-zinc-800 border border-zinc-900'}`}
                                >
                                    ENGAGE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* VIP SECTION */}
            {barTab === 'VIP' && (
                <div className="animate-in fade-in duration-1000 space-y-8 pb-12">
                    <div className="relative group p-10 bg-black/60 backdrop-blur-3xl border border-amber-500/30 overflow-hidden text-center">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />
                        <div className="relative z-10 flex flex-col items-center">
                            <Crown className="w-12 h-12 text-amber-500 mb-4" />
                            <h3 className="text-2xl font-[1000] text-amber-500 tracking-[0.3em] uppercase italic mb-2">EXECUTIVE VIP LOUNGE</h3>
                            <p className="text-[10px] text-zinc-500 font-mono tracking-[0.2em] uppercase italic leading-loose">
                                Unauthorized biological entities will be terminated.<br />Welcome to the high-stakes sector, Administrator.
                            </p>
                            <div className="mt-8 bg-amber-500/10 border border-amber-500/20 px-8 py-4 flex flex-col items-center shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                                <span className="text-[8px] text-amber-600 font-black uppercase tracking-widest mb-1">Corporate Credit Balance</span>
                                <div className="text-3xl font-black text-white font-mono tracking-tighter">{resources.credits} pts</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* BRIBE CARD */}
                        <div className="relative group bg-white/5 border border-white/5 p-8 hover:border-amber-500/40 transition-all flex flex-col">
                            <div className="flex justify-between items-start mb-10">
                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500">
                                    <ScrollText className="w-8 h-8" />
                                </div>
                                <div className="text-right">
                                    <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Operation Cost</div>
                                    <div className="text-xl font-black text-white font-mono">750 pts</div>
                                </div>
                            </div>
                            <h4 className="text-base font-black text-white uppercase tracking-[0.2em] mb-4 italic">{t(TL.ui.bribeManagement, lang)}</h4>
                            <p className="text-[10px] text-zinc-500 font-mono leading-relaxed mb-10 h-12 overflow-hidden italic">
                                "{t(TL.ui.bribeDesc, lang)}"
                            </p>
                            <div className="grid grid-cols-2 gap-4 mb-10">
                                <div className="bg-black/40 border border-white/5 p-3">
                                    <span className="text-[7px] text-zinc-600 uppercase block font-black">Success Rate</span>
                                    <span className="text-xs font-black text-green-500 font-mono">35%</span>
                                </div>
                                <div className="bg-black/40 border border-white/5 p-3">
                                    <span className="text-[7px] text-zinc-600 uppercase block font-black">Yield</span>
                                    <span className="text-xs font-black text-amber-500 font-mono">3000 XP</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleGambleVIP('XP')}
                                disabled={resources.credits < 750 || isRolling}
                                className={`w-full py-5 text-[10px] font-black uppercase tracking-[0.4em] transition-all
                                    ${resources.credits >= 750 && !isRolling ? 'bg-amber-600 text-black hover:bg-white' : 'bg-white/5 text-zinc-800 border border-zinc-900 cursor-not-allowed'}`}
                            >
                                {isRolling ? 'PROCESSING...' : 'INITIATE BRIBE'}
                            </button>
                        </div>

                        {/* TENDER CARD */}
                        <div className="relative group bg-white/5 border border-white/5 p-8 hover:border-yellow-500/40 transition-all flex flex-col shadow-2xl">
                            <div className="flex justify-between items-start mb-10">
                                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500">
                                    <Trophy className="w-8 h-8" />
                                </div>
                                <div className="text-right">
                                    <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Entry Fee</div>
                                    <div className="text-xl font-black text-white font-mono">2500 pts</div>
                                </div>
                            </div>
                            <h4 className="text-base font-black text-white uppercase tracking-[0.2em] mb-4 italic">{t(TL.ui.blackTender, lang)}</h4>
                            <p className="text-[10px] text-zinc-500 font-mono leading-relaxed mb-10 h-12 overflow-hidden italic">
                                "{t(TL.ui.tenderDesc, lang)}"
                            </p>
                            <div className="bg-black/40 border border-white/5 p-4 mb-10">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[8px] text-zinc-600 uppercase font-black">Loot Acquisition</span>
                                    <span className="text-[8px] text-yellow-500 font-black uppercase">Guaranteed</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full w-full bg-gradient-to-r from-yellow-600 to-amber-400" />
                                </div>
                                <div className="text-right text-[7px] font-mono text-zinc-500 mt-1 italic">Rarity Deviation: ±12%</div>
                            </div>
                            <button
                                onClick={() => handleGambleVIP('ARTIFACT')}
                                disabled={resources.credits < 2500 || isRolling}
                                className={`w-full py-5 text-[10px] font-black uppercase tracking-[0.4em] transition-all
                                    ${resources.credits >= 2500 && !isRolling ? 'bg-yellow-500 text-black hover:bg-white' : 'bg-white/5 text-zinc-800 border border-zinc-900 cursor-not-allowed'}`}
                            >
                                {isRolling ? 'CRYPTOGRAPHY...' : 'ACQUIRE ARTIFACT'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* OVERLAY MODAL: TRANSACTION LOG */}
            {showResult && resultData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className={`max-w-md w-full bg-black border-2 p-10 text-center relative overflow-hidden transition-all duration-500
                        ${resultData.won ? 'border-green-500/50 shadow-[0_0_100px_rgba(34,197,94,0.1)]' : 'border-red-500/50 shadow-[0_0_100px_rgba(239,68,68,0.1)]'}
                    `}>
                        {/* Background Static Line Animation Effect */}
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />

                        <div className="flex justify-center mb-6">
                            {resultData.won ? <Sparkles className="w-16 h-16 text-green-500" /> : <Skull className="w-16 h-16 text-red-500" />}
                        </div>

                        {resultData.artifactId && (
                            <div className="mb-8">
                                <div className="text-5xl mb-4 p-4 bg-white/5 border border-white/5 inline-block">{ARTIFACTS.find(a => a.id === resultData.artifactId)?.icon || '❓'}</div>
                                <div className="text-xs font-black uppercase tracking-[0.4em] text-amber-500 italic">
                                    {(() => {
                                        const a = ARTIFACTS.find(art => art.id === resultData.artifactId);
                                        if (!a) return 'UNKNOWN_OBJECT';
                                        return typeof a.name === 'string' ? a.name : a.name[lang];
                                    })()}
                                </div>
                            </div>
                        )}

                        <h4 className={`text-4xl font-[1000] uppercase italic tracking-tighter mb-4 ${resultData.won ? 'text-green-500' : 'text-red-500'}`}>
                            {resultData.won ? 'Contract Fulfilled' : 'Asset Liquidated'}
                        </h4>

                        <p className="text-[10px] text-zinc-500 font-mono mb-10 uppercase tracking-widest leading-relaxed px-8">
                            {resultData.msg}
                        </p>

                        <div className="bg-white/5 border border-white/5 p-6 mb-10 flex flex-col items-center">
                            <span className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mb-1">Transaction Balance</span>
                            <div className={`text-3xl font-black font-mono ${resultData.won ? 'text-green-400' : 'text-red-500'}`}>
                                {resultData.won ? '+' : '-'}{resultData.amount} <span className="text-xs">{resultData.res === ('XP' as any) ? 'XP' : t(getResourceLabel(resultData.res || ResourceType.STONE), lang)}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowResult(false)}
                            className={`w-full py-5 text-[10px] font-black uppercase tracking-[0.5em] transition-all
                                ${resultData.won ? 'bg-green-600 text-white hover:bg-white hover:text-black' : 'bg-red-950 text-red-500 hover:bg-red-600 hover:text-white'}
                            `}
                        >
                            Accept Transaction Result
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

interface GambleCardProps {
    title: string;
    icon: string;
    desc: string;
    chances: string;
    prizes: string;
    betRes: ResourceType;
    onResChange?: (r: ResourceType) => void;
    amount: number;
    onAmountChange?: (n: number) => void;
    fixedBet?: boolean;
    onRoll: () => void;
    isRolling: boolean;
    resources: Resources;
    lang: any;
}

const GambleCard: React.FC<GambleCardProps> = ({ title, icon, desc, chances, prizes, betRes, onResChange, amount, onAmountChange, fixedBet, onRoll, isRolling, resources, lang }) => {
    return (
        <div className="bg-black border border-zinc-800 p-4 border-l-4 border-l-purple-600 transition-all hover:bg-zinc-900/40">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="text-xs font-bold text-purple-300 pixel-text flex items-center gap-2">
                        <span>{icon}</span> {title}
                    </h4>
                    <p className="text-[9px] text-zinc-400 font-mono leading-tight mt-1">{desc}</p>
                </div>
            </div>

            {/* INFO PANEL */}
            <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-zinc-950/80 p-1.5 border border-zinc-900 rounded-sm">
                    <div className="text-[7px] text-zinc-500 uppercase font-black mb-0.5">{t(TL.ui.chance_label, lang)}</div>
                    <div className="text-[9px] text-cyan-500 font-mono font-bold">{chances}</div>
                </div>
                <div className="bg-zinc-950/80 p-1.5 border border-zinc-900 rounded-sm">
                    <div className="text-[7px] text-zinc-500 uppercase font-black mb-0.5">{t(TL.ui.prizes_label, lang)}</div>
                    <div className="text-[9px] text-yellow-500 font-mono font-bold truncate">{prizes}</div>
                </div>
            </div>

            <div className="bg-zinc-950 p-2 mb-3 border border-zinc-800">
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 mb-2">
                    <span className="font-bold">{t(TL.ui.bet_label, lang)}:</span>
                    {!fixedBet && onResChange ? (
                        <select
                            value={betRes}
                            onChange={(e) => onResChange(e.target.value as ResourceType)}
                            className="bg-zinc-900 border border-zinc-700 px-2 py-0.5 outline-none text-purple-400 font-bold"
                        >
                            <option value={ResourceType.STONE}>{t(TL.resources.stone, lang)}</option>
                            <option value={ResourceType.IRON}>{t(TL.resources.iron, lang)}</option>
                            <option value={ResourceType.GOLD}>{t(TL.resources.gold, lang)}</option>
                        </select>
                    ) : (
                        <span className="text-purple-400 font-bold bg-purple-950/20 px-2 py-0.5 border border-purple-900/30">
                            {amount} {t(getResourceLabel(betRes), lang)}
                        </span>
                    )}
                </div>
                {!fixedBet && onAmountChange && (
                    <div className="flex items-center gap-3">
                        <input
                            type="range" min={10} max={1000} step={10}
                            value={amount}
                            onChange={(e) => onAmountChange(parseInt(e.target.value))}
                            className="flex-1 accent-purple-600 h-1.5 bg-zinc-800 appearance-none cursor-pointer"
                        />
                        <span className="text-[10px] font-mono text-white w-8 text-right font-bold">{amount}</span>
                    </div>
                )}
            </div>

            <button
                onClick={onRoll}
                disabled={resources[betRes] < amount || isRolling}
                className={`w-full py-2.5 text-[10px] font-bold border-2 pixel-text transition-all
                    ${resources[betRes] >= amount && !isRolling
                        ? 'border-purple-600 bg-purple-600/10 text-purple-300 hover:bg-purple-600 hover:text-white shadow-[0_4px_10px_rgba(147,51,234,0.2)]'
                        : 'border-zinc-800 text-zinc-700 bg-transparent cursor-not-allowed'}`}
            >
                {isRolling ? t(TL.ui.waiting, lang) : t(TL.ui.deal_btn, lang)}
            </button>
        </div>
    );
};

export default BarTab;
