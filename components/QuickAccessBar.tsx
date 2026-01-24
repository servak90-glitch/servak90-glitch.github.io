/**
 * QuickAccessBar - Панель быстрого доступа к артефактам и расходникам
 */

import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { ARTIFACTS } from '../services/artifactRegistry';
import { t } from '../services/localization';
import { useResponsive } from '../services/hooks/useResponsive';

interface QuickAccessBarProps {
    orientation?: 'horizontal' | 'vertical';
    hideArtifacts?: boolean;
}

export const QuickAccessBar: React.FC<QuickAccessBarProps> = ({
    orientation = 'horizontal',
    hideArtifacts = false
}) => {
    const consumables = useGameStore(s => s.consumables);
    const useConsumable = useGameStore(s => s.useConsumable);
    const equippedArtifacts = useGameStore(s => s.equippedArtifacts);
    const inventory = useGameStore(s => s.inventory);
    const lang = useGameStore(s => s.settings.language);

    const { isMobile } = useResponsive();
    const shouldHideArtifacts = hideArtifacts || isMobile;

    // Обработка горячих клавиш (1-3 для расходников, QERF для артефактов)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '1') useConsumable('repairKit');
            if (e.key === '2') useConsumable('coolantPaste');
            if (e.key === '3') useConsumable('advancedCoolant');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [useConsumable]);

    const consumableItems = [
        { id: 'repairKit', key: '1', label: { RU: 'РЕМ', EN: 'REP' }, color: 'border-green-500 text-green-400' },
        { id: 'coolantPaste', key: '2', label: { RU: 'ХЛАД', EN: 'COOL' }, color: 'border-blue-500 text-blue-400' },
        { id: 'advancedCoolant', key: '3', label: { RU: 'ИММУН', EN: 'IMMUN' }, color: 'border-purple-500 text-purple-400' }
    ];

    const keys = ['Q', 'E', 'R', 'F'];

    const isVertical = orientation === 'vertical';

    return (
        <div className={`flex ${isVertical ? 'flex-row gap-4' : 'flex-col gap-2'} pointer-events-auto items-end`}>
            {/* Consumables (Numbers 1-3) */}
            <div className={`flex ${isVertical ? 'flex-col' : 'flex-row'} gap-1.5 p-1 bg-black/40 backdrop-blur-sm border border-zinc-800 rounded-lg`}>
                {consumableItems.map(item => {
                    const count = (consumables as any)[item.id] || 0;
                    return (
                        <button
                            key={item.id}
                            onClick={() => useConsumable(item.id as any)}
                            disabled={count <= 0}
                            className={`
                                relative w-10 h-10 border-2 flex flex-col items-center justify-center transition-all active:scale-90
                                ${count > 0 ? item.color + ' bg-zinc-900/80 hover:bg-zinc-800' : 'border-zinc-800 text-zinc-700 bg-zinc-950 opacity-50 grayscale'}
                                rounded-md group
                            `}
                        >
                            <span className="text-[8px] font-black tracking-tighter">{t(item.label, lang)}</span>
                            <span className="text-[10px] font-mono font-bold">{count}</span>
                            <div className="absolute -top-1 -left-1 w-3.5 h-3.5 bg-zinc-800 border border-zinc-600 flex items-center justify-center rounded text-[7px] text-zinc-400 font-bold">
                                {item.key}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Artifacts (Q, E, R, F) - Hidden on mobile or if requested */}
            {!shouldHideArtifacts && (
                <div className="flex gap-1.5 p-1 bg-black/60 backdrop-blur-sm border border-zinc-700 rounded-lg">
                    {keys.map((key, idx) => {
                        const artifactId = equippedArtifacts[idx];
                        const item = artifactId ? inventory[artifactId] : null;
                        const def = item ? ARTIFACTS.find(a => a.id === item.defId) : null;

                        return (
                            <div
                                key={key}
                                className={`
                                    relative w-10 h-10 border-2 flex flex-col items-center justify-center transition-all
                                    ${def ? 'border-cyan-500 bg-cyan-950/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'border-zinc-800 bg-zinc-950/50'}
                                    rounded-md group
                                `}
                            >
                                <span className="text-xl">{def ? def.icon : ''}</span>
                                <div className="absolute -top-1 -left-1 w-3.5 h-3.5 bg-zinc-800 border border-zinc-600 flex items-center justify-center rounded text-[7px] text-zinc-400 font-bold">
                                    {key}
                                </div>

                                {/* Tooltip */}
                                {def && (
                                    <div className="hidden group-hover:block absolute left-full ml-2 bottom-0 w-40 bg-zinc-950 border border-zinc-700 p-2 rounded z-50 shadow-2xl pointer-events-none">
                                        <p className="text-[9px] font-bold text-cyan-400 uppercase">{t(def.name, lang)}</p>
                                        <p className="text-[8px] text-green-400 font-mono mt-1">{t(def.effectDescription, lang)}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
