
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

const CoolingOverlay: React.FC = () => {
    const activeView = useGameStore(state => state.activeView);
    const cooling = useGameStore(state => state.cooling);
    const heat = useGameStore(state => state.heat);
    const attemptVent = useGameStore(state => state.attemptVent);

    // Only show in Drill View and when heating up significantly?
    // User plan: "Always available but effective > 50%".
    // Let's show it always in Drill View.
    if (activeView !== 'DRILL') return null;

    // Visual Feedback for Vent result
    const [feedback, setFeedback] = useState<{ msg: string, color: string, id: number } | null>(null);

    useEffect(() => {
        if (cooling.lastVentResult) {
            const id = Date.now();
            let text = '';
            let color = '';

            if (cooling.lastVentResult === 'PERFECT') {
                text = 'PERFECT!';
                color = 'text-cyan-400';
            } else if (cooling.lastVentResult === 'GOOD') {
                text = 'GOOD';
                color = 'text-green-400';
            } else if (cooling.lastVentResult === 'MISS') {
                text = 'MISS!';
                color = 'text-red-500';
            }

            if (text) {
                setFeedback({ msg: text, color, id });
                const timer = setTimeout(() => setFeedback(null), 800);
                return () => clearTimeout(timer);
            }
        }
    }, [cooling.lastVentResult, cooling.combo]);

    // RHYTHM INDICATOR
    // We visualize the "Target Zone" as a static ring, and the "Pulse" as a dynamic ring.
    // When Pulse matches Target, click!

    // targetSize is usually 1.0.
    // pulseSize oscillates 0.5 to 1.5.

    // SCALING:
    // UI Size: 128px
    // Pulse Scale: cooling.pulseSize

    return (
        <div className="absolute left-4 bottom-32 pointer-events-none flex flex-col items-center z-40">
            {/* HEAT GAUGE (Mini) */}
            <div className="mb-2 text-xs font-mono font-bold text-white drop-shadow-md">
                HEAT: {Math.round(heat)}%
            </div>

            <div className="relative w-24 h-24 flex items-center justify-center">
                {/* STATIC TARGET RING */}
                <div className="absolute w-20 h-20 rounded-full border-4 border-white/30" />

                {/* PERFECT ZONE INDICATOR (Subtle glow) */}
                <div className="absolute w-20 h-20 rounded-full border-2 border-cyan-400/50 opacity-50 shadow-[0_0_10px_cyan]" />

                {/* DYNAMIC PULSE RING */}
                <motion.div
                    className="absolute w-20 h-20 rounded-full border-4 border-cyan-500 shadow-[0_0_15px_cyan]"
                    animate={{
                        scale: cooling.pulseSize,
                        opacity: cooling.isActive ? 1 : 0.5
                    }}
                    transition={{ duration: 0 }} // Instant update from store state
                />

                {/* VENT BUTTON */}
                <button
                    onPointerDown={(e) => {
                        e.preventDefault();
                        attemptVent();
                    }}
                    className={`
                        relative w-16 h-16 rounded-full 
                        flex items-center justify-center 
                        font-black text-xs pointer-events-auto
                        transition-all duration-75 active:scale-90
                        ${cooling.cooldownTimer > 0
                            ? 'bg-gray-700 text-gray-400 border-gray-600'
                            : 'bg-gradient-to-br from-blue-600 to-blue-800 text-white border-blue-400 shadow-lg shadow-blue-900/50 hover:brightness-110'}
                        border-2
                    `}
                >
                    {cooling.cooldownTimer > 0
                        ? (cooling.cooldownTimer.toFixed(1))
                        : "VENT"}
                </button>
            </div>

            {/* FEEDBACK POPUP */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        key={feedback.id}
                        initial={{ opacity: 0, y: 0, scale: 0.5 }}
                        animate={{ opacity: 1, y: -40, scale: 1.2 }}
                        exit={{ opacity: 0 }}
                        className={`absolute top-0 font-black text-xl stroke-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] ${feedback.color}`}
                    >
                        {feedback.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* COMBO COUNTER */}
            {cooling.combo > 1 && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-4 top-0 rotate-12 text-yellow-400 font-bold text-lg drop-shadow-md"
                >
                    x{cooling.combo}
                </motion.div>
            )}
        </div>
    );
};

export default CoolingOverlay;
