import React from 'react';
import { DronesTabProps } from './types';
import { Resources } from '../../types';
import { useGameStore } from '../../store/gameStore';
import { DRONES } from '../../constants';
import { t, TL } from '../../services/localization';
import { Radio, Shield, Gauge, Zap, TrendingUp, ChevronRight, Maximize2, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';


const DronesTab: React.FC<DronesTabProps> = ({ resources, droneLevels }) => {
    const buyDrone = useGameStore(s => s.buyDrone);
    const lang = useGameStore(s => s.settings.language);

    const getDroneIcon = (id: string) => {
        switch (id) {
            case 'miner': return <Cpu className="w-6 h-6" />;
            case 'scout': return <Gauge className="w-6 h-6" />;
            case 'repair': return <Shield className="w-6 h-6" />;
            default: return <Radio className="w-6 h-6" />;
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DRONES.map((drone, idx) => {
                const lvl = droneLevels[drone.id] || 0;
                const isMaxed = lvl >= drone.maxLevel;
                const progress = (lvl / drone.maxLevel) * 100;

                return (
                    <motion.div
                        key={drone.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass-panel border-white/5 bg-white/5 p-6 relative group flex flex-col justify-between overflow-hidden hover:border-white/20 transition-all duration-300"
                    >
                        {/* Background Decor */}
                        <div className="absolute -right-4 -top-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity" style={{ color: drone.color }}>
                            {getDroneIcon(drone.id)}
                        </div>

                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 glass-panel border-white/10" style={{ color: drone.color, backgroundColor: `${drone.color}10` }}>
                                        {getDroneIcon(drone.id)}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-white px-0.5 uppercase italic tracking-tighter text-lg leading-none mb-1 group-hover:text-white transition-colors">
                                            {t(drone.name, lang)}
                                        </h4>
                                        <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">{t(TL.ui.status_label, lang)}: {lvl > 0 ? (lang === 'RU' ? 'АКТИВЕН' : 'ACTIVE') : (lang === 'RU' ? 'ОЖИДАНИЕ' : 'STANDBY')}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6 space-y-4">
                                <div className="p-3 glass-panel border-white/5 bg-black/20 italic">
                                    <div className="text-[9px] text-white/40 leading-relaxed">
                                        "{t(drone.description, lang)}"
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest italic">{t(TL.ui.level_label, lang)}</span>
                                        <span className="text-xs font-black text-white font-technical">{lvl} <span className="text-white/20">/ {drone.maxLevel}</span></span>
                                    </div>
                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                                            style={{ width: `${progress}%`, backgroundColor: drone.color }}
                                        />
                                    </div>
                                </div>

                                <div className="p-3 glass-panel border-white/5 bg-white/5">
                                    <div className="text-[10px] font-technical text-white font-bold flex items-center gap-2">
                                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                                        {lvl > 0 ? t(drone.effectDescription(lvl), lang) : (lang === 'RU' ? 'ДЕАКТИВИРОВАН' : 'OFFLINE')}
                                    </div>
                                    {!isMaxed && (
                                        <div className="text-[8px] font-technical text-white/30 mt-1 flex items-center gap-1">
                                            <span>{t(TL.ui.next, lang)}:</span>
                                            <span className="text-emerald-400/60">{t(drone.effectDescription(lvl + 1), lang)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {!isMaxed ? (
                                <div className="space-y-2 mb-8">
                                    {(Object.keys(drone.baseCost) as (keyof Resources)[]).map(res => {
                                        const cost = Math.floor((drone.baseCost[res] || 0) * Math.pow(drone.costMultiplier, lvl));
                                        const canAffordRes = (resources as any)[res] >= cost;
                                        return (
                                            <div key={res} className="flex justify-between items-center text-[10px] font-technical border-b border-white/5 pb-1">
                                                <span className="text-white/20 uppercase tracking-widest">{res}</span>
                                                <span className={canAffordRes ? 'text-white' : 'text-rose-500'}>{cost.toLocaleString()}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="mb-8 p-4 text-center glass-panel border-emerald-500/20 bg-emerald-500/5">
                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em] italic">
                                        {t(TL.ui.protocolMax, lang)}
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => buyDrone(drone.id)}
                            disabled={isMaxed}
                            className={`w-full py-5 font-black text-[10px] uppercase tracking-[0.3em] italic transition-all active:scale-[0.98]
                                ${isMaxed
                                    ? 'bg-emerald-500 text-black cursor-default'
                                    : 'bg-white text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(255,255,255,0.1)]'}
                            `}
                        >
                            {lvl === 0 ? t(TL.ui.assemble, lang) : isMaxed ? t(TL.ui.max, lang) : t(TL.ui.upgrade, lang)}
                        </button>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default DronesTab;
