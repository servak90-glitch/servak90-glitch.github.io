
import React, { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../store/gameStore';
import { calculateTotalFuel } from '../../services/gameMath';
import { calculateTotalMass } from '../../services/mathEngine';
import {
    Activity,
    Flame,
    Zap,
    Package,
    Fuel,
    Snowflake,
    Wrench,
    ZapOff,
    ShieldCheck
} from 'lucide-react';

const StatusStrip: React.FC = () => {
    const { integrity, heat, stats, resources, drill, equipmentInventory } = useGameStore(useShallow(s => ({
        integrity: s.integrity,
        heat: s.heat,
        stats: s.stats,
        resources: s.resources,
        drill: s.drill,
        equipmentInventory: s.equipmentInventory
    })));

    const maxIntegrity = stats.integrity || 100;
    const energyLoadRaw = stats.energyProd > 0 ? (stats.energyCons / stats.energyProd) * 100 : 100;
    const isOverloaded = energyLoadRaw > 100;

    const totalFuelUnits = calculateTotalFuel(resources);
    const maxFuelUnits = 10000;
    const fuelPercent = Math.min(100, (totalFuelUnits / maxFuelUnits) * 100);
    const isLowFuel = totalFuelUnits < 500;

    const cargoCapacity = stats.totalCargoCapacity || 5000;
    const { payload } = useMemo(() => calculateTotalMass(drill, resources, equipmentInventory), [drill, resources, equipmentInventory]);
    const isCargoOverloaded = payload > cargoCapacity;
    const cargoPercent = Math.min(100, (payload / cargoCapacity) * 100);

    return (
        <div className="w-full h-10 glass-panel border-x-0 border-t-0 rounded-none flex items-stretch z-40 relative pointer-events-none p-0.5 overflow-hidden">

            {/* 1. INTEGRITY (HP) */}
            <HUDItem
                icon={<Activity className={`w-3 h-3 md:w-4 md:h-4 ${integrity < maxIntegrity * 0.3 ? 'text-red-500 animate-pulse' : 'text-green-400'}`} />}
                label="HULL"
                value={Math.round(integrity)}
                maxValue={maxIntegrity}
                percent={(integrity / maxIntegrity) * 100}
                color={integrity < maxIntegrity * 0.3 ? 'bg-red-500' : 'bg-green-500'}
                glow={integrity < maxIntegrity * 0.3 ? 'shadow-[0_0_10px_rgba(239,68,68,0.5)]' : ''}
                tooltip={`Прочность корпуса: ${Math.round(integrity)} / ${maxIntegrity} HP`}
            />

            {/* 2. HEAT */}
            <HUDItem
                icon={<Flame className={`w-3 h-3 md:w-4 md:h-4 ${heat > 85 ? 'text-orange-500 animate-pulse' : 'text-cyan-400'}`} />}
                label="HEAT"
                value={Math.round(heat)}
                unit="%"
                percent={Math.min(100, heat)}
                color={heat > 85 ? 'bg-orange-500' : 'bg-cyan-500'}
                glow={heat > 85 ? 'shadow-[0_0_10px_rgba(251,146,60,0.5)]' : ''}
                tooltip={`Температура: ${Math.round(heat)}%. Аварийная блокировка при 95%.`}
                markers={stats.ambientHeat > 0 ? [{ pos: stats.ambientHeat, color: 'bg-white/30' }] : []}
            />

            {/* 3. POWER */}
            <HUDItem
                icon={<Zap className={`w-3 h-3 md:w-4 md:h-4 ${isOverloaded ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`} />}
                label="PWR"
                value={Math.round(energyLoadRaw)}
                unit="%"
                percent={Math.min(100, energyLoadRaw)}
                color={isOverloaded ? 'bg-red-500' : 'bg-yellow-500'}
                tooltip={`Нагрузка: ${Math.round(stats.energyCons)}W / ${Math.round(stats.energyProd)}W`}
            />

            {/* 4. CARGO (Hidden on mobile) */}
            <div className="hidden sm:flex flex-[1.5]">
                <HUDItem
                    icon={<Package className={`w-4 h-4 ${isCargoOverloaded ? 'text-red-500 animate-pulse' : 'text-blue-400'}`} />}
                    label="CARGO"
                    value={Math.round(payload / 100) / 10}
                    unit="t"
                    percent={cargoPercent}
                    color={isCargoOverloaded ? 'bg-red-500' : 'bg-blue-500'}
                    tooltip={`Заполненность: ${Math.round(payload)}кг / ${cargoCapacity}кг`}
                />
            </div>

            {/* 5. FUEL (Hidden on mobile) */}
            <div className="hidden lg:flex flex-[1.5]">
                <HUDItem
                    icon={<Fuel className={`w-4 h-4 ${isLowFuel ? 'text-red-500 animate-pulse' : 'text-amber-400'}`} />}
                    label="FUEL"
                    value={Math.round(fuelPercent)}
                    unit="%"
                    percent={fuelPercent}
                    color={isLowFuel ? 'bg-red-500' : 'bg-amber-500'}
                    tooltip={`Запас: ~${Math.round(totalFuelUnits)} ед.`}
                />
            </div>

            {/* 6. RESOURCES (Quick Peek - Hidden on mobile/tablet) */}
            <div className="hidden xl:flex flex-1 items-center px-3 gap-4 border-r border-white/5 pointer-events-auto bg-white/5">
                <ResItem icon={<Snowflake className="w-3 h-3 text-cyan-200" />} val={resources.ice} />
                <ResItem icon={<ZapOff className="w-3 h-3 text-zinc-400" />} val={resources.scrap} />
                <ResItem icon={<Wrench className="w-3 h-3 text-green-400" />} val={resources.repairKit} />
            </div>

            <LicenseDisplay />
        </div>
    );
};

interface HUDItemProps {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    unit?: string;
    maxValue?: number;
    percent: number;
    color: string;
    glow?: string;
    tooltip: string;
    markers?: { pos: number, color: string }[];
}

const HUDItem: React.FC<HUDItemProps> = ({ icon, label, value, unit, maxValue, percent, color, glow, tooltip, markers }) => (
    <div className="flex-[1.5] flex flex-col justify-center px-2 border-r border-white/5 relative group pointer-events-auto hover:bg-white/5 transition-colors cursor-help" title={tooltip}>
        <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1.5">
                {icon}
                <span className="text-[10px] font-bold text-white/50 tracking-tighter uppercase font-technical leading-none">{label}</span>
            </div>
            <div className="text-[11px] font-technical font-bold text-white leading-none">
                {value}<span className="text-[9px] opacity-50 ml-0.5">{unit || (maxValue ? '' : '')}</span>
                {maxValue && <span className="text-[9px] opacity-30 ml-0.5">/ {maxValue}</span>}
            </div>
        </div>
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
            <div
                className={`h-full transition-all duration-500 ease-out ${color} ${glow}`}
                style={{ width: `${Math.max(2, percent)}%` }}
            />
            {markers?.map((m, i) => (
                <div key={i} className={`absolute top-0 bottom-0 w-0.5 ${m.color}`} style={{ left: `${m.pos}%` }} />
            ))}
        </div>
    </div>
);

const ResItem = ({ icon, val }: { icon: React.ReactNode, val: number | undefined }) => (
    <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
        {icon}
        <span className="text-[11px] font-technical font-bold">{Math.floor(val || 0)}</span>
    </div>
);

const LicenseDisplay: React.FC = () => {
    const unlockedLicenses = useGameStore(s => s.unlockedLicenses);
    return (
        <div className="flex px-3 items-center bg-white/5 border-l border-white/5 gap-2 shrink-0 pointer-events-auto group">
            <ShieldCheck className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
            <div className="flex gap-1">
                {['green', 'yellow', 'red'].map(l => (
                    <div
                        key={l}
                        className={`w-2 h-2 rounded-full border border-black/20 transition-all duration-300 ${unlockedLicenses.includes(l as any)
                            ? l === 'green' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' :
                                l === 'yellow' ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]' :
                                    'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                            : 'bg-white/5'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default StatusStrip;
