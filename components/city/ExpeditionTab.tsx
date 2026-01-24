import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Resources, ResourceType, ExpeditionDifficulty } from '../../types';
import { DRONES } from '../../constants';

const DIFFICULTIES: { id: ExpeditionDifficulty, label: string, color: string, risk: string }[] = [
    { id: 'LOW', label: 'РАЗВЕДКА', color: 'text-green-400', risk: 'НИЗКИЙ (5%)' },
    { id: 'MEDIUM', label: 'ОПЕРАЦИЯ', color: 'text-yellow-400', risk: 'СРЕДНИЙ (20%)' },
    { id: 'HIGH', label: 'РЕЙД', color: 'text-orange-500', risk: 'ВЫСОКИЙ (40%)' },
    { id: 'EXTREME', label: 'СМЕРТЕЛЬНО', color: 'text-red-500', risk: 'ЭКСТРЕМАЛЬНЫЙ (70%)' }
];

const TARGET_RESOURCES: ResourceType[] = [
    ResourceType.IRON, ResourceType.COPPER, ResourceType.SILVER, ResourceType.GOLD,
    ResourceType.TITANIUM, ResourceType.URANIUM, ResourceType.RUBIES, ResourceType.EMERALDS,
    ResourceType.DIAMONDS, ResourceType.ANCIENT_TECH
];

import {
    Satellite,
    Radio,
    Zap,
    Wifi,
    CheckCircle2
} from 'lucide-react';

const ExpeditionTab: React.FC = () => {
    const { resources, launchExpedition, activeExpeditions, collectRewards, cancelExpedition } = useGameStore();

    const [selectedDiff, setSelectedDiff] = useState<ExpeditionDifficulty>('LOW');
    const [selectedResource, setSelectedResource] = useState<ResourceType>(ResourceType.IRON);
    const [droneCount, setDroneCount] = useState(10);
    const [now, setNow] = useState(Date.now());

    // Update time for progress bars
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const handleLaunch = () => {
        launchExpedition(selectedDiff, droneCount, selectedResource);
    };

    const cost = droneCount * 10;
    const canAfford = resources.nanoSwarm >= cost;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT: MISSION CONTROL (4 cols / 12) */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 blur opacity-40 group-hover:opacity-70 transition duration-1000"></div>
                        <div className="relative bg-black/60 backdrop-blur-2xl border border-white/5 p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-cyan-500/10 rounded-sm border border-cyan-500/20">
                                    <Satellite className="w-6 h-6 text-cyan-500" />
                                </div>
                                <h3 className="text-sm font-black text-white tracking-[0.3em] uppercase italic">Expedition Control</h3>
                            </div>

                            <div className="space-y-6">
                                {/* Difficulty: Cyber Select */}
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Select Protocol Difficulty</label>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                        {DIFFICULTIES.map(d => (
                                            <button
                                                key={d.id}
                                                onClick={() => setSelectedDiff(d.id)}
                                                className={`py-3 px-1 text-[8px] font-black border transition-all duration-300
                                                    ${selectedDiff === d.id
                                                        ? `bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]`
                                                        : 'bg-white/5 text-zinc-500 border-white/5 hover:border-white/20 hover:text-white'
                                                    }`}
                                            >
                                                {d.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center text-[8px] font-mono p-2 bg-white/5 rounded-sm">
                                        <span className="text-zinc-500 uppercase">Calculated Risk:</span>
                                        <span className={DIFFICULTIES.find(d => d.id === selectedDiff)?.color + " font-black"}>
                                            {DIFFICULTIES.find(d => d.id === selectedDiff)?.risk}
                                        </span>
                                    </div>
                                </div>

                                {/* Resource Target: Grid */}
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Target Acquisition</label>
                                    <div className="grid grid-cols-5 gap-1.5">
                                        {TARGET_RESOURCES.map(r => (
                                            <button
                                                key={r}
                                                onClick={() => setSelectedResource(r)}
                                                className={`p-2 border text-[8px] font-mono uppercase transition-all
                                                    ${selectedResource === r
                                                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                                                        : 'bg-white/5 text-zinc-600 border-white/5 hover:border-white/20'}
                                                `}
                                                title={r}
                                            >
                                                {r.substring(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Drone Count Slider: Premium Feel */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">Swarm Density</label>
                                        <span className="text-xl font-black text-white font-mono leading-none">{droneCount}<span className="text-[10px] text-cyan-500 ml-1">DRONES</span></span>
                                    </div>
                                    <div className="relative h-6 flex items-center">
                                        <div className="absolute inset-0 h-1 my-auto bg-white/5 rounded-full" />
                                        <div className="absolute inset-y-0 left-0 h-1 my-auto bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4]" style={{ width: `${droneCount}%` }} />
                                        <input
                                            type="range"
                                            min="1"
                                            max="100"
                                            value={droneCount}
                                            onChange={(e) => setDroneCount(parseInt(e.target.value))}
                                            className="absolute inset-0 w-full opacity-0 cursor-pointer h-6 z-10"
                                        />
                                        <div className="absolute h-4 w-1 bg-white shadow-[0_0_5px_white] pointer-events-none" style={{ left: `calc(${droneCount}% - 2px)` }}></div>
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] font-mono bg-black/40 p-3 border border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-zinc-500 text-[8px] uppercase tracking-widest">Required NS</span>
                                            <span className={canAfford ? 'text-green-400 font-black' : 'text-red-500 font-black'}>{cost} NS</span>
                                        </div>
                                        <div className="h-6 w-px bg-white/5" />
                                        <div className="flex flex-col text-right">
                                            <span className="text-zinc-500 text-[8px] uppercase tracking-widest">Available NS</span>
                                            <span className="text-white font-black">{Math.floor(resources.nanoSwarm)} NS</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleLaunch}
                                    disabled={!canAfford}
                                    className={`w-full py-5 font-black uppercase tracking-[0.4em] text-[10px] transition-all relative group/btn overflow-hidden
                                        ${canAfford
                                            ? 'bg-cyan-500 text-black hover:bg-white shadow-[0_10px_30px_rgba(6,182,212,0.2)]'
                                            : 'bg-white/5 text-zinc-600 border border-white/5 cursor-not-allowed'}
                                    `}
                                >
                                    {canAfford ? 'INITIATE SWARM DEPLOYMENT' : 'INSUFFICIENT NANOMATERIALS'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-cyan-950/20 border border-cyan-500/20 p-4 rounded-sm">
                        <h4 className="text-[8px] font-black text-cyan-500 uppercase tracking-widest mb-2">Protocol Briefing</h4>
                        <p className="text-[10px] text-zinc-400 font-mono leading-relaxed italic">
                            "Swarm expeditions utilize temporary <span className="text-cyan-400">Nano Swarm</span> constructs to infiltrate deep void sectors. Chance of complete asset loss increases with protocol difficulty."
                        </p>
                    </div>
                </div>

                {/* RIGHT: TRACKING (8 cols / 12) */}
                <div className="lg:col-span-7">
                    <div className="bg-black/40 backdrop-blur-md border border-white/5 min-h-[500px] flex flex-col p-6 md:p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="h-1 w-8 bg-zinc-800" />
                                <h3 className="text-xs font-black text-zinc-500 tracking-[0.3em] uppercase italic">Active Operations</h3>
                            </div>
                            <div className="text-[10px] font-mono text-zinc-600">
                                STATUS: <span className="text-green-500 animate-pulse">MONITORING</span>
                            </div>
                        </div>

                        <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar pr-2">
                            {activeExpeditions.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-32 opacity-20 group">
                                    <Radio className="w-16 h-16 mb-4 grayscale group-hover:grayscale-0 transition-all duration-1000" />
                                    <div className="text-[10px] font-black uppercase tracking-[1em]">Scanning Deep Tunnels...</div>
                                </div>
                            )}

                            {activeExpeditions.map(exp => {
                                const diff = DIFFICULTIES.find(d => d.id === exp.difficulty);
                                const progress = Math.min(100, Math.max(0, ((now - exp.startTime) / exp.duration) * 100));
                                const timeLeft = Math.max(0, Math.ceil((exp.duration - (now - exp.startTime)) / 1000));
                                const isDone = timeLeft <= 0;

                                return (
                                    <div key={exp.id} className="relative bg-white/5 border border-white/5 p-5 group hover:bg-white/10 transition-all overflow-hidden">
                                        {/* Background Static Line Animation Effect */}
                                        <Satellite className="absolute top-2 right-2 w-10 h-10 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-1000" />

                                        <div className="relative flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs
                                                    ${isDone ? 'border-green-500 text-green-500' : 'border-cyan-500/50 text-cyan-400 animate-pulse'}`}>
                                                    {isDone ? '✓' : '⚡'}
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black text-white uppercase tracking-widest">
                                                        {diff?.label} MISSION <span className="text-zinc-600 ml-2 font-mono">#{exp.id.substring(0, 6)}</span>
                                                    </div>
                                                    <div className="text-[8px] font-mono text-zinc-500 uppercase">
                                                        Deep Sector Exploration // Target: <span className="text-zinc-300 font-black">{exp.resourceTarget}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {!isDone && (
                                                <div className="text-right">
                                                    <div className="text-xl font-black text-white font-mono leading-none">
                                                        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                                                    </div>
                                                    <div className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mt-1">Remaining</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Progress Bar: Sci-Fi Style */}
                                        <div className="space-y-1 mb-4">
                                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ease-linear
                                                        ${isDone ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]'}`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[7px] font-mono font-black text-zinc-600 uppercase tracking-widest">
                                                <span>Transmission Link</span>
                                                <span>{progress.toFixed(1)}% Stable</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center bg-black/40 p-3 border border-white/5">
                                            <div className="text-[9px] text-zinc-500 font-mono">
                                                SWARM DENSITY: <span className="text-white">{exp.droneCount} UNITS</span>
                                            </div>

                                            {isDone ? (
                                                <button
                                                    onClick={() => collectRewards(exp.id)}
                                                    className="bg-green-500 text-black text-[9px] font-black px-6 py-2 hover:bg-white transition-colors animate-pulse uppercase tracking-[0.2em]"
                                                >
                                                    Receive Data
                                                </button>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <div className="text-[8px] text-cyan-500 font-black animate-pulse uppercase tracking-widest">Acquiring Target...</div>
                                                </div>
                                            )}
                                        </div>

                                        {exp.log.length > 0 && (
                                            <div className="mt-3 text-[8px] text-zinc-600 font-mono italic px-3 py-2 bg-black/20 border-l-2 border-zinc-800 max-h-12 overflow-y-auto no-scrollbar">
                                                {"> "} {exp.log[exp.log.length - 1]}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpeditionTab;
