/**
 * ConsumablesTab - Вкладка для крафта расходников
 */

import React from 'react';
import { Resources } from '../../types';
import { t, TL } from '../../services/localization';

interface ConsumableDef {
    id: string;
    name: { RU: string, EN: string };
    desc: { RU: string, EN: string };
    cost: Partial<Resources>;
    color: string;
}

const CONSUMABLES: ConsumableDef[] = [
    {
        id: 'repairKit',
        name: { RU: 'РЕМКОМПЛЕКТ', EN: 'REPAIR KIT' },
        desc: { RU: 'Восстанавливает 20% прочности корпуса бура.', EN: 'Restores 20% of drill integrity.' },
        cost: { scrap: 15 },
        color: 'border-green-500 text-green-400'
    },
    {
        id: 'coolantPaste',
        name: { RU: 'ХЛАДАГЕНТ-ПАСТА', EN: 'COOLANT PASTE' },
        desc: { RU: 'Мгновенно снижает текущий нагрев на 30%.', EN: 'Instantly reduces heat by 30%.' },
        cost: { clay: 25, ice: 5 },
        color: 'border-blue-500 text-blue-400'
    },
    {
        id: 'advancedCoolant',
        name: { RU: 'ПРОДВИНУТЫЙ ХЛАДАГЕНТ', EN: 'ADVANCED COOLANT' },
        desc: { RU: 'Снижает нагрев на 60% и дает иммунитет к перегреву на 30с.', EN: 'Reduces heat by 60% and gives 30s heat immunity.' },
        cost: { oil: 30, silver: 5 },
        color: 'border-purple-500 text-purple-400'
    }
];

interface Props {
    resources: Resources;
    onStartCraft: (id: string, type: 'CONSUMABLE') => void;
    lang: 'RU' | 'EN';
}

export const ConsumablesTab: React.FC<Props> = ({ resources, onStartCraft, lang }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CONSUMABLES.map(item => {
                const canAfford = Object.entries(item.cost).every(([k, v]) => (resources as any)[k] >= v);

                return (
                    <div key={item.id} className="bg-zinc-900 border border-zinc-700 p-4 flex flex-col justify-between min-h-[200px] hover:border-zinc-500 transition-colors">
                        <div>
                            <h3 className={`font-bold mb-1 pixel-text text-sm ${item.color.split(' ')[1]}`}>{t(item.name, lang)}</h3>
                            <p className="text-[10px] text-zinc-400 italic mb-4">"{t(item.desc, lang)}"</p>

                            <div className="space-y-1 mb-4">
                                {Object.entries(item.cost).map(([res, amt]) => (
                                    <div key={res} className="flex justify-between text-[10px] font-mono border-b border-zinc-800/50 pb-0.5">
                                        <span className="text-zinc-500 uppercase">{t(TL.resources[res as any] as any, lang)}</span>
                                        <span className={(resources as any)[res] >= amt ? 'text-green-400' : 'text-red-500'}>
                                            {amt}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            disabled={!canAfford}
                            onClick={() => onStartCraft(item.id, 'CONSUMABLE')}
                            className={`
                                w-full py-2 text-xs font-bold transition-all border
                                ${canAfford ? 'bg-zinc-800 border-zinc-600 hover:bg-white hover:text-black' : 'bg-transparent border-zinc-800 text-zinc-700 cursor-not-allowed'}
                            `}
                        >
                            {t(TL.ui.craft_item as any, lang)}
                        </button>
                    </div>
                );
            })}
        </div>
    );
};
