
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CoolingMinigameProps {
  isVisible: boolean;
  heat: number;
  onSuccess: (amount: number) => void;
  onFail: () => void; // New callback for timer expiry
  onClose: () => void;
}

const CoolingMinigame: React.FC<CoolingMinigameProps> = ({ isVisible, heat, onSuccess, onFail, onClose }) => {
  const [targets, setTargets] = useState<{id: number, x: number, y: number}[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(2.3); // HARDCORE: 2.3 Seconds Timer
  
  // Refs to hold latest callbacks (fixes timer reset issue on parent re-render)
  const onFailRef = useRef(onFail);
  const onCloseRef = useRef(onClose);
  const onSuccessRef = useRef(onSuccess);

  // Keep refs updated
  useEffect(() => {
    onFailRef.current = onFail;
    onCloseRef.current = onClose;
    onSuccessRef.current = onSuccess;
  }, [onFail, onClose, onSuccess]);

  // Reset when visibility changes
  useEffect(() => {
    if (isVisible) {
      setScore(0);
      setTimeLeft(2.3);
      generateTargets(3); // Start with 3 targets
    } else {
      setTargets([]);
    }
  }, [isVisible]);

  // Timer Logic: Decrement only
  useEffect(() => {
      if (!isVisible) return;
      
      const interval = setInterval(() => {
          setTimeLeft(prev => Math.max(0, prev - 0.1));
      }, 100);

      return () => clearInterval(interval);
  }, [isVisible]);

  // Check for expiry separately to avoid side-effects in render/updater phase
  useEffect(() => {
      if (isVisible && timeLeft <= 0) {
          // Push state update to next tick to avoid React Error #310 (Nested updates)
          const timer = setTimeout(() => {
             onFailRef.current(); 
             onCloseRef.current();
          }, 0);
          return () => clearTimeout(timer);
      }
  }, [isVisible, timeLeft]);

  const generateTargets = (count: number) => {
    const newTargets = [];
    for(let i=0; i<count; i++) {
        newTargets.push({
            id: Date.now() + i,
            x: 20 + Math.random() * 60, // Keep within 20-80% to be clickable
            y: 20 + Math.random() * 60
        });
    }
    setTargets(newTargets);
  };

  const handleTargetClick = (id: number) => {
      setTargets(prev => prev.filter(t => t.id !== id));
      setScore(s => s + 1);
      
      // Target: 5 clicks
      if (score + 1 >= 5) {
          onSuccessRef.current(20); // Vent 20 heat (20% of max)
          onCloseRef.current();
      } else if (targets.length === 1) {
          // Spawn more if needed
          generateTargets(2);
      }
  };

  if (!isVisible && heat < 80) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
           {/* Overlay */}
           <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }} 
             exit={{ opacity: 0 }}
             className="absolute inset-0 bg-red-900/50 backdrop-blur-sm pointer-events-auto"
           />
           
           {/* HEADER & TIMER */}
           <div className="absolute top-20 text-center pointer-events-none w-full flex flex-col items-center">
               <h2 className="text-2xl pixel-text text-red-500 font-black drop-shadow-[0_0_5px_black] mb-2 animate-pulse">АВАРИЙНЫЙ СБРОС</h2>
               <p className="text-white font-mono text-xs mb-4">НАЖИМАЙ НА КЛАПАНЫ!</p>
               
               {/* TIMER BAR */}
               <div className="w-64 h-4 bg-black border-2 border-white/50 rounded-full overflow-hidden relative">
                   <div 
                      className="h-full bg-yellow-500 transition-all duration-100 ease-linear" 
                      style={{ width: `${(timeLeft / 2.3) * 100}%` }}
                   />
                   <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-black z-10 font-mono">
                       {timeLeft.toFixed(1)}s
                   </span>
               </div>
           </div>

           {/* Targets */}
           {targets.map(t => (
               <motion.button
                  key={t.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => handleTargetClick(t.id)}
                  className="absolute w-16 h-16 rounded-full bg-red-600 border-4 border-white shadow-[0_0_20px_red] flex items-center justify-center pointer-events-auto cursor-pointer"
                  style={{ left: `${t.x}%`, top: `${t.y}%` }}
               >
                   <span className="text-white font-black text-xl">⚠️</span>
               </motion.button>
           ))}
           
           {/* Close Button (Fail Safe, acts as Cancel/Fail) */}
           <button 
             onClick={onClose}
             className="absolute bottom-10 px-6 py-2 border border-white/50 text-white/50 hover:bg-white/10 pointer-events-auto font-mono text-xs"
           >
             ОТМЕНА
           </button>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CoolingMinigame;
