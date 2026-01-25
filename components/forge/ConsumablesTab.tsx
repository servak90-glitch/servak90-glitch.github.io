/**
 * ConsumablesTab - Вкладка для крафта расходников
 */

import React from 'react';
import { Resources } from '../../types';
import { t, TL } from '../../services/localization';
import { Wrench, Snowflake, Shield, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConsumableDef {
    id: string;
    name: { RU: string, EN: string };
    desc: { RU: string, EN: string };
    cost: Partial<Resources>;
    color: string;
    icon: React.ReactNode;
}

const CONSUMABLES: ConsumableDef[] = [
    {
        id: 'repairKit',
        name: { RU: 'РЕМКОМПЛЕКТ', EN: 'REPAIR KIT' },
        desc: { RU: 'Массив нано-роботов для экстренного восстановления структуры корпуса.', EN: 'Nano-robot array for emergency hull restoration.' },
        cost: { scrap: 15 },
        color: 'cyan',
        icon: <Wrench className="w-6 h-6" />
    },
    {
        id: 'coolantPaste',
        name: { RU: 'ХЛАДАГЕНТ-ПАСТА', EN: 'COOLANT PASTE' },
        desc: { RU: 'Криогенный гель для мгновенного подавления термической активности.', EN: 'Cryogenic gel for instant thermal activity suppression.' },
        cost: { clay: 25, ice: 5 },
        color: 'blue',
        icon: <Snowflake className="w-6 h-6" />
    },
    {
        id: 'advancedCoolant',
        name: { RU: 'ГИПЕР-ОХЛАДИТЕЛЬ', EN: 'ADVANCED COOLANT' },
        desc: { RU: 'Превращает бур в ледяной заслон, давая полный иммунитет к нагреву.', EN: 'Turns the drill into an ice barrier, giving full heat immunity.' },
        cost: { oil: 30, silver: 5 },
        color: 'purple',
        icon: <Droplets className="w-6 h-6" />
    }
];

interface Props {
    resources: Resources;
    onStartCraft: (id: string, type: 'CONSUMABLE') => void;
    lang: 'RU' | 'EN';
}

export const ConsumablesTab: React.FC<Props> = ({ resources, onStartCraft, lang }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CONSUMABLES.map((item, idx) => {
                const canAfford = Object.entries(item.cost).every(([k, v]) => (resources as any)[k] >= (v as number));
                const colorClass = {
                    cyan: 'border-cyan-500/30 text-cyan-400 group-hover:border-cyan-500/60',
                    blue: 'border-blue-500/30 text-blue-400 group-hover:border-blue-500/60',
                    purple: 'border-purple-500/30 text-purple-400 group-hover:border-purple-500/60'
                }[item.color as 'cyan' | 'blue' | 'purple'];

                const bgColor = {
                    cyan: 'bg-cyan-500/5',
                    blue: 'bg-blue-500/5',
                    purple: 'bg-purple-500/5'
                }[item.color as 'cyan' | 'blue' | 'purple'];

                return (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`group glass-panel p-6 flex flex-col justify-between min-h-[280px] transition-all duration-300 relative overflow-hidden ${colorClass} ${bgColor} hover:shadow-[0_0_30px_rgba(34,211,238,0.1)]`}
                    >
                        <div className="absolute -right-4 -top-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            {item.icon}
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 glass-panel border-white/10 ${bgColor}`}>
                                    {item.icon}
                                </div>
                                <h3 className={`font-black uppercase tracking-tighter text-xl italic`}>
                                    {t(item.name, lang)}
                                </h3>
                            </div>

                            <p className="text-[10px] text-white/40 font-black uppercase italic tracking-widest leading-relaxed mb-6 border-l border-white/10 pl-3">
                                {t(item.desc, lang)}
                            </p>

                            <div className="space-y-2 mb-6">
                                {Object.entries(item.cost).map(([res, amt]) => (
                                    <div key={res} className="flex justify-between items-center text-[10px] font-technical border-b border-white/5 pb-1">
                                        <span className="text-white/20 uppercase tracking-widest">{t((TL.resources as any)[res as any], lang)}</span>
                                        <div className="flex items-center gap-2">
                                            <span className={(resources as any)[res] >= (amt as number) ? 'text-white' : 'text-rose-500'}>
                                                {(resources as any)[res].toLocaleString()}
                                            </span>
                                            <span className="text-white/20">/</span>
                                            <span className="text-white/40">{amt}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            disabled={!canAfford}
                            onClick={() => onStartCraft(item.id, 'CONSUMABLE')}
                            className={`
                                w-full py-4 text-xs font-black uppercase tracking-[0.3em] italic transition-all border
                                ${canAfford
                                    ? 'bg-white text-black hover:bg-cyan-400 hover:border-cyan-400 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                                    : 'bg-white/5 border-white/5 text-white/10 cursor-not-allowed'}
                            `}
                        >
                            {t(TL.ui.craft_item as any, lang)}
                        </button>
                    </motion.div>
                );
            })}
        </div>
    );
};
