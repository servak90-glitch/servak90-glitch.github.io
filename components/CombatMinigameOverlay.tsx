
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CombatMinigameType } from '../types';

interface CombatMinigameOverlayProps {
  type: CombatMinigameType;
  difficulty: number;
  onComplete: (success: boolean) => void;
}

const CombatMinigameOverlay: React.FC<CombatMinigameOverlayProps> = ({ type, difficulty, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(5.0); // Base time for hacking
  const [status, setStatus] = useState<'PLAYING' | 'WON' | 'LOST'>('PLAYING');

  // --- GAME SPECIFIC STATE ---
  
  // MASH
  const [mashCount, setMashCount] = useState(0);
  const mashTarget = 15 + (difficulty * 5); // 20-30 taps

  // TIMING
  const [timingPosition, setTimingPosition] = useState(0);
  const timingDirection = useRef(1);
  const timingSpeed = 1.5 + (difficulty * 0.5);
  const timingZone = { start: 40, width: 20 - (difficulty * 2) }; // Smaller zone on hard

  // MEMORY
  const [memorySequence, setMemorySequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isShowingSequence, setIsShowingSequence] = useState(true);
  const [currentShowIndex, setCurrentShowIndex] = useState(-1);

  // ALIGN
  const [alignPos, setAlignPos] = useState(50);
  const [alignVelocity, setAlignVelocity] = useState(0);
  const [alignTarget, setAlignTarget] = useState(50);
  
  // GLYPH
  const [glyphs, setGlyphs] = useState<string[]>([]);
  const [targetGlyph, setTargetGlyph] = useState('');

  // WIRES
  const [wireGrid, setWireGrid] = useState<number[]>([]); // 0: straight, 1: turn, rotation embedded
  
  const timerRef = useRef<any>(null);
  const gameLoopRef = useRef<number>(0);

  useEffect(() => {
    // INIT GAMES
    if (type === 'MASH') {
        setTimeLeft(8.0); // [DEV_CONTEXT: FIX] Increased from 4.0 to 8.0
    } 
    else if (type === 'MEMORY') {
        const len = 3 + difficulty;
        const seq = Array.from({length: len}, () => Math.floor(Math.random() * 4));
        setMemorySequence(seq);
        setTimeLeft(10.0); // More time for memory
        
        // Sequence Player
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
        const chars = ['Ж', 'Щ', 'Ф', 'Ω', 'Ψ', 'Δ', 'Ξ'];
        const target = chars[Math.floor(Math.random() * chars.length)];
        const noise = chars.filter(c => c !== target);
        const grid = Array.from({length: 16}, () => Math.random() > 0.8 ? target : noise[Math.floor(Math.random() * noise.length)]);
        // Ensure at least one target
        if (!grid.includes(target)) grid[Math.floor(Math.random()*16)] = target;
        setGlyphs(grid);
        setTargetGlyph(target);
        setTimeLeft(4.0);
    }
    else if (type === 'WIRES') {
        // Simple 3x3 grid rotation puzzle. 
        // 0=Straight, 1=Corner. Random rotations 0-3.
        // Goal: Just click all nodes to '0' rotation (simplified)
        // Or simpler: Click red nodes to turn green.
        setWireGrid(Array.from({length: 4 + difficulty}, () => 0)); // 0 = bad, 1 = good
        setTimeLeft(3.0 + difficulty);
    }
    else if (type === 'ALIGN') {
        setTimeLeft(5.0);
    }
  }, [type, difficulty]);

  // --- ACTIONS ---

  const handleFinish = (result: boolean) => {
      // Prevent double triggering
      if (status !== 'PLAYING') return;
      
      setStatus(result ? 'WON' : 'LOST');
      
      // Stop loops immediately
      if (timerRef.current) clearInterval(timerRef.current);
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);

      setTimeout(() => onComplete(result), 1000);
  };

  // MAIN TIMER
  useEffect(() => {
      if (status !== 'PLAYING') return;
      
      timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
              // Just decrement here. Logic is handled in the effect below.
              if (prev <= 0.1) return 0;
              return prev - 0.1;
          });
      }, 100);

      return () => clearInterval(timerRef.current);
  }, [status]);

  // [DEV_CONTEXT: FIX] Auto-fail watcher when time hits 0
  useEffect(() => {
      if (timeLeft <= 0 && status === 'PLAYING') {
          handleFinish(false);
      }
  }, [timeLeft, status]);

  // GAME LOOP (Animation Frames)
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
              // Random target movement
              if (Math.random() < 0.05) setAlignTarget(Math.random() * 80 + 10);
              
              // Physics
              setAlignPos(p => {
                  const next = p + alignVelocity;
                  if (next < 0 || next > 100) setAlignVelocity(v => -v * 0.5);
                  return Math.max(0, Math.min(100, next));
              });
              
              // Gravity/Drift away from target
              const force = (alignPos < alignTarget ? -0.2 : 0.2);
              setAlignVelocity(v => v + force * 0.1); // Drift
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
      
      // Check correctness immediately
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
      // Push towards center/target
      const push = alignPos < alignTarget ? 2 : -2;
      setAlignVelocity(v => v + push);
      
      // Click when aligned to win
      if (Math.abs(alignPos - alignTarget) < 10) {
          handleFinish(true);
      }
  };

  const handleGlyphClick = (char: string) => {
      if (status !== 'PLAYING') return;
      if (char === targetGlyph) handleFinish(true);
      else handleFinish(false); // Immediate fail on wrong click
  };

  const handleWireClick = (index: number) => {
      if (status !== 'PLAYING') return;
      const newGrid = [...wireGrid];
      newGrid[index] = 1; // Turn on
      setWireGrid(newGrid);
      if (newGrid.every(x => x === 1)) handleFinish(true);
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm select-none pointer-events-auto touch-none">
        
        {/* CONTAINER */}
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`
                w-80 h-80 border-4 relative p-4 flex flex-col items-center justify-between
                ${status === 'PLAYING' ? 'border-cyan-500 bg-zinc-900' : 
                  status === 'WON' ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'}
            `}
        >
            {/* HEADER */}
            <div className="w-full flex justify-between items-center text-xs font-mono mb-4">
                <span className={status === 'PLAYING' ? "text-cyan-400 animate-pulse" : ""}>
                    {status === 'PLAYING' ? `[HACKING: ${type}]` : status}
                </span>
                <span className={timeLeft < 2 ? "text-red-500 font-bold" : "text-white"}>
                    {timeLeft.toFixed(1)}s
                </span>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 w-full relative flex items-center justify-center">
                
                {/* MASH */}
                {type === 'MASH' && (
                    <button 
                        onPointerDown={handleMash}
                        className="w-32 h-32 rounded-full border-4 border-cyan-500 flex items-center justify-center active:scale-95 active:bg-cyan-900/50 transition-transform touch-manipulation"
                    >
                        <div className="text-center">
                            <div className="text-3xl font-black text-white">{Math.max(0, mashTarget - mashCount)}</div>
                            <div className="text-[10px] text-cyan-400">TAP FAST!</div>
                        </div>
                    </button>
                )}

                {/* TIMING */}
                {type === 'TIMING' && (
                    <div 
                        className="w-full h-12 bg-black border-2 border-zinc-700 relative cursor-pointer touch-manipulation" 
                        onPointerDown={handleTimingClick}
                    >
                        {/* Target Zone */}
                        <div 
                            className="absolute top-0 bottom-0 bg-green-900/50 border-x-2 border-green-500"
                            style={{ left: `${timingZone.start}%`, width: `${timingZone.width}%` }}
                        />
                        {/* Cursor */}
                        <div 
                            className="absolute top-[-4px] bottom-[-4px] w-2 bg-white shadow-[0_0_10px_white]"
                            style={{ left: `${timingPosition}%` }}
                        />
                        <div className="absolute top-full mt-2 w-full text-center text-[10px] text-zinc-500">TAP ON GREEN</div>
                    </div>
                )}

                {/* MEMORY */}
                {type === 'MEMORY' && (
                    <div className="grid grid-cols-2 gap-2">
                        {[0, 1, 2, 3].map(i => (
                            <button
                                key={i}
                                onPointerDown={() => handleMemoryClick(i)}
                                disabled={isShowingSequence}
                                className={`w-16 h-16 border-2 flex items-center justify-center text-xl font-bold transition-colors touch-manipulation
                                    ${currentShowIndex === i ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_cyan]' : 'bg-black border-zinc-700 text-zinc-500'}
                                    ${!isShowingSequence && 'active:bg-zinc-700'}
                                `}
                            >
                                {['α', 'β', 'γ', 'δ'][i]}
                            </button>
                        ))}
                    </div>
                )}

                {/* ALIGN */}
                {type === 'ALIGN' && (
                    <div className="w-full h-full relative touch-none" onPointerDown={handleAlignClick}>
                        {/* Target */}
                        <div 
                            className="absolute left-0 right-0 h-1 bg-green-500/30 border-y border-green-500"
                            style={{ top: `${alignTarget}%`, height: '20%' }}
                        >
                            <span className="absolute right-1 top-0 text-[8px] text-green-400">SYNC ZONE</span>
                        </div>
                        
                        {/* Player */}
                        <div 
                            className="absolute left-1/4 right-1/4 h-2 bg-white shadow-[0_0_10px_cyan]"
                            style={{ top: `${alignPos}%` }}
                        />
                        
                        <div className="absolute bottom-2 w-full text-center text-[10px] text-zinc-500">TAP TO BOOST UP / WAIT TO FALL</div>
                    </div>
                )}

                {/* GLYPH */}
                {type === 'GLYPH' && (
                    <div className="grid grid-cols-4 gap-2">
                        {glyphs.map((char, i) => (
                            <button 
                                key={i}
                                onPointerDown={() => handleGlyphClick(char)}
                                className="w-10 h-10 bg-black border border-zinc-700 text-cyan-500 font-mono text-lg hover:bg-zinc-800 touch-manipulation"
                            >
                                {char}
                            </button>
                        ))}
                        <div className="absolute -top-8 w-full text-center text-white font-bold bg-black/50">
                            FIND: <span className="text-green-400 text-xl">{targetGlyph}</span>
                        </div>
                    </div>
                )}

                {/* WIRES (Simplified to "Activate Nodes") */}
                {type === 'WIRES' && (
                    <div className="grid grid-cols-3 gap-3">
                        {wireGrid.map((state, i) => (
                            <button
                                key={i}
                                onPointerDown={() => handleWireClick(i)}
                                disabled={state === 1}
                                className={`w-12 h-12 border-2 rounded-full flex items-center justify-center transition-all touch-manipulation
                                    ${state === 1 ? 'border-green-500 bg-green-900/50 text-green-400' : 'border-red-500 bg-red-900/20 text-red-500 animate-pulse'}
                                `}
                            >
                                {state === 1 ? 'ON' : 'OFF'}
                            </button>
                        ))}
                    </div>
                )}

            </div>

            {/* PROGRESS / FOOTER */}
            <div className="w-full h-1 bg-zinc-800 mt-4">
                <div 
                    className={`h-full transition-all duration-100 ${timeLeft < 2 ? 'bg-red-500' : 'bg-cyan-500'}`} 
                    style={{ width: `${(timeLeft / (type === 'MEMORY' ? 10 : (type === 'MASH' ? 8 : 5))) * 100}%` }}
                />
            </div>

        </motion.div>
    </div>
  );
};

export default CombatMinigameOverlay;
