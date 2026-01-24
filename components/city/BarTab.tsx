import React, { useState } from 'react';
import { BarTabProps } from './types';
import { ResourceType, Resources } from '../../types';
import { useGameStore } from '../../store/gameStore';
import { getResourceLabel } from '../../services/gameMath';
import { BAR_DRINKS, GAMBLING } from '../../constants/balance';
import { ARTIFACTS } from '../../services/artifactRegistry';
import { t } from '../../services/localization';
import { audioEngine } from '../../services/audioEngine';

// Тип результата броска
type DiceResult = { won: boolean; amount: number } | null;

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
            const finalMsg = bonusMsg || (won ? 'ВЫИГРЫШ!' : 'ПРОИГРЫШ...');

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
        <div className="max-w-md mx-auto flex flex-col h-full">
            {/* Sub-tabs */}
            <div className="flex border-b border-zinc-800 bg-zinc-900 mb-4">
                <button
                    onClick={() => setBarTab('DRINKS')}
                    className={`flex-1 py-2 text-xs font-bold pixel-text ${barTab === 'DRINKS' ? 'bg-amber-900/20 text-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    МЕНЮ
                </button>
                <button
                    onClick={() => setBarTab('DICE')}
                    className={`flex-1 py-2 text-xs font-bold pixel-text ${barTab === 'DICE' ? 'bg-purple-900/20 text-purple-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    АЗАРТ
                </button>
                <button
                    onClick={() => setBarTab('VIP')}
                    className={`flex-1 py-2 text-xs font-bold pixel-text transition-all ${barTab === 'VIP' ? 'bg-amber-500/20 text-yellow-500 border-x border-amber-500/30' : 'text-zinc-600 hover:text-amber-400'}`}
                >
                    VIP КЛУБ 🏆
                </button>
            </div>

            {/* DRINKS */}
            {barTab === 'DRINKS' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-zinc-900 border border-amber-800 p-4 text-center">
                        <h3 className="text-amber-500 pixel-text mb-1">БАР "РЖАВАЯ ГАЙКА"</h3>
                        <p className="text-[10px] text-zinc-500 italic">"Наши напитки не просто сшибают с ног, они разъедают пол."</p>
                    </div>
                    <div className="space-y-3">
                        {BAR_DRINKS.map(drink => {
                            const canAfford = resources[drink.res as ResourceType] >= drink.cost;
                            return (
                                <div key={drink.id} className="bg-black border border-zinc-800 p-3 flex justify-between items-center gap-4 group hover:border-amber-700 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">{drink.icon}</div>
                                        <div>
                                            <div className={`text-xs font-bold ${drink.color} pixel-text`}>{t(drink.name, lang)}</div>

                                            <div className="text-[9px] text-zinc-400 font-mono max-w-[150px]">{drink.desc}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => buyCityBuff(drink.cost, drink.res as ResourceType, drink.effectId)}
                                        disabled={!canAfford}
                                        className={`px-4 py-2 border font-mono text-xs font-bold min-w-[80px]
                      ${canAfford ? 'border-amber-600 text-amber-500 hover:bg-amber-900/20' : 'border-zinc-800 text-zinc-600 cursor-not-allowed'}
                    `}
                                    >
                                        {drink.cost} {t(getResourceLabel(drink.res), lang)}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* GAMBLING ZONE */}
            {barTab === 'DICE' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 pb-10">
                    <div className="bg-zinc-900 border border-purple-800 p-4 text-center">
                        <h3 className="text-purple-400 pixel-text text-lg">ЗОНА ЛУДОМАНОВ</h3>
                        <p className="text-[9px] text-zinc-500 font-mono mt-1">"Где горы камня превращаются в пыль... или в кредиты."</p>
                    </div>

                    {/* 1. CLASSIC DICE */}
                    <GambleCard
                        title="КОСТИ ПУСТОТЫ"
                        icon="🎲"
                        desc="Классическая игра на удачу. Попробуй удвоить свои ресурсы."
                        chances="45% шанс"
                        prizes="Выплата x2 (Чистая прибыль x1)"
                        betRes={diceBetRes}
                        onResChange={setDiceBetRes}
                        amount={diceBetAmount}
                        onAmountChange={setDiceBetAmount}
                        onRoll={() => handleGamble('DICE', diceBetRes, diceBetAmount)}
                        isRolling={isRolling}
                        resources={resources}
                        lang={lang}
                    />

                    {/* 2. SEISMIC ROULETTE */}
                    <GambleCard
                        title="СЕЙСМО-РУЛЕТКА"
                        icon="🎡"
                        desc="Экстремальная лотерея для тех, у кого полные склады камня."
                        chances="5% общий шанс"
                        prizes="Кредиты (1.5-5.0%), или x5 Камня"
                        betRes={ResourceType.STONE}
                        amount={1000}
                        fixedBet
                        onRoll={() => handleGamble('ROULETTE', ResourceType.STONE, 1000)}
                        isRolling={isRolling}
                        resources={resources}
                        lang={lang}
                    />

                    {/* 3. FUEL SHELLS */}
                    <GambleCard
                        title="ТОПЛИВНЫЕ НАПЁРСТКИ"
                        icon="🏺"
                        desc="Рискни глиной, чтобы добыть ценное газовое топливо."
                        chances="5% шанс"
                        prizes="10 единиц ГАЗА"
                        betRes={ResourceType.CLAY}
                        amount={500}
                        fixedBet
                        onRoll={() => handleGamble('SHELLS', ResourceType.CLAY, 500)}
                        isRolling={isRolling}
                        resources={resources}
                        lang={lang}
                    />

                    {/* 4. VOID SLOTS */}
                    <GambleCard
                        title="СЛОТ-МАШИНА 'БЕЗДНА'"
                        icon="🎰"
                        desc="Конвертация излишков железа в твердую валюту."
                        chances="5% шанс"
                        prizes="20 КРЕДИТОВ"
                        betRes={ResourceType.IRON}
                        amount={100}
                        fixedBet
                        onRoll={() => handleGamble('SLOTS', ResourceType.IRON, 100)}
                        isRolling={isRolling}
                        resources={resources}
                        lang={lang}
                    />
                </div>
            )}

            {/* VIP ZONE */}
            {barTab === 'VIP' && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 slide-in-from-top-4 pb-10">
                    <div className="bg-zinc-950 border-2 border-amber-600 p-4 text-center shadow-[0_0_20px_rgba(217,119,6,0.2)]">
                        <h3 className="text-amber-500 pixel-text text-lg tracking-tighter uppercase whitespace-nowrap">ЗАКРЫТЫЙ ЛОНДЖ</h3>
                        <p className="text-[8px] text-amber-600/60 font-mono mt-1 uppercase tracking-widest whitespace-nowrap">Для тех, кто не считает кредиты</p>
                        <div className="mt-2 text-[10px] font-bold text-white font-mono bg-amber-950/40 py-1.5 inline-block px-4 border border-amber-900/40">
                            БАЛАНС: {resources.credits} 🪙
                        </div>
                    </div>

                    {/* 1. XP Lotto */}
                    <div className="bg-black border border-amber-900/40 p-4 border-l-4 border-l-amber-600 relative overflow-hidden group hover:bg-zinc-900/40 transition-all">
                        <div className="absolute top-0 right-0 p-2 opacity-10 text-4xl group-hover:scale-110 transition-transform">💎</div>
                        <div className="mb-4">
                            <h4 className="text-xs font-bold text-amber-400 pixel-text flex items-center gap-2">
                                <span>📜</span> ПОДКУП РУКОВОДСТВА
                            </h4>
                            <p className="text-[9px] text-zinc-400 font-mono leading-tight mt-1">"Взнос" в фонд станции в обмен на ускоренную сертификацию.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-4 font-mono text-[9px]">
                            <div className="bg-zinc-900 p-1.5 border border-amber-900/20">
                                <span className="text-zinc-500 uppercase block text-[7px] font-black">Успех</span>
                                <span className="text-amber-500 font-bold">35% Суммарно</span>
                            </div>
                            <div className="bg-zinc-900 p-1.5 border border-amber-900/20">
                                <span className="text-zinc-500 uppercase block text-[7px] font-black">Приз</span>
                                <span className="text-yellow-500 font-bold">до 3к XP</span>
                            </div>
                        </div>
                        <button
                            onClick={() => handleGambleVIP('XP')}
                            disabled={resources.credits < 750 || isRolling}
                            className={`w-full py-3 text-[10px] font-bold border-2 pixel-text transition-all
                                ${resources.credits >= 750 && !isRolling
                                    ? 'border-amber-600 bg-amber-600/10 text-amber-400 hover:bg-amber-600 hover:text-white'
                                    : 'border-zinc-800 text-zinc-700 cursor-not-allowed'}`}
                        >
                            {isRolling ? 'ПЕРЕВОД...' : 'ВНЕСТИ 750 🪙'}
                        </button>
                    </div>

                    {/* 2. Artifact Gamble */}
                    <div className="bg-black border border-amber-900/40 p-4 border-l-4 border-l-yellow-600 relative overflow-hidden group hover:bg-zinc-900/40 transition-all shadow-lg">
                        <div className="absolute -bottom-2 -right-2 p-2 opacity-10 text-6xl rotate-12 group-hover:scale-110 transition-transform">👑</div>
                        <div className="mb-4">
                            <h4 className="text-xs font-bold text-yellow-500 pixel-text flex items-center gap-2 uppercase">
                                🛸 ЧЕРНЫЙ ТЕНДЕР
                            </h4>
                            <p className="text-[9px] text-zinc-400 font-mono leading-tight mt-1">Покупка прав на вскрытие неопознанного контейнера.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-4 font-mono text-[9px]">
                            <div className="bg-zinc-900 p-1.5 border border-amber-900/20">
                                <span className="text-zinc-500 uppercase block text-[7px] font-black">Шанс</span>
                                <span className="text-yellow-500 font-bold">100% АРТЕФАКТ</span>
                            </div>
                            <div className="bg-zinc-900 p-1.5 border border-amber-900/20">
                                <span className="text-zinc-500 uppercase block text-[7px] font-black">Редкость</span>
                                <span className="text-zinc-400">88% БЕЛЫЕ</span>
                            </div>
                        </div>
                        <button
                            onClick={() => handleGambleVIP('ARTIFACT')}
                            disabled={resources.credits < 2500 || isRolling}
                            className={`w-full py-3 text-[10px] font-bold border-2 pixel-text transition-all
                                ${resources.credits >= 2500 && !isRolling
                                    ? 'border-yellow-600 bg-yellow-600/10 text-yellow-400 hover:bg-yellow-600 hover:text-white shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                                    : 'border-zinc-800 text-zinc-700 cursor-not-allowed'}`}
                        >
                            {isRolling ? 'ОТКРЫТИЕ...' : 'КУПИТЬ ЗА 2500 🪙'}
                        </button>
                    </div>

                    <p className="text-[7px] text-zinc-600 font-mono text-center uppercase tracking-widest leading-loose">Администрация не несет ответственности<br /> за обнуление вашего счета</p>
                </div>
            )}

            {/* РЕЗУЛЬТАТ (OVERLAY MODAL) */}
            {showResult && resultData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 p-6">
                    <div className={`max-w-xs w-full p-6 border-2 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] transform animate-in zoom-in-95 duration-200
                        ${resultData.won ? (resultData.isVIP ? 'border-amber-500 bg-zinc-950' : 'border-green-500 bg-zinc-950') : 'border-red-600 bg-zinc-950'}
                    `}>
                        <div className="text-4xl mb-4">{resultData.won ? (resultData.isVIP ? '👑' : '✨') : '💀'}</div>
                        {resultData.artifactId && (
                            <>
                                <div className="text-3xl mb-1">{ARTIFACTS.find(a => a.id === resultData.artifactId)?.icon || '❓'}</div>
                                <div className={`text-[10px] font-bold uppercase ${ARTIFACTS.find(a => a.id === resultData.artifactId)?.rarity === 'COMMON' ? 'text-zinc-400' : 'text-amber-400'}`}>
                                    {(() => {
                                        const a = ARTIFACTS.find(art => art.id === resultData.artifactId);
                                        if (!a) return '???';
                                        return typeof a.name === 'string' ? a.name : a.name.RU;
                                    })()}
                                </div>
                            </>
                        )}
                        <h4 className={`text-xl font-black pixel-text mb-2 ${resultData.won ? (resultData.isVIP ? 'text-amber-400' : 'text-green-400') : 'text-red-500'}`}>
                            {resultData.won ? 'ПОБЕДА!' : 'НЕ УДАЧА'}
                        </h4>
                        <p className="text-xs text-zinc-300 font-mono mb-6 leading-relaxed uppercase">
                            {resultData.msg}
                        </p>

                        <div className="bg-zinc-900 border border-zinc-800 p-3 mb-6 font-mono">
                            <div className="text-[10px] text-zinc-500 mb-1">РЕЗУЛЬТАТ ТРАНЗАКЦИИ:</div>
                            <div className={`text-sm font-bold ${resultData.won ? 'text-green-400' : 'text-red-400'}`}>
                                {resultData.won ? '+' : '-'}{resultData.amount} {resultData.res === ('XP' as any) ? 'XP' : getResourceLabel(resultData.res || ResourceType.STONE).RU}
                            </div>
                        </div>

                        <button
                            onClick={() => setShowResult(false)}
                            className={`w-full py-3 font-bold pixel-text text-xs transition-colors
                                ${resultData.isVIP ? 'bg-amber-600 hover:bg-amber-500 text-black' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}
                            `}
                        >
                            ПРИНЯТЬ ТАКУЮ СУДЬБУ
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
                    <div className="text-[7px] text-zinc-500 uppercase font-black mb-0.5">Шансы</div>
                    <div className="text-[9px] text-cyan-500 font-mono font-bold">{chances}</div>
                </div>
                <div className="bg-zinc-950/80 p-1.5 border border-zinc-900 rounded-sm">
                    <div className="text-[7px] text-zinc-500 uppercase font-black mb-0.5">Призы</div>
                    <div className="text-[9px] text-yellow-500 font-mono font-bold truncate">{prizes}</div>
                </div>
            </div>

            <div className="bg-zinc-950 p-2 mb-3 border border-zinc-800">
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 mb-2">
                    <span className="font-bold">ТЕКУЩАЯ СТАВКА:</span>
                    {!fixedBet && onResChange ? (
                        <select
                            value={betRes}
                            onChange={(e) => onResChange(e.target.value as ResourceType)}
                            className="bg-zinc-900 border border-zinc-700 px-2 py-0.5 outline-none text-purple-400 font-bold"
                        >
                            <option value={ResourceType.STONE}>КАМЕНЬ</option>
                            <option value={ResourceType.IRON}>ЖЕЛЕЗО</option>
                            <option value={ResourceType.GOLD}>ЗОЛОТО</option>
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
                {isRolling ? 'ОЖИДАНИЕ...' : 'ЗАКЛЮЧИТЬ ПАРИ'}
            </button>
        </div>
    );
};

export default BarTab;
