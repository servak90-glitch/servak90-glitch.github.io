/**
 * QuickAccessBar - Панель быстрого доступа к артефактам и расходникам
 */

import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { ARTIFACTS } from '../services/artifactRegistry';
import { t } from '../services/localization';
import { useResponsive } from '../services/hooks/useResponsive';
import {
    Wrench,
    Thermometer,
    ShieldCheck,
    Sparkles,
    Zap,
    Cpu
} from 'lucide-react';

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
        { id: 'repairKit', key: '1', label: { RU: 'РЕМ', EN: 'REP' }, color: 'text-emerald-400', icon: <Wrench className="w-3.5 h-3.5" />, bloom: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]' },
        { id: 'coolantPaste', key: '2', label: { RU: 'ХЛАД', EN: 'COOL' }, color: 'text-cyan-400', icon: <Thermometer className="w-3.5 h-3.5" />, bloom: 'shadow-[0_0_10px_rgba(34,211,238,0.3)]' },
        { id: 'advancedCoolant', key: '3', label: { RU: 'ИММУН', EN: 'IMMUN' }, color: 'text-purple-400', icon: <ShieldCheck className="w-3.5 h-3.5" />, bloom: 'shadow-[0_0_10px_rgba(168,85,247,0.3)]' }
    ];

    const keys = ['Q', 'E', 'R', 'F'];
    const isVertical = orientation === 'vertical';

    return (
        <div className={`flex ${isVertical ? 'flex-row gap-4' : 'flex-col gap-3'} pointer-events-auto items-end animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            {/* Consumables (Numbers 1-3) */}
            <div className={`flex ${isVertical ? 'flex-col' : 'flex-row'} gap-2 p-1.5 glass-panel border-white/10 bg-black/40`}>
                {consumableItems.map(item => {
                    const count = (consumables as any)[item.id] || 0;
                    const isActive = count > 0;
                    return (
                        <button
                            key={item.id}
                            onClick={() => useConsumable(item.id as any)}
                            disabled={!isActive}
                            className={`
                                relative w-11 h-11 flex flex-col items-center justify-center transition-all active:scale-90 glass-panel border-white/5
                                ${isActive ? `${item.color} bg-white/5 hover:bg-white/10 ${item.bloom}` : 'opacity-20 grayscale cursor-not-allowed'}
                                group
                            `}
                        >
                            <div className="mb-0.5">{item.icon}</div>
                            <span className="text-[10px] font-bold font-technical leading-none">{count}</span>
                            <div className="absolute -top-1.5 -left-1.5 w-4 h-4 glass-panel border-white/20 bg-void flex items-center justify-center text-[8px] font-black font-technical text-white/40 group-hover:text-white/80 transition-colors">
                                {item.key}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Artifacts (Q, E, R, F) - Hidden on mobile or if requested */}
            {!shouldHideArtifacts && (
                <div className="flex gap-2 p-1.5 glass-panel border-white/10 bg-black/60 shadow-2xl">
                    {keys.map((key, idx) => {
                        const artifactId = equippedArtifacts[idx];
                        const item = artifactId ? inventory[artifactId] : null;
                        const def = item ? ARTIFACTS.find(a => a.id === item.defId) : null;

                        return (
                            <div
                                key={key}
                                className={`
                                    relative w-11 h-11 flex items-center justify-center transition-all glass-panel border-white/5
                                    ${def ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-black/40 opacity-40'}
                                    group
                                `}
                            >
                                <div className={`text-xl transition-transform duration-300 ${def ? 'group-hover:scale-125' : ''}`}>
                                    {def ? def.icon : <Cpu className="w-4 h-4 text-white/10" />}
                                </div>
                                <div className="absolute -top-1.5 -left-1.5 w-4 h-4 glass-panel border-white/20 bg-void flex items-center justify-center text-[8px] font-black font-technical text-white/40 group-hover:text-white/80 transition-colors">
                                    {key}
                                </div>

                                {/* Tooltip */}
                                {def && (
                                    <div className="hidden group-hover:block absolute right-full mr-3 bottom-0 w-48 glass-panel p-3 border-cyan-500/20 bg-void shadow-2xl z-50 pointer-events-none animate-in fade-in slide-in-from-right-2 duration-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles className="w-3 h-3 text-cyan-400" />
                                            <p className="text-[10px] font-black font-technical text-white uppercase tracking-wider">{t(def.name, lang)}</p>
                                        </div>
                                        <p className="text-[10px] text-emerald-400/80 font-technical leading-relaxed uppercase">{t(def.effectDescription, lang)}</p>
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
