/**
 * MARKET VIEW — UI для торговли ресурсами в Station базах
 * Phase 6.3: Квесты от Лисы и Бонусы Репутации
 */

import { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { audioEngine } from '../services/audioEngine';
import { getAllMarketPrices } from '../services/marketEngine';
import { getActivePerkIds } from '../services/factionLogic';
import { TL, t, TEXT_IDS } from '../services/localization';
import { BLACK_MARKET_ITEMS, RAID_THRESHOLDS, SMUGGLING_CATEGORIES } from '../constants/blackMarket';
import type { Resources, ResourceType } from '../types';
import { economySystem } from '../services/systems/EconomySystem';
import {
    ShoppingBag,
    ShieldAlert,
    BarChart3,
    Fingerprint,
    RefreshCcw,
    TrendingUp,
    TrendingDown,
    Package,
    Zap,
    MonitorDot,
    ScrollText,
    Target,
    Clock,
    CheckCircle2,
    ShieldCheck,
    Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MarketView = () => {
    const currentRegion = useGameStore(s => s.currentRegion);
    const resources = useGameStore(s => s.resources);
    const playerBases = useGameStore(s => s.playerBases);
    const buyFromMarket = useGameStore(s => s.buyFromMarket);
    const sellToMarket = useGameStore(s => s.sellToMarket);
    const buyBlackMarketItem = useGameStore(s => s.buyBlackMarketItem);
    const exchangeResourceForFuel = useGameStore(s => (s as any).exchangeResourceForFuel);
    const unlockedBlueprints = useGameStore(s => s.unlockedBlueprints);
    const reputation = useGameStore(s => s.reputation);
    const lang = useGameStore(s => s.settings.language);

    // Black Market state
    const blackMarkets = useGameStore(s => s.blackMarkets);
    const foxReputation = useGameStore(s => s.foxReputation);
    const sellToBlackMarket = useGameStore(s => (s as any).sellToBlackMarket);
    const completeSmugglingQuest = useGameStore(s => (s as any).completeSmugglingQuest);

    const [selectedResource, setSelectedResource] = useState<keyof Resources | null>(null);
    const [amount, setAmount] = useState<number>(1);
    const [activeTab, setActiveTab] = useState<'regular' | 'black_market' | 'exchange' | 'smuggling'>('regular');
    const [expandedResource, setExpandedResource] = useState<ResourceType | null>(null);

    useEffect(() => {
        audioEngine.playUIPanelOpen();
    }, []);

    const activePerks = useMemo(() => getActivePerkIds(reputation), [reputation]);
    const hasBlackMarket = activePerks.includes('BLACK_MARKET');
    const marketPrices = useMemo(() => getAllMarketPrices(currentRegion, [], activePerks), [currentRegion, activePerks]);

    const gameTime = useGameStore(s => s.gameTime);
    const marketBlockedUntil = useGameStore(s => s.marketBlockedUntil);
    const isMarketBlocked = marketBlockedUntil > gameTime;
    const marketBlockedTimeRemainingSeconds = Math.max(0, marketBlockedUntil - gameTime);

    const activeQuest = blackMarkets[currentRegion]?.activeQuest;

    return (
        <div className="flex-1 flex flex-col p-0 md:p-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 min-h-full md:h-full relative z-10 font-technical">
            <div className="absolute inset-0 mesh-bg opacity-20 pointer-events-none" />

            {/* Header */}
            <div className="max-w-7xl w-full mx-auto flex flex-row justify-between items-center gap-2 md:gap-8 mb-2 md:mb-10 shrink-0 px-3 md:px-0 pt-2 md:pt-0">
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="p-1.5 md:p-3 glass-panel border-cyan-500/20 bg-cyan-500/5">
                        <ShoppingBag className="w-4 h-4 md:w-8 md:h-8 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-7xl font-black uppercase tracking-tighter italic text-white leading-none">
                            {t(TL.ui.market, lang)}
                        </h1>
                        <div className="hidden md:flex items-center gap-2 md:gap-3 mt-1 md:mt-2">
                            <MonitorDot className="w-2 md:w-3 md:h-3 text-cyan-400 animate-pulse" />
                            <span className="text-[7px] md:text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
                                {t(TL.ui.tradingTerminal, lang)} v.4.5 [SHADOW_REV]
                            </span>
                        </div>
                    </div>
                </div>

                <div className="glass-panel px-2 md:px-8 py-1.5 md:py-5 border-cyan-500/20 bg-cyan-500/5 flex flex-col">
                    <span className="text-[6px] md:text-[9px] font-black text-white/30 uppercase tracking-widest mb-0.5 md:mb-1 leading-none">{t(TL.ui.creditReserve, lang)}</span>
                    <div className="flex items-center gap-1 md:gap-3">
                        <div className="text-sm md:text-3xl font-black text-white tracking-tighter italic">
                            {Math.floor(resources.credits || 0).toLocaleString()}
                        </div>
                        <span className="text-[6px] md:text-xs font-black text-cyan-400 px-1 py-0.5 glass-panel bg-cyan-500/10 border-cyan-500/20">CR</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl w-full mx-auto flex flex-col gap-6 md:gap-10 md:flex-1 relative">
                {/* MARKET BLOCKED OVERLAY */}
                <AnimatePresence>
                    {isMarketBlocked && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 glass-panel border-red-500/40 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
                        >
                            <ShieldAlert className="w-24 h-24 text-red-500 mb-6 animate-pulse" />
                            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">
                                {lang === 'RU' ? 'ТОРГОВЫЙ ТЕРМИНАЛ ЗАБЛОКИРОВАН' : 'TRADING TERMINAL BLOCKED'}
                            </h2>
                            <div className="text-3xl font-black text-white italic bg-red-500/10 px-8 py-4 border border-red-500/20">
                                {Math.ceil(marketBlockedTimeRemainingSeconds / 60)} {lang === 'RU' ? 'МИН. ОСТАЛОСЬ' : 'MIN. REMAINING'}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex flex-col gap-4 md:gap-6 md:flex-1">
                    {/* Tabs */}
                    <div className="flex gap-1 md:gap-2 glass-panel p-1 md:p-2 border-white/5 bg-black/60 shrink-0 overflow-x-auto scrollbar-hide touch-pan-x">
                        <TabBtn active={activeTab === 'regular'} onClick={() => setActiveTab('regular')} icon={<BarChart3 />} label={TL.ui.market} lang={lang} color="cyan" />
                        {hasBlackMarket && <TabBtn active={activeTab === 'black_market'} onClick={() => setActiveTab('black_market')} icon={<Fingerprint />} label={TL.ui.shadow_network} lang={lang} color="purple" />}
                        {hasBlackMarket && <TabBtn active={activeTab === 'smuggling'} onClick={() => setActiveTab('smuggling')} icon={<Zap />} label={{ RU: 'Контрабанда', EN: 'Smuggling' }} lang={lang} color="orange" />}
                        <TabBtn active={activeTab === 'exchange'} onClick={() => setActiveTab('exchange')} icon={<RefreshCcw />} label={TL.ui.exchange} lang={lang} color="amber" />
                    </div>

                    <div className="md:flex-1 md:overflow-y-auto pr-0 md:pr-4 scrollbar-hide space-y-4 md:space-y-6 pb-24 touch-pan-y">
                        <AnimatePresence mode="wait">
                            {/* REGULAR TAB (OMITTED FOR BREVITY AS IT IS UNCHANGED, but I should keep it for full file) */}
                            {activeTab === 'regular' && (
                                <motion.div key="regular" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-5">
                                    {marketPrices.map(price => {
                                        const category = economySystem.getCategory(price.resource as any);
                                        const state = useGameStore.getState();
                                        const saturationMult = economySystem.calculateSaturationMult(state, currentRegion, category);
                                        if (['nanoSwarm', 'ancientTech', 'rubies'].includes(price.resource)) return null;
                                        const isSelected = price.resource === selectedResource;
                                        const hasResource = (resources[price.resource] || 0) > 0;
                                        return (
                                            <div key={price.resource} className={`glass-panel p-5 md:p-6 cursor-pointer transition-all ${isSelected ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}>
                                                <div onClick={() => { setSelectedResource(price.resource as any); setExpandedResource(expandedResource === price.resource ? null : price.resource as any); setAmount(1); }} className="flex items-center justify-between mb-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2.5 glass-panel rounded-lg border-white/10 ${isSelected ? 'text-cyan-400 bg-cyan-400/5' : 'text-white/20'}`}>
                                                            <Package className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-black text-sm uppercase tracking-widest text-white leading-none mb-1">{t(TL.resources[price.resource], lang)}</h3>
                                                            <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">{t(TL.ui.rawMaterialType, lang)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-6 bg-black/20 p-4 rounded-xl border border-white/5">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">КУПИТЬ</span>
                                                        <div className="flex items-baseline gap-1.5"><span className="text-2xl font-black text-white">{Math.floor(price.finalPrice)}</span><span className="text-[9px] font-bold text-cyan-400">CR</span></div>
                                                    </div>
                                                    <div className="flex flex-col gap-1.5 text-right">
                                                        <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">ПРОДАТЬ</span>
                                                        <div className="flex items-baseline justify-end gap-1.5"><span className={`text-2xl font-black ${saturationMult < 1.0 ? 'text-orange-400' : 'text-cyan-400'}`}>{Math.floor(price.finalPrice * 0.8 * saturationMult)}</span><span className="text-[9px] font-bold text-cyan-400">CR</span></div>
                                                    </div>
                                                </div>
                                                {expandedResource === price.resource && (
                                                    <div className="pt-5 mt-5 border-t border-cyan-500/20 space-y-4" onClick={e => e.stopPropagation()}>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {[1, 10, 50, 100].map(val => (
                                                                <button key={val} onClick={() => setAmount(val)} className={`flex-1 py-3 font-black text-xs uppercase rounded-lg ${amount === val ? 'bg-cyan-500 text-black' : 'bg-white/10 text-white/60'}`}>{val}</button>
                                                            ))}
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <button onClick={() => { if ((resources.credits || 0) >= price.finalPrice * amount) buyFromMarket(price.resource as any, amount); }} className="py-4 font-black text-sm uppercase bg-white text-black rounded-xl">{t(TL.ui.buy, lang)}</button>
                                                            <button onClick={() => { if ((resources[price.resource] || 0) >= amount) sellToMarket(price.resource as any, amount); }} className="py-4 font-black text-sm uppercase bg-cyan-500 text-black rounded-xl">{t(TL.ui.sell, lang)}</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </motion.div>
                            )}

                            {activeTab === 'smuggling' && (
                                <motion.div key="smuggling" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
                                    {/* Smuggling Stats & Bonuses */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="glass-panel p-6 border-orange-500/20 bg-orange-500/5 flex items-center justify-between">
                                            <div>
                                                <div className="text-[10px] text-orange-400 font-bold uppercase mb-1">УРОВЕНЬ РИСКА</div>
                                                <div className="text-3xl font-black text-white">{(blackMarkets[currentRegion]?.currentRisk || 0).toFixed(1)}%</div>
                                            </div>
                                            <ShieldAlert className={`w-12 h-12 ${(blackMarkets[currentRegion]?.currentRisk || 0) > RAID_THRESHOLDS.WARNING ? 'text-red-500 animate-pulse' : 'text-orange-500/40'}`} />
                                        </div>
                                        <div className="glass-panel p-6 border-purple-500/20 bg-purple-500/5 flex flex-col justify-center gap-2">
                                            <div className="flex justify-between items-center">
                                                <div className="text-[10px] text-purple-400 font-bold uppercase">РЕПУТАЦИЯ ЛИСЫ</div>
                                                <div className="text-lg font-black text-white">{foxReputation}/100</div>
                                            </div>
                                            <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                                <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${foxReputation}%` }} />
                                            </div>
                                        </div>
                                        <div className="glass-panel p-4 border-emerald-500/20 bg-emerald-500/5 flex flex-col gap-1.5 overflow-hidden">
                                            <div className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> БОНУСЫ СЕТИ</div>
                                            <div className={`text-[8px] flex items-center gap-2 ${foxReputation >= 25 ? 'text-emerald-400' : 'text-white/20'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${foxReputation >= 25 ? 'bg-emerald-400' : 'bg-white/10'}`} />
                                                Shadow Network (Decay +20%)
                                            </div>
                                            <div className={`text-[8px] flex items-center gap-2 ${foxReputation >= 50 ? 'text-emerald-400' : 'text-white/20'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${foxReputation >= 50 ? 'bg-emerald-400' : 'bg-white/10'}`} />
                                                Inside Man (Penalties -30%)
                                            </div>
                                            <div className={`text-[8px] flex items-center gap-2 ${foxReputation >= 100 ? 'text-emerald-400' : 'text-white/20'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${foxReputation >= 100 ? 'bg-emerald-400' : 'bg-white/10'}`} />
                                                Untouchable (Avoid 15%)
                                            </div>
                                        </div>
                                    </div>

                                    {/* SPECIAL ORDER SECTION */}
                                    {activeQuest && (
                                        <div className="glass-panel p-6 border-purple-500/40 bg-purple-500/10 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform">
                                                <Target className="w-32 h-32 text-purple-400" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Zap className="w-5 h-5 text-orange-400 animate-pulse" />
                                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">СПЕЦИАЛЬНЫЙ ЗАКАЗ: {t(TL.resources[activeQuest.resource], lang)}</h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div className="space-y-1">
                                                        <div className="text-[10px] text-white/40 font-bold uppercase">НУЖНО ДОСТАВИТЬ</div>
                                                        <div className="text-2xl font-black text-white">{activeQuest.amount} <span className="text-xs text-purple-400">ЕД.</span></div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-[10px] text-white/40 font-bold uppercase">НАГРАДА</div>
                                                        <div className="text-2xl font-black text-white">{activeQuest.rewardCredits.toLocaleString()} <span className="text-xs text-orange-400">CR</span></div>
                                                        <div className="text-[9px] text-purple-400 font-bold">+{activeQuest.rewardFoxRep} FOX REP</div>
                                                    </div>
                                                    <div className="flex items-end">
                                                        {activeQuest.status === 'ACTIVE' ? (
                                                            <button
                                                                onClick={() => completeSmugglingQuest(currentRegion)}
                                                                disabled={(resources[activeQuest.resource] || 0) < activeQuest.amount}
                                                                className="w-full py-4 bg-purple-600 text-white font-black uppercase text-xs rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:bg-purple-500 transition-all disabled:opacity-20 flex items-center justify-center gap-2"
                                                            >
                                                                <CheckCircle2 className="w-4 h-4" /> ВЫПОЛНИТЬ ЗАКАЗ
                                                            </button>
                                                        ) : (
                                                            <div className={`w-full py-4 text-center font-black uppercase text-xs border rounded-xl ${activeQuest.status === 'COMPLETED' ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' : 'border-red-500/40 text-red-500 bg-red-500/10'}`}>
                                                                {activeQuest.status === 'COMPLETED' ? 'ЗАКАЗ ВЫПОЛНЕН' : 'СРОК ИСТЕК'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex items-center gap-4">
                                                    <div className="flex-1 h-1 bg-black/40 rounded-full overflow-hidden">
                                                        <div className="h-full bg-purple-500" style={{ width: `${Math.max(0, (activeQuest.expiryTime - gameTime) / (72 * 3600)) * 100}%` }} />
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-bold">
                                                        <Clock className="w-3 h-3" />
                                                        {Math.floor((activeQuest.expiryTime - gameTime) / 3600)}Ч ОСТАЛОСЬ
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Smuggling Resources List */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {blackMarkets[currentRegion]?.availableResources.map(res => (
                                            <div key={res.resource} className="glass-panel p-5 border-white/5 bg-white/5 hover:border-orange-500/40 transition-all group relative overflow-hidden">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 glass-panel flex items-center justify-center text-orange-400 bg-orange-400/5 group-hover:scale-110 transition-transform">
                                                            <Package className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-white uppercase italic text-sm">{t(TL.resources[res.resource], lang)}</div>
                                                            <div className="text-[8px] font-bold text-white/30 uppercase tracking-widest leading-none">
                                                                {lang === 'RU' ? SMUGGLING_CATEGORIES[res.category].description.RU : SMUGGLING_CATEGORIES[res.category].description.EN}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xl font-black text-orange-400">{Math.floor(100 * res.priceMultiplier)} <span className="text-[10px] opacity-60">CR</span></div>
                                                        <div className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">За единицу / UNIT</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex justify-between text-[8px] font-bold text-white/20 uppercase mb-1">
                                                            <span>РИСК ПАРТИИ</span>
                                                            <span className="text-orange-400">+{res.riskPerUnit}%</span>
                                                        </div>
                                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                            <div className="h-full bg-orange-500/50" style={{ width: `${res.riskPerUnit * 10}%` }} />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <SmugglingBtn amount={1} resource={res.resource} regionId={currentRegion} disabled={(resources[res.resource] || 0) < 1 || blackMarkets[currentRegion]?.status === 'BLOCKED'} onClick={sellToBlackMarket} />
                                                        <SmugglingBtn amount={10} resource={res.resource} regionId={currentRegion} disabled={(resources[res.resource] || 0) < 10 || blackMarkets[currentRegion]?.status === 'BLOCKED'} onClick={sellToBlackMarket} />
                                                    </div>
                                                </div>
                                                {(resources[res.resource] || 0) > 0 && (
                                                    <div className="mt-3 text-[9px] font-bold text-emerald-400/60 uppercase tracking-widest text-center border-t border-white/5 pt-2">
                                                        {lang === 'RU' ? 'В ТРЮМЕ' : 'IN CARGO'}: {resources[res.resource]}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'black_market' && (
                                <motion.div key="black_market" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {BLACK_MARKET_ITEMS.map(item => {
                                        const isOwned = item.type === 'BLUEPRINT' && item.targetId ? unlockedBlueprints.includes(item.targetId) : false;
                                        const canAfford = item.cost.every(c => (resources[c.resource] || 0) >= c.amount);
                                        const repLevelMet = foxReputation >= (item.requiredReputation || 0); // Assuming reputation is separate now or using foxRep

                                        return (
                                            <div key={item.id} className={`glass-panel p-6 border-white/5 bg-white/5 relative overflow-hidden ${isOwned ? 'opacity-40 grayscale' : 'hover:border-purple-500/40'}`}>
                                                {!repLevelMet && (
                                                    <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                                                        <Lock className="w-10 h-10 text-purple-500 mb-2" />
                                                        <div className="text-[10px] font-black text-white uppercase tracking-widest">ТРЕБУЕТСЯ РЕПУТАЦИЯ ЛИСЫ</div>
                                                        <div className="text-2xl font-black text-purple-400 italic">{item.requiredReputation}</div>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-10 h-10 glass-panel flex items-center justify-center text-purple-400 bg-purple-400/5">
                                                        {item.type === 'BLUEPRINT' ? <ScrollText /> : <MonitorDot />}
                                                    </div>
                                                    <h4 className="font-black text-white uppercase italic tracking-tighter">{t(item.name, lang)}</h4>
                                                </div>
                                                <p className="text-[10px] text-white/40 mb-6 h-10 overflow-hidden leading-relaxed">{t(item.description, lang)}</p>
                                                <div className="flex justify-between items-end border-t border-white/5 pt-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        {item.cost.map(c => (
                                                            <div key={c.resource} className="flex items-baseline gap-2 text-white">
                                                                <span className="text-xl font-black italic">{c.amount.toLocaleString()}</span>
                                                                <span className="text-[8px] text-purple-400 font-bold uppercase tracking-widest">{t(TL.resources[c.resource], lang)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button
                                                        onClick={() => buyBlackMarketItem(item.id)}
                                                        disabled={isOwned || !canAfford || !repLevelMet}
                                                        className="px-6 py-3 bg-purple-600 text-white rounded-lg font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:bg-purple-500 transition-all active:scale-95 disabled:grayscale disabled:opacity-20"
                                                    >
                                                        {isOwned ? 'КУПЛЕНО' : 'КУПИТЬ'}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </motion.div>
                            )}

                            {activeTab === 'exchange' && (
                                <motion.div key="exchange" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-panel p-4 md:p-10 border-amber-500/20 bg-amber-500/5 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                                    <div className="max-w-2xl mx-auto space-y-8 md:space-y-12 text-center py-6">
                                        <div className="w-20 h-20 glass-panel border-amber-400/30 bg-amber-400/10 flex items-center justify-center rounded-3xl mx-auto rotate-12 group-hover:rotate-0 transition-transform">
                                            <RefreshCcw className="w-10 h-10 text-amber-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">{t(TL.ui.resourceConversion, lang)}</h3>
                                            <p className="text-[10px] text-amber-500/60 font-black uppercase tracking-[0.4em]">{t(TL.ui.directExchangeDesc, lang)}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {['iron', 'copper', 'coal', 'gold'].map(res => (
                                                <button
                                                    key={res}
                                                    onClick={() => setSelectedResource(res as any)}
                                                    className={`p-6 glass-panel text-left border-white/5 transition-all
                                                                ${selectedResource === res ? 'bg-amber-500 text-black border-amber-400 scale-[1.02] shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:border-white/20'}
                                                            `}
                                                >
                                                    <div className="text-[9px] font-black uppercase mb-1 tracking-widest">{t(TL.resources[res as keyof Resources], lang)}</div>
                                                    <div className="font-black text-2xl italic">{(resources[res as keyof Resources] || 0).toLocaleString()}</div>
                                                </button>
                                            ))}
                                        </div>
                                        {selectedResource && (
                                            <div className="pt-8 space-y-4">
                                                <div className="flex justify-between items-center text-[10px] text-white/30 font-black uppercase tracking-widest px-2">
                                                    <span>РАСХОД: 100 ЕД.</span>
                                                    <span>ВЫХОД: ~25.0 ТОПЛИВА</span>
                                                </div>
                                                <button
                                                    onClick={() => exchangeResourceForFuel?.(selectedResource, 100)}
                                                    disabled={(resources[selectedResource] || 0) < 100}
                                                    className="w-full py-6 bg-amber-500 text-black font-black uppercase text-sm rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.3)] hover:bg-amber-400 transition-all active:scale-95 disabled:grayscale disabled:opacity-20 italic tracking-[0.3em]"
                                                >
                                                    {t(TL.ui.processConversion, lang)}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SmugglingBtn = ({ amount, resource, regionId, disabled, onClick }: { amount: number, resource: ResourceType, regionId: any, disabled: boolean, onClick: any }) => (
    <button
        onClick={() => onClick(regionId, resource, amount)}
        disabled={disabled}
        className={`px-3 py-2 rounded font-black text-[10px] uppercase transition-all
                    ${!disabled ? 'bg-orange-500 text-black hover:bg-orange-400 active:scale-95' : 'bg-white/5 text-white/10 cursor-not-allowed'}
                `}
    >
        +{amount}
    </button>
);

const TabBtn = ({ active, onClick, icon, label, lang, color }: { active: boolean, onClick: () => void, icon: any, label: any, lang: string, color: string }) => {
    const colorClasses = {
        cyan: active ? 'text-black bg-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-white/40 hover:text-white/60 hover:bg-white/5',
        purple: active ? 'text-white bg-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.3)]' : 'text-purple-400/40 hover:text-purple-400/60 hover:bg-purple-500/5',
        orange: active ? 'text-black bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'text-orange-400/40 hover:text-orange-400/60 hover:bg-orange-400/5',
        amber: active ? 'text-black bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'text-amber-500/40 hover:text-amber-500/60 hover:bg-amber-500/5'
    };

    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 rounded-lg font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all relative overflow-hidden group shrink-0 min-h-[44px]
                ${(colorClasses as any)[color]}
            `}
        >
            <span className="transition-transform group-hover:scale-110 [&>svg]:w-3.5 [&>svg]:h-3.5 md:[&>svg]:w-4 md:[&>svg]:h-4">{icon}</span>
            <span className="whitespace-nowrap">{t(label, lang as any)}</span>
            {active && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />}
        </button>
    );
};

