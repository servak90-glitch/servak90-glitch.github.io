
import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { calculateStats, formatCompactNumber } from '../services/gameMath';
import { t } from '../services/localization';

export const DrillStatsPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Store data
    const s = useGameStore();
    const stats = calculateStats(s.drill, s.skillLevels, s.equippedArtifacts, s.inventory, s.depth);
    const lang = s.settings.language;

    // Derived values for bars
    const energyLoad = stats.energyProd > 0 ? (stats.energyCons / stats.energyProd) * 100 : 100;
    const cargoFullness = stats.totalCargoCapacity && stats.totalCargoCapacity > 0 ? (s.currentCargoWeight / stats.totalCargoCapacity) * 100 : 0;

    // Fuel total (coal + oil + gas)
    const totalFuel = (s.resources.coal || 0) + (s.resources.oil || 0) * 1.5 + (s.resources.gas || 0) * 2;
    const fuelMax = 1000; // Baseline for visual representation

    // Recycling Actions (Task 3)
    const handleRecycle = (type: 'repair' | 'lubricate' | 'lottery' | 'scrap' | 'afterburn') => {
        (s as any).recycleResources(type);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed right-0 top-1/2 -translate-y-1/2 bg-black/60 border-l-2 border-y-2 border-cyan-500 p-2 rounded-l-md z-50 text-cyan-400 hover:bg-cyan-900 transition-colors vertical-text text-[10px] font-bold pointer-events-auto shadow-[0_0_10px_rgba(6,182,212,0.3)]"
            >
                ДАННЫЕ БУРА
            </button>
        );
    }

    return (
        <div className="fixed right-0 top-[10%] bottom-[10%] w-64 bg-black/95 border-l border-cyan-500/50 z-[60] flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.9)] backdrop-blur-xl animate-slideInRight pointer-events-auto">
            {/* Header */}
            <div className="p-3 border-b border-zinc-800 flex justify-between items-center bg-cyan-950/20">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-500 animate-pulse rounded-full" />
                    <h3 className="text-xs font-black text-cyan-400 uppercase tracking-tighter">БОРТОВОЙ КОМПЬЮТЕР</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white p-1">✕</button>
            </div>

            {/* Stats Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">

                {/* 1. CRITICAL STATUS (New Bars) */}
                <section className="space-y-3">
                    <ProgressBar
                        label="Целостность корпуса"
                        current={Math.floor(s.integrity)}
                        max={Math.floor(stats.integrity)}
                        color="bg-green-500"
                        bgColor="bg-green-950/30"
                    />
                    <ProgressBar
                        label="Энергопотребление"
                        current={Math.floor(stats.energyCons)}
                        max={Math.floor(stats.energyProd)}
                        unit="ед"
                        color={energyLoad > 90 ? "bg-red-500" : energyLoad > 70 ? "bg-yellow-500" : "bg-cyan-500"}
                        bgColor="bg-cyan-950/30"
                    />
                    <ProgressBar
                        label="Термическая нагрузка"
                        current={Math.floor(s.heat)}
                        max={100}
                        unit="%"
                        color={s.heat > 90 ? "bg-red-600 animate-pulse" : s.heat > 70 ? "bg-orange-500" : "bg-blue-400"}
                        bgColor="bg-blue-950/30"
                    />
                    <ProgressBar
                        label="Загрузка отсека"
                        current={Math.floor(s.currentCargoWeight)}
                        max={Math.floor(stats.totalCargoCapacity || 0)}
                        unit="кг"
                        color={cargoFullness > 90 ? "bg-red-500" : "bg-zinc-400"}
                        bgColor="bg-zinc-800/30"
                    />
                    <ProgressBar
                        label="Запас топлива (экв)"
                        current={Math.floor(totalFuel)}
                        max={fuelMax}
                        color="bg-amber-600"
                        bgColor="bg-amber-950/30"
                    />
                </section>

                <div className="h-px bg-zinc-800/50" />

                {/* 2. CORE PERFORMANCE */}
                <section>
                    <h4 className="text-[9px] text-zinc-500 font-bold mb-2 uppercase tracking-widest">Производительность</h4>
                    <div className="space-y-1.5">
                        <StatRow label="Мощность бурения" value={formatCompactNumber(stats.totalDamage)} sub="ед/с" color="text-red-400" />
                        <StatRow label="Скорость проходки" value={formatCompactNumber(stats.totalSpeed)} sub="м/с" color="text-green-400" />
                        <StatRow label="Охлаждение" value={formatCompactNumber(stats.totalCooling)} sub="ед/с" color="text-cyan-400" />
                        <StatRow label="Эффективность" value={(stats.drillingEfficiency * 100).toFixed(0)} sub="%" color={stats.drillingEfficiency < 1 ? "text-orange-500" : "text-zinc-400"} />
                    </div>
                </section>

                {/* 3. BONUSES */}
                <section>
                    <h4 className="text-[9px] text-zinc-500 font-bold mb-2 uppercase tracking-widest">Активные модификаторы</h4>
                    <div className="space-y-1.5">
                        {stats.skillMods.clickPowerPct > 0 && <BonusRow label="Нейро-линк" value={`+${stats.skillMods.clickPowerPct}%`} color="text-amber-500" />}
                        {stats.skillMods.autoSpeedPct > 0 && <BonusRow label="Привод" value={`+${stats.skillMods.autoSpeedPct}%`} color="text-cyan-500" />}
                        {stats.skillMods.coolingPowerPct > 0 && <BonusRow label="Термостат" value={`+${stats.skillMods.coolingPowerPct}%`} color="text-blue-400" />}
                        {stats.artifactMods.resourceMultPct > 0 && <BonusRow label="Артефакты" value={`+${stats.artifactMods.resourceMultPct}% лут`} color="text-purple-400" />}
                    </div>
                </section>

                {/* 3.1. TEMPORARY EFFECTS */}
                {s.activeEffects.length > 0 && (
                    <section>
                        <h4 className="text-[9px] text-cyan-500 font-bold mb-2 uppercase tracking-widest">Временные усиления</h4>
                        <div className="space-y-1.5">
                            {s.activeEffects.map(e => (
                                <div key={e.id} className="flex justify-between items-center text-[9px] bg-cyan-950/20 p-1 border border-cyan-900/30">
                                    <span className="text-cyan-300 font-bold">{e.name}</span>
                                    <span className="text-zinc-500 font-mono">{e.duration}с</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 4. RECYCLING ACTIONS */}
                <section className="pt-2">
                    <h4 className="text-[9px] text-yellow-600 font-bold mb-2 uppercase tracking-widest">Утилизация и выживание</h4>
                    <div className="grid grid-cols-1 gap-2">
                        <ActionButton
                            icon="🔨"
                            title="Полевой ремонт"
                            desc="+5% Integrity прямо в шахте"
                            cost="500 Stone, 50 Scrap"
                            disabled={s.resources.stone < 500 || s.resources.scrap < 50}
                            onClick={() => handleRecycle('repair' as any)}
                        />
                        <ActionButton
                            icon="🧪"
                            title="Смазочный концентрат"
                            desc="-20% нагрева на 2 минуты"
                            cost="300 Clay, 50 Ice"
                            disabled={s.resources.clay < 300 || s.resources.ice < 50}
                            onClick={() => handleRecycle('lubricate' as any)}
                        />
                        <ActionButton
                            icon="🎰"
                            title="Лотерея старателя"
                            desc="+50% шанс найти расходники"
                            cost="200 Iron, 100 Clay, 100 Stone"
                            disabled={s.resources.iron < 200 || s.resources.clay < 100 || s.resources.stone < 100 || s.activeEffects.some(e => e.id === 'PROSPECTOR_LUCK')}
                            onClick={() => handleRecycle('lottery' as any)}
                        />
                        <ActionButton
                            icon="📦"
                            title="Сдать в утиль"
                            desc="100 Stone/Clay -> 7 Credits"
                            cost="100 Base Resource"
                            disabled={s.resources.stone < 100 && s.resources.clay < 100}
                            onClick={() => handleRecycle('scrap' as any)}
                        />
                        <ActionButton
                            icon="🚀"
                            title="Балластный форсаж"
                            desc="+50% Speed на 30 секунд"
                            cost="1000 Stone"
                            disabled={s.resources.stone < 1000 || s.activeEffects.some(e => e.id === 'BALLAST_DUMP')}
                            onClick={() => handleRecycle('afterburn' as any)}
                        />
                    </div>
                </section>
            </div>

            {/* Footer */}
            <div className="p-2 bg-zinc-950 text-[7px] font-mono text-zinc-600 text-center border-t border-zinc-900 uppercase">
                Hardware: v4.1.3 // Core: DRILL-MK-IV
            </div>
        </div>
    );
};

const ProgressBar = ({ label, current, max, unit = "", color, bgColor }: any) => {
    const percent = Math.min(100, Math.max(0, (current / max) * 100));
    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-tighter">
                <span className="text-zinc-500">{label}</span>
                <span className="text-zinc-300 font-mono">{current}/{max}{unit}</span>
            </div>
            <div className={`w-full h-1.5 ${bgColor} rounded-full overflow-hidden border border-white/5`}>
                <div
                    className={`h-full ${color} transition-all duration-500 ease-out`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
};

const StatRow = ({ label, value, sub, color }: any) => (
    <div className="flex justify-between items-end">
        <span className="text-[10px] text-zinc-400">{label}</span>
        <div className="text-right">
            <span className={`text-xs font-bold font-mono ${color}`}>{value}</span>
            <span className="text-[8px] text-zinc-600 ml-0.5">{sub}</span>
        </div>
    </div>
);

const BonusRow = ({ label, value, color }: any) => (
    <div className="flex justify-between items-center text-[9px]">
        <span className="text-zinc-500">{label}</span>
        <span className={`font-bold ${color}`}>{value}</span>
    </div>
);

const ActionButton = ({ icon, title, desc, cost, disabled, onClick }: any) => (
    <button
        disabled={disabled}
        onClick={onClick}
        className={`w-full text-left p-2 rounded border border-zinc-800 transition-all ${disabled ? 'opacity-30 grayscale' : 'hover:border-yellow-500/50 hover:bg-yellow-500/5'} group`}
    >
        <div className="flex items-center gap-2 mb-1">
            <span className="text-xs">{icon}</span>
            <span className="text-[9px] font-extrabold text-zinc-200 group-hover:text-yellow-500">{title}</span>
        </div>
        <p className="text-[8px] text-zinc-500 leading-tight mb-1">{desc}</p>
        <div className="text-[7px] font-mono text-zinc-600">REQUIRED: {cost}</div>
    </button>
);
