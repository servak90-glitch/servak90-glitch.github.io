import React from 'react';
import { UpgradeCardProps } from './types';
import { Resources } from '../../types';
import { getResourceLabel } from '../../services/gameMath';
import { useGameStore } from '../../store/gameStore';
import { t, TL } from '../../services/localization';
import { audioEngine } from '../../services/audioEngine';
import {
    ChevronRight,
    Lock,
    Zap,
    Scroll,
    CheckCircle2,
    AlertCircle,
    Boxes
} from 'lucide-react';

const UpgradeCard: React.FC<UpgradeCardProps> = ({ title, current, next, type, resources, onStartCraft, craftingQueue }) => {
    const lang = useGameStore(s => s.settings.language);
    const unlockedBlueprints = useGameStore(s => s.unlockedBlueprints);

    if (!next) return (
        <div className="glass-panel p-4 opacity-50 flex flex-col justify-between min-h-[220px] bg-white/5 border-white/5 grayscale">
            <div>
                <h3 className="text-white/40 font-bold mb-2 font-technical text-xs tracking-widest">{title}</h3>
                <div className="text-[11px] text-white/20 font-technical mb-2 uppercase">{t(TL.ui.protocolMax, lang)}</div>
                <div className="flex items-center gap-1.5 text-xs text-white/30 font-technical">
                    <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">{t(TL.ui.level_label, lang)} {current.tier}</span>
                </div>
            </div>
        </div>
    );

    const isFusionLocked = next.tier >= 13;
    const requiresBlueprint = next.blueprintId;
    const hasBlueprint = !requiresBlueprint || unlockedBlueprints.includes(requiresBlueprint);
    const isAlreadyCrafting = craftingQueue.some(job => job.partId === next.id);

    const cost = (next.cost || {}) as Partial<Resources>;
    const costKeys = Object.keys(cost) as Array<keyof Resources>;
    const canAfford = !isFusionLocked && hasBlueprint && !isAlreadyCrafting && costKeys.every(r => resources[r] >= (cost[r] || 0));

    return (
        <div className={`glass-panel p-5 flex flex-col justify-between min-h-[280px] transition-all duration-300 group relative hover:translate-y-[-2px] 
            ${canAfford ? 'hover:bg-white/[0.07] hover:border-white/20 shadow-lg' : 'bg-void/40'}
        `}>
            <div>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-cyan-400 font-bold font-technical text-sm tracking-widest leading-none truncate group-hover:text-white transition-colors">{title}</h3>
                    <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded border border-white/5 text-[10px] font-technical text-white/40">
                        <span>{current.tier}</span>
                        <ChevronRight className="w-3 h-3 text-cyan-500/50" />
                        <span className="text-white font-bold">{next.tier}</span>
                    </div>
                </div>

                <div className="bg-white/5 rounded-sm p-3 mb-4 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-cyan-500/10 to-transparent pointer-events-none" />
                    <p className="text-[10px] text-white/50 italic leading-snug mb-3 font-medium">
                        "{t(next.description, lang)}"
                    </p>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-white/5 pt-2">
                        {renderStat(t(TL.ui.statDmg, lang), (next.baseStats as any).damage, "text-red-400")}
                        {renderStat(t(TL.ui.statSpd, lang), (next.baseStats as any).speed, "text-cyan-400")}
                        {renderStat(t(TL.ui.statCool, lang), (next.baseStats as any).cooling, "text-blue-400")}
                        {renderStat(t(TL.ui.statPwr, lang), (next.baseStats as any).energyOutput, "text-yellow-400")}
                        {renderStat(t(TL.ui.statReg, lang), (next.baseStats as any).regen, "text-emerald-400")}
                        {renderStat(t(TL.ui.statCrg, lang), (next.baseStats as any).cargoCapacity, "text-amber-400")}
                    </div>
                </div>

                {requiresBlueprint && (
                    <div className={`flex items-center gap-2 text-[10px] font-bold font-technical px-3 py-1.5 mb-4 rounded border transition-colors
                        ${hasBlueprint
                            ? 'bg-purple-950/20 border-purple-500/30 text-purple-400'
                            : 'bg-red-950/20 border-red-500/30 text-red-400 animate-pulse'}
                    `}>
                        {hasBlueprint ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Scroll className="w-3.5 h-3.5" />}
                        {hasBlueprint ? t(TL.ui.schematicLoaded, lang) : t(TL.ui.schematicRequired, lang)}
                    </div>
                )}

                <div className="space-y-2 mb-5">
                    {isFusionLocked ? (
                        <div className="flex items-center justify-center gap-2 bg-purple-500/10 border border-purple-500/30 p-2 rounded text-[10px] text-purple-400 font-bold uppercase tracking-widest animate-pulse">
                            <Lock className="w-3.5 h-3.5" />
                            {t(TL.ui.fusionRequired, lang)}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 opacity-40 mb-1">
                                <Boxes className="w-3 h-3" />
                                <span className="text-[9px] font-technical uppercase">{t(TL.ui.requiredMaterials, lang)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {costKeys.map(res => (
                                    <div key={res} className="flex justify-between items-center text-[10px] font-technical border-b border-white/5 pb-0.5">
                                        <span className="text-white/40 uppercase text-[9px]">{t(getResourceLabel(res), lang)}</span>
                                        <span className={resources[res] >= (cost[res] || 0) ? 'text-green-400' : 'text-red-400'}>
                                            {formatVal(cost[res] || 0)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <button
                disabled={!canAfford}
                onClick={() => {
                    onStartCraft(next.id, type);
                    audioEngine.playBaseBuild(next.id as any);
                }}
                className={`w-full py-3.5 rounded text-[11px] font-bold font-technical transition-all flex items-center justify-center gap-2 relative overflow-hidden group/btn
                    ${isFusionLocked
                        ? 'bg-purple-900/10 border border-purple-900/30 text-purple-900/50 cursor-not-allowed'
                        : canAfford
                            ? 'bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] active:scale-95'
                            : 'bg-white/5 border border-white/10 text-white/20 cursor-not-allowed'}
                `}
            >
                {isFusionLocked ? (
                    t(TL.ui.fusionLocked, lang)
                ) : !hasBlueprint ? (
                    t(TL.ui.unavailable, lang)
                ) : isAlreadyCrafting ? (
                    <>
                        <Zap className="w-3.5 h-3.5 animate-pulse" />
                        <span>{t(TL.ui.processing, lang)}</span>
                    </>
                ) : canAfford ? (
                    <>
                        <HammerIcon />
                        <span className="tracking-widest uppercase">{t(TL.ui.initiateUpgrade, lang)}</span>
                    </>
                ) : (
                    t(TL.ui.insufficientFunds, lang)
                )}
                {canAfford && !isAlreadyCrafting && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                )}
            </button>
        </div>
    );
};

const renderStat = (label: string, val: any, color: string) => {
    if (val === undefined || val === 0) return null;
    return (
        <div className="flex justify-between items-center bg-black/20 px-1.5 py-0.5 rounded border border-white/[0.03]">
            <span className="text-[9px] text-white/30 font-technical uppercase">{label}</span>
            <span className={`text-[10px] font-technical font-bold ${color}`}>
                {val}{typeof val === 'number' && val > 0 && label === 'TRQ' ? '%' : ''}
            </span>
        </div>
    );
};

const formatVal = (v: number) => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v;

const HammerIcon = () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0-.83-.83-.83-2.17 0-3L12 9" />
        <path d="M17.64 15 22 10.64" />
        <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.31c0-1.55-1.1-2.85-2.63-3.03l-.53-.06c-1.29-.14-2.5.59-3.11 1.75l-.23.44a2.91 2.91 0 0 1-2.58 1.56H9.42c-1.53 0-2.85 1.06-3.13 2.56L6 12" />
    </svg>
);

export default UpgradeCard;
