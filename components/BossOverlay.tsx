import React from 'react';
import { useGameStore } from '../store/gameStore';
import { WeakPoint } from '../types';
import { Target } from 'lucide-react';

interface BossOverlayProps {
    onWeakPointClick: (wpId: string) => void;
}

const BossOverlay: React.FC<BossOverlayProps> = ({ onWeakPointClick }) => {
    const currentBoss = useGameStore(s => s.currentBoss);

    if (!currentBoss || !currentBoss.weakPoints) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
            {/* Center Reference Point Matching BossRenderer logic */}
            <div className="absolute top-[40%] left-1/2 w-0 h-0">
                {currentBoss.weakPoints.map((wp: WeakPoint) => {
                    if (!wp.isActive) return null;

                    const style: React.CSSProperties = {
                        transform: `translate(${wp.x * 2.5}px, ${wp.y * 2.5}px)`,
                        width: `${wp.radius * 2.5}px`,
                        height: `${wp.radius * 2.5}px`,
                        marginTop: `-${(wp.radius * 2.5) / 2}px`,
                        marginLeft: `-${(wp.radius * 2.5) / 2}px`,
                    };

                    return (
                        <button
                            key={wp.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onWeakPointClick(wp.id);
                            }}
                            style={style}
                            className="absolute pointer-events-auto rounded-full border-2 border-rose-500 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all hover:bg-rose-500/40 hover:scale-110 active:scale-95 cursor-crosshair group flex items-center justify-center"
                        >
                            {/* Reticle UI */}
                            <Target className="w-full h-full text-rose-500 opacity-60 group-hover:opacity-100 group-hover:rotate-90 transition-all duration-500" />

                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[7px] font-black text-rose-500 whitespace-nowrap uppercase tracking-[0.2em] bg-black/80 px-1 border border-rose-500/30">
                                    WEAK_POINT_LOCK
                                </span>
                                <div className="w-px h-2 bg-rose-500/50" />
                            </div>

                            {/* Ping Animation Loops */}
                            <div className="absolute inset-[-4px] border border-rose-500/30 rounded-full animate-ping pointer-events-none" />
                            <div className="absolute inset-0 border border-rose-100/20 rounded-full scale-125 opacity-0 group-hover:opacity-100 animate-pulse pointer-events-none" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BossOverlay;
