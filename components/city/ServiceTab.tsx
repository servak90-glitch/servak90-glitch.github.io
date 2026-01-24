import React from 'react';
import { ServiceTabProps } from './types';
import { ResourceType, Resources } from '../../types';
import { useGameStore } from '../../store/gameStore';
import { calculateRepairCost, getResourceLabel } from '../../services/gameMath';
import { CITY_SERVICE, PREMIUM_BUFFS } from '../../constants/balance';
import { t, TL } from '../../services/localization';
import {
    Snowflake,
    Shield,
    Sparkles,
    Clock,
    Zap,
    Hammer
} from 'lucide-react';

const BuffIcon = ({ icon }: { icon: string }) => {
    switch (icon) {
        case '🛠️': return <Hammer className="w-6 h-6" />;
        case '✨': return <Sparkles className="w-6 h-6" />;
        case '🛡️': return <Shield className="w-6 h-6" />;
        case '🍀': return <Sparkles className="w-6 h-6 text-yellow-400" />;
        case '❄️': return <Snowflake className="w-6 h-6" />;
        case '🧲': return <Zap className="w-6 h-6" />;
        case '☢️': return <Zap className="w-6 h-6 text-red-500" />;
        case '⏳': return <Clock className="w-6 h-6" />;
        default: return <Sparkles className="w-6 h-6" />;
    }
};

const ServiceTab: React.FC<ServiceTabProps> = ({
    resources,
    depth,
    heat,
    integrity,
    maxIntegrity,
    onHeal,
    onRepair
}) => {
    const buyCityBuff = useGameStore(s => s.buyCityBuff);
    const lang = useGameStore(s => s.settings.language);
    const freeCoolingLastUsed = useGameStore(s => s.freeCoolingLastUsed);

    const [cooldownRemaining, setCooldownRemaining] = React.useState(0);

    const isPaidCooling = depth >= CITY_SERVICE.PAID_COOLING_DEPTH;
    const coolingRes = depth > CITY_SERVICE.GOLD_COOLING_DEPTH ? 'gold' : 'stone';
    const coolingRate = depth > CITY_SERVICE.GOLD_COOLING_DEPTH ? CITY_SERVICE.COOLING_RATE_GOLD : CITY_SERVICE.COOLING_RATE_STONE;
    const coolingCost = Math.ceil(heat * coolingRate);
    const canAffordCooling = !isPaidCooling || resources[coolingRes as keyof Resources] >= coolingCost;

    // Обновление таймера кулдауна каждую секунду
    React.useEffect(() => {
        if (isPaidCooling) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const timeSinceLastUse = now - (freeCoolingLastUsed || 0);
            const remaining = Math.max(0, CITY_SERVICE.FREE_COOLING_COOLDOWN_MS - timeSinceLastUse);
            setCooldownRemaining(remaining);
        }, 1000);

        return () => clearInterval(interval);
    }, [freeCoolingLastUsed, isPaidCooling]);

    const isOnCooldown = !isPaidCooling && cooldownRemaining > 0;
    const canUseCooling = heat >= 1 && !isOnCooldown && canAffordCooling;

    // Форматирование времени MM:SS
    const formatTime = (ms: number) => {
        const totalSeconds = Math.ceil(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const repairInfo = calculateRepairCost(depth, integrity, maxIntegrity);
    const repairRes = repairInfo.resource;
    const fullRepairCost = repairInfo.cost;
    const canAffordRepair = resources[repairRes] >= fullRepairCost;
    const missingHp = maxIntegrity - integrity;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* COOLING SECTION: SCI-FI CARD */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-cyan-500/20 to-transparent blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                    <div className="relative bg-black/60 backdrop-blur-xl border border-white/5 p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-cyan-500/10 rounded-sm border border-cyan-500/20">
                                <Snowflake className="w-5 h-5 text-cyan-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white tracking-[0.2em] uppercase">{t(TL.ui.coolingSystem, lang)}</h3>
                                <div className="h-0.5 w-8 bg-cyan-500 mt-1" />
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="flex justify-between text-[10px] font-black font-mono text-zinc-500 mb-2 uppercase tracking-tighter">
                                <span>{t(TL.ui.currentHeat, lang)}</span>
                                <span className={heat > 80 ? "text-red-500 animate-pulse" : "text-cyan-400"}>{heat.toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden p-[1px]">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(6,182,212,0.4)]
                                        ${heat > 80 ? 'bg-gradient-to-r from-red-600 to-orange-500' : 'bg-gradient-to-r from-cyan-600 to-blue-400'}`}
                                    style={{ width: `${heat}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-6 bg-white/5 p-3 border border-white/5 rounded-sm">
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{t(TL.ui.cost_label, lang)}</span>
                            {isPaidCooling ? (
                                <span className={`text-xs font-black font-mono ${canAffordCooling ? 'text-white' : 'text-red-500'}`}>
                                    {coolingCost} {t(getResourceLabel(coolingRes), lang)}
                                </span>
                            ) : (
                                <span className="text-xs font-black text-green-400 tracking-widest">{t(TL.ui.free_label, lang)}</span>
                            )}
                        </div>

                        {/* Cooldown Timer */}
                        {!isPaidCooling && isOnCooldown && (
                            <div className="mb-6 text-center py-2 bg-amber-500/10 border border-amber-500/20 rounded-sm">
                                <span className="text-[10px] text-amber-400 font-black font-mono uppercase tracking-[0.1em]">
                                    <Clock className="w-3 h-3 inline-block mr-1" /> {t(TL.ui.cooldown_label, lang)}: {formatTime(cooldownRemaining)}
                                </span>
                            </div>
                        )}

                        <button
                            onClick={onHeal}
                            disabled={!canUseCooling}
                            className={`w-full py-4 font-black transition-all duration-300 uppercase tracking-[0.2em] text-[10px] relative overflow-hidden group/btn
                                ${heat < 1 ? 'bg-white/5 text-zinc-600 cursor-not-allowed border border-white/5' :
                                    !canUseCooling ? 'bg-white/5 text-zinc-600 cursor-not-allowed border border-white/5' :
                                        'bg-cyan-500 text-black hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]'}`}
                        >
                            {heat < 1
                                ? t(TL.ui.systemNormal, lang)
                                : isOnCooldown
                                    ? formatTime(cooldownRemaining)
                                    : canAffordCooling
                                        ? t(TL.ui.emergencyPurge, lang)
                                        : 'Low Resources'
                            }
                        </button>
                    </div>
                </div>

                {/* HULL REPAIR SECTION: SCI-FI CARD */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-green-500/20 to-transparent blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                    <div className="relative bg-black/60 backdrop-blur-xl border border-white/5 p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-green-500/10 rounded-sm border border-green-500/20">
                                <Shield className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white tracking-[0.2em] uppercase">{t(TL.ui.repairDock, lang)}</h3>
                                <div className="h-0.5 w-8 bg-green-500 mt-1" />
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="flex justify-between text-[10px] font-black font-mono text-zinc-500 mb-2 uppercase tracking-tighter">
                                <span>{t(TL.ui.hullIntegrity, lang)}</span>
                                <span className={integrity < maxIntegrity * 0.3 ? "text-red-500 font-bold" : "text-green-400"}>
                                    {Math.floor(integrity)} / {maxIntegrity}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden p-[1px]">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(34,197,94,0.4)]
                                        ${integrity < maxIntegrity * 0.3 ? 'bg-gradient-to-r from-red-600 to-orange-500' : 'bg-gradient-to-r from-green-600 to-emerald-400'}`}
                                    style={{ width: `${(integrity / maxIntegrity) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-6 bg-white/5 p-3 border border-white/5 rounded-sm">
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{t(TL.ui.fullRepair, lang)}</span>
                            <span className={`text-xs font-black font-mono ${canAffordRepair ? 'text-white' : 'text-red-500'}`}>
                                {fullRepairCost} {t(getResourceLabel(repairRes), lang)}
                            </span>
                        </div>

                        <button
                            onClick={() => onRepair()}
                            disabled={missingHp <= 0 || !canAffordRepair}
                            className={`w-full py-4 font-black transition-all duration-300 uppercase tracking-[0.2em] text-[10px]
                                ${missingHp <= 0 ? 'bg-white/5 text-zinc-600 cursor-not-allowed border border-white/5' :
                                    canAffordRepair ? 'bg-green-600 text-white hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]' :
                                        'bg-red-950/30 text-red-700 border border-red-900/50 cursor-not-allowed'}
                            `}
                        >
                            {missingHp <= 0 ? t(TL.ui.noDamage, lang) : canAffordRepair ? t(TL.ui.restoreHull, lang) : 'Low Resources'}
                        </button>
                    </div>
                </div>
            </div>

            {/* PREMIUM BUFFS: HORIZONTAL LIST */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 via-transparent to-amber-500/20 blur opacity-30"></div>
                <div className="relative bg-black/40 backdrop-blur-md border border-white/5 p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-amber-500/10 rounded-sm border border-amber-500/20">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <h3 className="text-xs md:text-sm font-black text-amber-500 tracking-[0.3em] uppercase">{t(TL.ui.premiumService, lang)}</h3>
                            <div className="h-0.5 w-12 bg-amber-500 mt-1" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {PREMIUM_BUFFS.map(buff => {
                            const canBuy = resources[buff.res as keyof Resources] >= buff.cost;
                            return (
                                <div key={buff.id} className="group/item relative bg-white/5 border border-white/5 p-4 transition-all hover:bg-white/10 hover:border-amber-500/30">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="group-hover/item:scale-110 transition-transform">
                                            <BuffIcon icon={buff.icon} />
                                        </div>
                                        <div className={`text-[8px] font-black px-2 py-0.5 border rounded-full ${canBuy ? 'border-green-500/50 text-green-400' : 'border-red-500/50 text-red-400'}`}>
                                            {buff.cost} {t(getResourceLabel(buff.res), lang)}
                                        </div>
                                    </div>
                                    <div className={`text-[10px] font-black ${buff.color} uppercase tracking-widest mb-1 truncate`}>{t(buff.name, lang)}</div>
                                    <div className="text-[9px] text-zinc-500 font-mono leading-tight h-8 overflow-hidden mb-4">{t(buff.desc, lang)}</div>

                                    <button
                                        onClick={() => buyCityBuff(buff.cost, buff.res as ResourceType, buff.effectId)}
                                        disabled={!canBuy}
                                        className={`w-full py-2 text-[8px] font-black uppercase tracking-widest transition-all
                                            ${canBuy ? 'bg-amber-600 text-black hover:bg-amber-500' : 'bg-transparent text-zinc-700 border border-zinc-800 cursor-not-allowed'}`}
                                    >
                                        Activate Protocol
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceTab;
