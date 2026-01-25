import React, { useState } from 'react';
import { FusionTabProps } from './types';
import { Resources, InventoryItem } from '../../types';
import { useGameStore } from '../../store/gameStore';
import { FUSION_RECIPES } from '../../constants';
import { ARTIFACTS } from '../../services/artifactRegistry';
import { BITS, ENGINES, COOLERS, HULLS, LOGIC_CORES, CONTROL_UNITS, GEARBOXES, POWER_CORES, ARMORS } from '../../constants';
import { t, TEXT_IDS, TL } from '../../services/localization';
import { Activity, Zap, Thermometer, ShieldCheck, Atom, Fingerprint, ChevronRight, Package, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


const ALL_PARTS = [...BITS, ...ENGINES, ...COOLERS, ...HULLS, ...LOGIC_CORES, ...CONTROL_UNITS, ...GEARBOXES, ...POWER_CORES, ...ARMORS];

const FusionTab: React.FC<FusionTabProps> = ({
    resources,
    inventory,
    depth,
    heatStabilityTimer,
    integrity,
    drill
}) => {
    const [selectedArtifactsForFusion, setSelectedArtifactsForFusion] = useState<string[]>([]);
    const fusionUpgrade = useGameStore(s => s.fusionUpgrade);
    const transmuteArtifacts = useGameStore(s => s.transmuteArtifacts);
    const lang = useGameStore(s => s.settings.language);


    const inventoryList = Object.values(inventory) as InventoryItem[];

    const toggleArtifactSelection = (id: string) => {
        setSelectedArtifactsForFusion(prev => {
            if (prev.includes(id)) return prev.filter(x => x !== id);
            if (prev.length >= 3) return prev;

            const item = inventory[id];
            if (!item) return prev;
            const def = ARTIFACTS.find(a => a.id === item.defId);

            if (prev.length > 0) {
                const first = inventory[prev[0]];
                const firstDef = ARTIFACTS.find(a => a.id === first?.defId);
                if (firstDef?.rarity !== def?.rarity) return prev;
            }
            return [...prev, id];
        });
    };

    return (
        <div className="flex flex-col gap-10">
            {/* TRANSMUTATION */}
            <div className="glass-panel border-amber-500/20 bg-amber-500/5 p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Fingerprint className="w-32 h-32" />
                </div>

                <div className="flex flex-col md:flex-row gap-8 md:items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 glass-panel border-amber-500/30 bg-amber-500/10 flex items-center justify-center rounded-2xl rotate-3 group-hover:rotate-0 transition-transform">
                            <Fingerprint className="w-8 h-8 text-amber-500" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-1">{t(TEXT_IDS.TRANSMUTATION_TITLE, lang)}</h3>
                            <p className="text-[10px] text-amber-500/60 font-black uppercase tracking-[0.3em]">{t(TEXT_IDS.TRANSMUTATION_DESC, lang)}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            transmuteArtifacts(selectedArtifactsForFusion);
                            setSelectedArtifactsForFusion([]);
                        }}
                        disabled={selectedArtifactsForFusion.length !== 3}
                        className={`px-8 py-4 font-black uppercase tracking-[0.2em] italic text-xs transition-all flex items-center gap-3
                            ${selectedArtifactsForFusion.length === 3
                                ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                                : 'bg-white/5 text-white/10 border border-white/5 cursor-not-allowed'}
                        `}
                    >
                        {t(TEXT_IDS.TRANSMUTATION_BUTTON, lang)}
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3 p-4 glass-panel border-white/5 bg-black/40">
                    {inventoryList.filter(i => i.isIdentified && !i.isEquipped).map(item => {
                        const isSelected = selectedArtifactsForFusion.includes(item.instanceId);
                        const def = ARTIFACTS.find(a => a.id === item.defId);
                        return (
                            <button
                                key={item.instanceId}
                                onClick={() => toggleArtifactSelection(item.instanceId)}
                                className={`aspect-square border transition-all relative flex items-center justify-center text-2xl
                                    ${isSelected ? 'bg-amber-500/20 border-amber-500 scale-110 z-10 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'}
                                `}
                            >
                                {def?.icon}
                                {isSelected && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-black" />
                                )}
                            </button>
                        );
                    })}
                    {inventoryList.filter(i => i.isIdentified && !i.isEquipped).length === 0 && (
                        <div className="col-span-full text-center text-[10px] font-black uppercase tracking-widest text-white/20 py-8 italic">
                            {t(TEXT_IDS.TRANSMUTATION_NO_ARTIFACTS, lang)}
                        </div>
                    )}
                </div>
            </div>

            {/* FUSION RECIPES */}
            <div className="glass-panel border-purple-500/20 bg-purple-500/5 p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Atom className="w-32 h-32" />
                </div>

                <div className="flex items-center gap-6 mb-8 border-b border-purple-500/20 pb-6 relative z-10">
                    <div className="w-16 h-16 glass-panel border-purple-500/30 bg-purple-500/10 flex items-center justify-center rounded-2xl -rotate-3 group-hover:rotate-0 transition-transform">
                        <Atom className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-1">{t(TEXT_IDS.FUSION_ATOMIC_RECONSTRUCTOR, lang)}</h3>
                        <p className="text-[10px] text-purple-400/60 font-black uppercase tracking-[0.3em]">{lang === 'RU' ? 'СИНТЕЗ МОДУЛЕЙ ПРЕДЕЛЬНОГО УРОВНЯ' : 'ULTIMATE MODULE SYNTHESIS'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                    {FUSION_RECIPES.map((recipe, idx) => {
                        const targetPart = ALL_PARTS.find(p => p.id === recipe.resultId);
                        const hasCatalyst = (resources as any)[recipe.catalyst.resource] >= recipe.catalyst.amount;

                        let conditionMet = true;
                        let conditionStatus = t(TEXT_IDS.FUSION_COMPLETED, lang);
                        let StatusIcon = ShieldCheck;
                        let statusColor = "text-emerald-400";

                        if (recipe.condition) {
                            if (recipe.condition.type === 'DEPTH_REACHED') {
                                StatusIcon = Activity;
                                if (depth < recipe.condition.target) {
                                    conditionMet = false;
                                    conditionStatus = `${Math.floor(depth)} / ${recipe.condition.target}m`;
                                    statusColor = "text-rose-500";
                                }
                            } else if (recipe.condition.type === 'ZERO_HEAT') {
                                StatusIcon = Thermometer;
                                if (heatStabilityTimer < recipe.condition.target) {
                                    conditionMet = false;
                                    conditionStatus = `${heatStabilityTimer.toFixed(1)}s / ${recipe.condition.target}s`;
                                    statusColor = "text-orange-500";
                                }
                            } else if (recipe.condition.type === 'NO_DAMAGE') {
                                StatusIcon = ShieldCheck;
                                if (integrity < recipe.condition.target) {
                                    conditionMet = false;
                                    conditionStatus = t(TEXT_IDS.FUSION_HULL_DAMAGED, lang);
                                    statusColor = "text-rose-500";
                                }
                            }
                        }

                        // Находим текущую установленную деталь в этом слоте
                        let currentSlotPart: any = null;
                        const allPartsArrays = [[BITS, 'bit'], [ENGINES, 'engine'], [COOLERS, 'cooling'], [HULLS, 'hull'], [LOGIC_CORES, 'logic'], [CONTROL_UNITS, 'control'], [GEARBOXES, 'gearbox'], [POWER_CORES, 'power'], [ARMORS, 'armor']];

                        for (const [arr, slot] of allPartsArrays) {
                            if ((arr as any[]).some(p => p.id === recipe.resultId)) {
                                currentSlotPart = (drill as any)[slot as string];
                                break;
                            }
                        }

                        const isCorrectTierEquipped = currentSlotPart?.id === recipe.componentAId;
                        const isAlreadyUpgraded = currentSlotPart?.tier >= (targetPart?.tier || 99);
                        const canCraft = hasCatalyst && conditionMet && isCorrectTierEquipped;

                        return (
                            <motion.div
                                key={recipe.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`glass-panel border-white/5 bg-white/5 p-6 flex flex-col justify-between group/card hover:border-purple-500/40 transition-all relative overflow-hidden ${isAlreadyUpgraded ? 'opacity-60 grayscale-[0.5]' : ''}`}
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h4 className="text-xl font-black text-rose-500 uppercase italic tracking-tighter leading-none mb-1 group-hover/card:text-white transition-colors">
                                                {targetPart ? t(targetPart.name, lang) : recipe.resultId}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[8px] font-black bg-purple-500 text-white px-2 py-0.5 rounded-sm uppercase tracking-widest">{t(TL.ui.godly as any, lang)}</span>
                                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">TIER {targetPart?.tier || '??'}</span>
                                            </div>
                                        </div>
                                        <div className="p-2 glass-panel border-white/10 bg-white/5">
                                            <Atom className="w-5 h-5 text-purple-400" />
                                        </div>
                                    </div>

                                    <p className="text-[10px] text-white/40 font-black uppercase italic tracking-widest leading-relaxed mb-6 h-12 overflow-hidden border-l border-white/10 pl-3">
                                        {t(recipe.description, lang)}
                                    </p>

                                    <div className="space-y-4 mb-6">
                                        {/* Catalyst */}
                                        <div className="flex justify-between items-center p-3 glass-panel border-white/5 bg-black/20">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest italic">{t(TEXT_IDS.FUSION_REQUIRED, lang)}</span>
                                                <span className="text-xs font-black text-white uppercase">{t(TL.resources[recipe.catalyst.resource as any] as any, lang)}</span>
                                            </div>
                                            <span className={`text-xl font-black italic tracking-tighter ${hasCatalyst ? "text-white" : "text-rose-500"}`}>
                                                {recipe.catalyst.amount}
                                            </span>
                                        </div>

                                        {/* Condition */}
                                        {recipe.condition && (
                                            <div className="flex justify-between items-center p-3 glass-panel border-white/5 bg-black/20">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest italic">{t(recipe.condition.description, lang)}</span>
                                                    <StatusIcon className={`w-3 h-3 ${statusColor}`} />
                                                </div>
                                                <span className={`text-sm font-black italic tracking-tighter ${statusColor}`}>
                                                    {conditionStatus}
                                                </span>
                                            </div>
                                        )}

                                        {/* Hardware Check */}
                                        {!isCorrectTierEquipped && !isAlreadyUpgraded && (
                                            <div className="flex items-center gap-3 p-3 glass-panel border-rose-500/20 bg-rose-500/5">
                                                <Lock className="w-4 h-4 text-rose-500 shrink-0" />
                                                <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest leading-tight">
                                                    {t(TEXT_IDS.FUSION_PREVIOUS_TIER_REQUIRED, lang)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => fusionUpgrade(recipe.id)}
                                    disabled={!canCraft}
                                    className={`w-full py-5 font-black text-[10px] uppercase tracking-[0.3em] italic transition-all
                                        ${canCraft
                                            ? 'bg-purple-600 text-white hover:bg-white hover:text-black shadow-[0_0_30px_rgba(147,51,234,0.3)]'
                                            : isAlreadyUpgraded
                                                ? 'bg-emerald-500 text-black cursor-default'
                                                : 'bg-white/5 text-white/10 border border-white/5 cursor-not-allowed'}
                                    `}
                                >
                                    {isAlreadyUpgraded ? t(TEXT_IDS.FUSION_INSTALLED, lang) : canCraft ? t(TEXT_IDS.FUSION_SYNTHESIZE, lang) : t(TEXT_IDS.FUSION_UNAVAILABLE, lang)}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default FusionTab;
