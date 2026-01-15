
import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { calculateStats } from '../../services/gameMath';

const StatusStrip: React.FC = () => {
    const heat = useGameStore(s => s.heat);
    const integrity = useGameStore(s => s.integrity);
    
    // Needed to calculate max integrity and energy load
    const drill = useGameStore(s => s.drill);
    const skillLevels = useGameStore(s => s.skillLevels);
    const equippedArtifacts = useGameStore(s => s.equippedArtifacts);
    const inventory = useGameStore(s => s.inventory);
    const depth = useGameStore(s => s.depth);

    const stats = calculateStats(drill, skillLevels, equippedArtifacts, inventory, depth);
    const maxIntegrity = stats.integrity || 100;
    
    // Energy Load Calculation
    const energyLoadRaw = stats.energyProd > 0 ? (stats.energyCons / stats.energyProd) * 100 : 100;
    const energyLoad = Math.min(100, energyLoadRaw);
    const isOverloaded = energyLoadRaw > 100;

    return (
        <div className="w-full h-6 bg-black/80 border-b border-zinc-800 flex items-stretch z-40 relative pointer-events-none">
            
            {/* 1. INTEGRITY (HP) */}
            <div className="flex-1 flex items-center border-r border-zinc-900 bg-zinc-950/50 relative overflow-hidden group">
                <div className="w-6 h-full flex items-center justify-center bg-black/50 z-10 shrink-0">
                    <span className={`text-[10px] font-bold ${integrity < maxIntegrity * 0.3 ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>✚</span>
                </div>
                <div className="flex-1 h-2 mx-1 bg-zinc-900 rounded-sm overflow-hidden relative">
                    <div 
                        className={`h-full transition-all duration-300 ${integrity < maxIntegrity * 0.3 ? 'bg-red-600' : 'bg-green-600'}`} 
                        style={{ width: `${(integrity / maxIntegrity) * 100}%` }} 
                    />
                </div>
            </div>

            {/* 2. HEAT */}
            <div className="flex-1 flex items-center border-r border-zinc-900 bg-zinc-950/50 relative overflow-hidden">
                <div className="w-6 h-full flex items-center justify-center bg-black/50 z-10 shrink-0">
                    <span className={`text-[10px] font-bold ${heat > 80 ? 'text-orange-500 animate-pulse' : 'text-cyan-500'}`}>🔥</span>
                </div>
                <div className="flex-1 h-2 mx-1 bg-zinc-900 rounded-sm overflow-hidden relative">
                    <div 
                        className={`h-full transition-all duration-300 ${heat > 80 ? 'bg-orange-500' : 'bg-cyan-600'}`} 
                        style={{ width: `${Math.min(100, heat)}%` }} 
                    />
                    {/* Ambient Heat Marker */}
                    {stats.ambientHeat > 0 && (
                        <div 
                            className="absolute top-0 bottom-0 w-0.5 bg-zinc-500 opacity-50" 
                            style={{ left: `${stats.ambientHeat}%` }} 
                        />
                    )}
                </div>
            </div>

            {/* 3. POWER */}
            <div className="flex-1 flex items-center bg-zinc-950/50 relative overflow-hidden">
                <div className="w-6 h-full flex items-center justify-center bg-black/50 z-10 shrink-0">
                    <span className={`text-[10px] font-bold ${isOverloaded ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>⚡</span>
                </div>
                <div className="flex-1 h-2 mx-1 bg-zinc-900 rounded-sm overflow-hidden relative">
                    <div 
                        className={`h-full transition-all duration-300 ${isOverloaded ? 'bg-red-500' : 'bg-yellow-500'}`} 
                        style={{ width: `${energyLoad}%` }} 
                    />
                </div>
            </div>

        </div>
    );
};

export default StatusStrip;
