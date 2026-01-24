
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CombatMinigameType } from '../types';
import { useGameStore } from '../store/gameStore';
import { t, TL } from '../services/localization';
import {
    Zap,
    ShieldAlert,
    Activity,
    Hash,
    Cpu,
    Fingerprint,
    Lock,
    Unlock,
    Terminal,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';

interface CombatMinigameOverlayProps {
    type: CombatMinigameType;
    difficulty: number;
    onComplete: (success: boolean) => void;
}

const CombatMinigameOverlay: React.FC<CombatMinigameOverlayProps> = ({ type, difficulty, onComplete }) => {
    const lang = useGameStore(s => s.settings.language);
    const [timeLeft, setTimeLeft] = useState(5.0);
    const [status, setStatus] = useState<'PLAYING' | 'WON' | 'LOST'>('PLAYING');

    // --- GAME SPECIFIC STATE ---
    const [mashCount, setMashCount] = useState(0);
    const mashTarget = 15 + (difficulty * 5);

    const [timingPosition, setTimingPosition] = useState(0);
    const timingDirection = useRef(1);
    const timingSpeed = 1.5 + (difficulty * 0.5);
    const timingZone = { start: 40, width: 20 - (difficulty * 2) };

    const [memorySequence, setMemorySequence] = useState<number[]>([]);
    const [playerSequence, setPlayerSequence] = useState<number[]>([]);
    const [isShowingSequence, setIsShowingSequence] = useState(true);
    const [currentShowIndex, setCurrentShowIndex] = useState(-1);

    const [alignPos, setAlignPos] = useState(50);
    const [alignVelocity, setAlignVelocity] = useState(0);
    const [alignTarget, setAlignTarget] = useState(50);

    const [glyphs, setGlyphs] = useState<string[]>([]);
    const [targetGlyph, setTargetGlyph] = useState('');

    const [wireGrid, setWireGrid] = useState<number[]>([]);

    const timerRef = useRef<any>(null);
    const gameLoopRef = useRef<number>(0);

    useEffect(() => {
        if (type === 'MASH') {
            setTimeLeft(8.0);
        }
        else if (type === 'MEMORY') {
            const len = 3 + difficulty;
            const seq = Array.from({ length: len }, () => Math.floor(Math.random() * 4));
            setMemorySequence(seq);
            setTimeLeft(10.0);

            let idx = 0;
            const interval = setInterval(() => {
                setCurrentShowIndex(idx);
                setTimeout(() => setCurrentShowIndex(-1), 400);
                idx++;
                if (idx >= len) {
                    clearInterval(interval);
                    setIsShowingSequence(false);
                }
            }, 800);
            return () => clearInterval(interval);
        }
        else if (type === 'GLYPH') {
            const chars = ['Ж', 'Щ', 'Ф', 'Ω', 'Ψ', 'Δ', 'Ξ', 'Π', 'Σ', 'Φ'];
            const target = chars[Math.floor(Math.random() * chars.length)];
            const noise = chars.filter(c => c !== target);
            const grid = Array.from({ length: 16 }, () => Math.random() > 0.8 ? target : noise[Math.floor(Math.random() * noise.length)]);
            if (!grid.includes(target)) grid[Math.floor(Math.random() * 16)] = target;
            setGlyphs(grid);
            setTargetGlyph(target);
            setTimeLeft(4.0);
        }
        else if (type === 'WIRES') {
            setWireGrid(Array.from({ length: 4 + difficulty }, () => 0));
            setTimeLeft(3.0 + difficulty);
        }
        else if (type === 'ALIGN') {
            setTimeLeft(5.0);
        }
    }, [type, difficulty]);

    const handleFinish = (result: boolean) => {
        if (status !== 'PLAYING') return;
        setStatus(result ? 'WON' : 'LOST');
        if (timerRef.current) clearInterval(timerRef.current);
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        setTimeout(() => onComplete(result), 1000);
    };

    useEffect(() => {
        if (status !== 'PLAYING') return;
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0.1) return 0;
                return prev - 0.1;
            });
        }, 100);
        return () => clearInterval(timerRef.current);
    }, [status]);

    useEffect(() => {
        if (timeLeft <= 0 && status === 'PLAYING') {
            handleFinish(false);
        }
    }, [timeLeft, status]);

    useEffect(() => {
        if (status !== 'PLAYING') return;
        const loop = () => {
            if (type === 'TIMING') {
                setTimingPosition(prev => {
                    const next = prev + timingDirection.current * timingSpeed;
                    if (next >= 100 || next <= 0) timingDirection.current *= -1;
                    return Math.max(0, Math.min(100, next));
                });
            }
            else if (type === 'ALIGN') {
                if (Math.random() < 0.05) setAlignTarget(Math.random() * 80 + 10);
                setAlignPos(p => {
                    const next = p + alignVelocity;
                    if (next < 0 || next > 100) setAlignVelocity(v => -v * 0.5);
                    return Math.max(0, Math.min(100, next));
                });
                const force = (alignPos < alignTarget ? -0.2 : 0.2);
                setAlignVelocity(v => v + force * 0.1);
            }
            gameLoopRef.current = requestAnimationFrame(loop);
        };
        gameLoopRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(gameLoopRef.current);
    }, [status, type, timingSpeed, alignVelocity, alignTarget]);

    const handleMash = () => {
        if (status !== 'PLAYING') return;
        const newCount = mashCount + 1;
        setMashCount(newCount);
        if (newCount >= mashTarget) handleFinish(true);
    };

    const handleTimingClick = () => {
        if (status !== 'PLAYING') return;
        if (timingPosition >= timingZone.start && timingPosition <= timingZone.start + timingZone.width) {
            handleFinish(true);
        } else {
            handleFinish(false);
        }
    };

    const handleMemoryClick = (idx: number) => {
        if (status !== 'PLAYING' || isShowingSequence) return;
        const newSeq = [...playerSequence, idx];
        setPlayerSequence(newSeq);
        if (memorySequence[newSeq.length - 1] !== idx) {
            handleFinish(false);
            return;
        }
        if (newSeq.length === memorySequence.length) {
            handleFinish(true);
        }
    };

    const handleAlignClick = () => {
        if (status !== 'PLAYING') return;
        const push = alignPos < alignTarget ? 2 : -2;
        setAlignVelocity(v => v + push);
        if (Math.abs(alignPos - alignTarget) < 10) {
            handleFinish(true);
        }
    };

    const handleGlyphClick = (char: string) => {
        if (status !== 'PLAYING') return;
        if (char === targetGlyph) handleFinish(true);
        else handleFinish(false);
    };

    const handleWireClick = (index: number) => {
        if (status !== 'PLAYING') return;
        const newGrid = [...wireGrid];
        newGrid[index] = 1;
        setWireGrid(newGrid);
        if (newGrid.every(x => x === 1)) handleFinish(true);
    };

    const totalTime = type === 'MEMORY' ? 10 : (type === 'MASH' ? 8 : 5);
    const timePercent = (timeLeft / totalTime) * 100;

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md select-none pointer-events-auto touch-none overflow-hidden">
            {/* Animated Background Pulse */}
            <div className={`absolute inset-0 bg-gradient-to-t transition-colors duration-1000 opacity-20 ${status === 'WON' ? 'from-emerald-500' : status === 'LOST' ? 'from-rose-500' : 'from-cyan-500'}`} />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className={`
                w-full max-w-sm aspect-square glass-panel p-8 flex flex-col items-center justify-between border-2 relative overflow-hidden shadow-2xl
                ${status === 'PLAYING' ? 'border-cyan-500/50 bg-cyan-950/10' :
                        status === 'WON' ? 'border-emerald-500 bg-emerald-950/20' : 'border-rose-500 bg-rose-950/20'}
            `}
            >
                {/* Design accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-inherit opacity-40" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-inherit opacity-40" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-inherit opacity-40" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-inherit opacity-40" />

                {/* HEADER */}
                <div className="w-full flex justify-between items-center mb-6 relative z-10">
                    <div className="flex items-center gap-2">
                        {status === 'PLAYING' ? <Cpu className="w-4 h-4 text-cyan-400 animate-spin" /> : status === 'WON' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                        <span className={`text-[10px] font-technical uppercase font-black tracking-[0.2em] ${status === 'PLAYING' ? 'text-cyan-400' : status === 'WON' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {status === 'PLAYING' ? `[${t(TL.ui.hackLink, lang)}: ${type}]` : `${t(TL.ui.procedStatus, lang)}: ${status}`}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Activity className={`w-3.5 h-3.5 ${timeLeft < 2 ? 'text-rose-500 animate-pulse' : 'text-white/40'}`} />
                        <span className={`text-sm font-black font-technical ${timeLeft < 2 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
                            {timeLeft.toFixed(1)}<span className="text-[8px] opacity-40 ml-0.5">{t(TL.ui.sec, lang)}</span>
                        </span>
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 w-full relative flex items-center justify-center pointer-events-auto">
                    {type === 'MASH' && (
                        <button
                            onPointerDown={handleMash}
                            className="w-40 h-40 rounded-full glass-panel border-4 border-cyan-500/30 flex items-center justify-center active:scale-90 active:bg-cyan-500/20 transition-all duration-75 touch-manipulation group"
                        >
                            <div className="text-center group-active:scale-110 transition-transform">
                                <div className="text-5xl font-black font-technical text-white tracking-tighter transition-all">{Math.max(0, mashTarget - mashCount)}</div>
                                <div className="text-[10px] font-black font-technical text-cyan-400 uppercase tracking-widest mt-2">{t(TL.ui.tapForce, lang)}</div>
                            </div>
                        </button>
                    )}

                    {type === 'TIMING' && (
                        <div
                            className="w-full h-16 glass-panel p-1 border-white/10 relative cursor-pointer touch-manipulation group"
                            onPointerDown={handleTimingClick}
                        >
                            {/* Shimmer on background */}
                            <div className="absolute inset-0 bg-white/[0.02] animate-pulse" />
                            {/* Target Zone */}
                            <div
                                className="absolute top-1 bottom-1 bg-emerald-500/20 border-x-2 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                style={{ left: `${timingZone.start}%`, width: `${timingZone.width}%` }}
                            />
                            {/* Cursor */}
                            <div
                                className="absolute top-[-8px] bottom-[-8px] w-1.5 bg-white shadow-[0_0_15px_white] z-10"
                                style={{ left: `${timingPosition}%` }}
                            >
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-white" />
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-white" />
                            </div>
                            <div className="absolute -bottom-8 w-full text-center text-[9px] font-black font-technical text-white/30 uppercase tracking-[0.3em]">{t(TL.ui.syncOnSignal, lang)}</div>
                        </div>
                    )}

                    {type === 'MEMORY' && (
                        <div className="grid grid-cols-2 gap-4">
                            {[0, 1, 2, 3].map(i => (
                                <button
                                    key={i}
                                    onPointerDown={() => handleMemoryClick(i)}
                                    disabled={isShowingSequence}
                                    className={`w-20 h-20 glass-panel border-2 flex flex-col items-center justify-center transition-all touch-manipulation relative overflow-hidden group/m
                                    ${currentShowIndex === i ? 'border-cyan-400 bg-cyan-400/20 shadow-[0_0_25px_rgba(34,211,238,0.4)] scale-105' : 'border-white/5 bg-white/5 text-white/20'}
                                    ${!isShowingSequence && 'hover:bg-white/10 hover:border-white/20 active:scale-90'}
                                `}
                                >
                                    <span className={`text-2xl font-black font-technical ${currentShowIndex === i ? 'text-white' : 'text-inherit'}`}>
                                        {['SYS_A', 'SYS_B', 'SYS_G', 'SYS_D'][i]}
                                    </span>
                                    <div className="absolute bottom-1 right-1 opacity-20 group-hover/m:opacity-100 transition-opacity">
                                        <Fingerprint className="w-3.5 h-3.5" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {type === 'ALIGN' && (
                        <div className="w-full h-48 glass-panel p-2 border-white/5 relative touch-none bg-black/40 overflow-hidden" onPointerDown={handleAlignClick}>
                            {/* Sync Grid */}
                            <div className="absolute inset-0 opacity-[0.05] flex flex-col justify-between p-4">
                                {[...Array(5)].map((_, i) => <div key={i} className="h-px w-full bg-white" />)}
                            </div>

                            {/* Target Zone */}
                            <div
                                className="absolute left-0 right-0 h-10 bg-emerald-500/10 border-y border-emerald-500/30 flex items-center justify-center"
                                style={{ top: `${alignTarget}%` }}
                            >
                                <div className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.5em] animate-pulse">{t(TL.ui.lockZone, lang)}</div>
                            </div>

                            {/* Player Module */}
                            <div
                                className="absolute left-1/2 -translate-x-1/2 w-16 h-4 glass-panel border-cyan-400 bg-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all flex items-center justify-center"
                                style={{ top: `${alignPos}%` }}
                            >
                                <div className="w-8 h-px bg-black/40" />
                            </div>

                            <div className="absolute bottom-4 w-full text-center text-[8px] font-black font-technical text-white/20 uppercase tracking-widest">{t(TL.ui.pressToEngage, lang)}</div>
                        </div>
                    )}

                    {type === 'GLYPH' && (
                        <div className="flex flex-col items-center gap-6">
                            <div className="glass-panel py-2 px-6 border-emerald-500/30 bg-emerald-500/5 flex items-center gap-3">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t(TL.ui.targetSequence, lang)}:</span>
                                <span className="text-3xl font-black font-mono text-emerald-400 neon-text-emerald animate-pulse">{targetGlyph}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-3 p-4 glass-panel border-white/5 bg-white/5">
                                {glyphs.map((char, i) => (
                                    <button
                                        key={i}
                                        onPointerDown={() => handleGlyphClick(char)}
                                        className="w-12 h-12 glass-panel border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-400/10 text-cyan-400 font-mono text-xl transition-all active:scale-90 touch-manipulation"
                                    >
                                        {char}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {type === 'WIRES' && (
                        <div className="flex flex-col items-center gap-8">
                            <div className="grid grid-cols-3 gap-6">
                                {wireGrid.map((state, i) => (
                                    <button
                                        key={i}
                                        onPointerDown={() => handleWireClick(i)}
                                        disabled={state === 1}
                                        className={`w-16 h-16 rounded-sm border-2 flex flex-col items-center justify-center transition-all touch-manipulation relative
                                        ${state === 1 ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-rose-500/30 bg-rose-500/5 text-rose-500/40 animate-pulse'}
                                    `}
                                    >
                                        <Zap className={`w-6 h-6 ${state === 1 ? 'opacity-100' : 'opacity-20'}`} />
                                        <span className="text-[8px] font-black mt-1 font-technical tracking-widest">{state === 1 ? t(TL.ui.synced, lang) : t(TL.ui.offline, lang)}</span>
                                        {state === 0 && <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(244,63,94,0.1)_0%,transparent_70%)]" />}
                                    </button>
                                ))}
                            </div>
                            <div className="text-[10px] font-black font-technical text-white/20 uppercase tracking-[0.4em]">{t(TL.ui.bridgeNodes, lang)}</div>
                        </div>
                    )}
                </div>

                {/* PROGRESS / FOOTER */}
                <div className="w-full relative z-10 pt-8">
                    <div className="flex justify-between items-end mb-2 px-1">
                        <span className="text-[9px] font-black font-technical text-white/30 uppercase tracking-widest">{t(TL.ui.bufferIntegrity, lang)}</span>
                        <span className={`text-[10px] font-black font-technical ${timeLeft < 2 ? 'text-rose-500' : 'text-cyan-400'}`}>{Math.ceil(timePercent)}%</span>
                    </div>
                    <div className="w-full h-1.5 glass-panel p-0.5 border-white/10 bg-black/40 overflow-hidden">
                        <motion.div
                            className={`h-full transition-all duration-300 relative rounded-full ${timeLeft < 2 ? 'bg-rose-500' : 'bg-cyan-500'}`}
                            initial={{ width: '100%' }}
                            animate={{ width: `${timePercent}%` }}
                        />
                    </div>
                </div>

            </motion.div>
        </div>
    );
};

export default CombatMinigameOverlay;
