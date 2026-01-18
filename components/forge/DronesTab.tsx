import React from 'react';
import { DronesTabProps } from './types';
import { Resources } from '../../types';
import { useGameStore } from '../../store/gameStore';
import { DRONES } from '../../constants';
import { t } from '../../services/localization';


const DronesTab: React.FC<DronesTabProps> = ({ resources, droneLevels }) => {
    const buyDrone = useGameStore(s => s.buyDrone);
    const lang = useGameStore(s => s.settings.language);


    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
            {DRONES.map(drone => {
                const lvl = droneLevels[drone.id] || 0;
                const isMaxed = lvl >= drone.maxLevel;
                return (
                    <div key={drone.id} className="bg-zinc-900 border border-zinc-700 p-4 relative group flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold pixel-text text-xs" style={{ color: drone.color }}>{t(drone.name, lang)}</h4>

                                <span className="text-[9px] bg-black px-1.5 py-0.5 rounded text-white border border-zinc-800">
                                    LVL {lvl} <span className="text-zinc-600">/ {drone.maxLevel}</span>
                                </span>
                            </div>

                            <div className="mb-4 bg-black/40 p-2 border-l-2" style={{ borderColor: drone.color }}>
                                <div className="text-[9px] text-zinc-400 italic mb-2 leading-tight min-h-[2.5em]">
                                    "{t(drone.description, lang)}"
                                </div>

                                <div className="text-[10px] font-mono text-white font-bold">
                                    {lvl > 0 ? t(drone.effectDescription(lvl), lang) : "СТАТУС: НЕ АКТИВЕН"}
                                </div>

                                {!isMaxed && (
                                    <div className="text-[9px] font-mono text-zinc-500 mt-1 flex items-center gap-1">
                                        <span>NEXT:</span>
                                        <span className="text-green-400">{t(drone.effectDescription(lvl + 1), lang)}</span>
                                    </div>
                                )}
                            </div>


                            {!isMaxed ? (
                                <div className="space-y-1 mb-3">
                                    {(Object.keys(drone.baseCost) as (keyof Resources)[]).map(res => {
                                        const cost = Math.floor((drone.baseCost[res] || 0) * Math.pow(drone.costMultiplier, lvl));
                                        const canAffordRes = resources[res] >= cost;
                                        return (
                                            <div key={res} className="flex justify-between text-[9px] font-mono border-b border-zinc-800/50 pb-0.5">
                                                <span className="text-zinc-500 uppercase">{res}</span>
                                                <span className={canAffordRes ? 'text-green-400' : 'text-red-500'}>{cost.toLocaleString()}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="mb-3 text-center py-4 text-[10px] text-zinc-500 font-mono border border-zinc-800 bg-black/20">
                                    МАКСИМАЛЬНЫЙ УРОВЕНЬ
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => buyDrone(drone.id)}
                            disabled={isMaxed}
                            className={`w-full py-3 border text-[10px] font-bold pixel-text transition-all active:scale-95
                ${isMaxed
                                    ? 'bg-zinc-950 border-zinc-800 text-zinc-600 cursor-not-allowed'
                                    : 'bg-zinc-800 text-white border-zinc-600 hover:bg-zinc-700 hover:border-white'}
              `}
                        >
                            {lvl === 0 ? 'СОБРАТЬ' : isMaxed ? 'МАКСИМУМ' : 'УЛУЧШИТЬ'}
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default DronesTab;
