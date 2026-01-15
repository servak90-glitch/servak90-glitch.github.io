
import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { BossType } from '../types'; // [DEV_CONTEXT: HARDENING]

interface BossRendererProps {
  isHit: boolean; // Visual trigger, passed from parent as it's event-based
}

const BossRenderer: React.FC<BossRendererProps> = React.memo(({ isHit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId = 0;
    let tick = 0;

    const render = () => {
       frameId = requestAnimationFrame(render);
       tick++;

       // [DEV_CONTEXT: DIRECT ACCESS]
       const state = useGameStore.getState();
       const boss = state.currentBoss;

       // If boss disappeared but component still mounted (rare race condition), clear and return
       if (!boss) {
           ctx.clearRect(0, 0, canvas.width, canvas.height);
           return;
       }

       const hpPercent = boss.currentHp / boss.maxHp;
       const color = boss.color;
       const bossType = boss.type;

       const w = canvas.width;
       const h = canvas.height;
       const cx = w / 2;
       const cy = h * 0.4;
       
       ctx.clearRect(0, 0, w, h);
       
       if (isHit) {
         ctx.save();
         ctx.translate((Math.random()-0.5)*10, (Math.random()-0.5)*10);
       }

       ctx.strokeStyle = isHit ? '#fff' : color;
       ctx.fillStyle = isHit ? '#fff' : '#000';
       ctx.lineWidth = 3;
       ctx.shadowBlur = 15;
       ctx.shadowColor = color;

       const pulse = Math.sin(tick * 0.05) * 10;

       ctx.beginPath();
       
       // [DEV_CONTEXT: HARDENING] Switch on Enum
       if (bossType === BossType.WORM) {
          // Draw Segmented Worm
          for(let i=0; i<5; i++) {
             const yOffset = i * 40 + Math.sin(tick * 0.1 + i) * 10;
             const width = 60 - i * 5 + pulse/2;
             ctx.rect(cx - width/2, cy + yOffset, width, 30);
          }
       } 
       else if (bossType === BossType.CORE) {
          // Draw Spinning Core
          const size = 60 + pulse;
          ctx.arc(cx, cy + 50, size, 0, Math.PI * 2);
          // Orbiting rings
          ctx.moveTo(cx + size + 20, cy + 50);
          ctx.ellipse(cx, cy + 50, size + 30, 20, tick * 0.05, 0, Math.PI * 2);
       }
       else if (bossType === BossType.CONSTRUCT) {
          // Rotating Square
          ctx.save();
          ctx.translate(cx, cy + 50);
          ctx.rotate(tick * 0.02);
          const size = 80;
          ctx.rect(-size/2, -size/2, size, size);
          ctx.rotate(tick * 0.02); // Double rotation
          ctx.rect(-size/3, -size/3, size/1.5, size/1.5);
          ctx.restore();
       } 
       else { // SWARM
          // Cluster of dots
          for(let i=0; i<8; i++) {
             const angle = (Math.PI * 2 / 8) * i + tick * 0.05;
             const r = 60 + Math.sin(tick * 0.1) * 20;
             const x = cx + Math.cos(angle) * r;
             const y = cy + 50 + Math.sin(angle) * r;
             ctx.moveTo(x + 10, y);
             ctx.arc(x, y, 10, 0, Math.PI * 2);
          }
       }
       
       ctx.stroke();
       if (hpPercent < 0.3 && tick % 10 < 5) {
          ctx.fillStyle = 'red';
          ctx.fill();
       } else {
          ctx.fill();
       }

       if (isHit) ctx.restore();
    };

    const handleResize = () => {
        if (canvas.parentElement) {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
       }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    render();

    return () => {
       window.removeEventListener('resize', handleResize);
       cancelAnimationFrame(frameId);
    };
  }, [isHit]); // Only re-run effect if isHit changes, though RAF handles the loop

  return <canvas ref={canvasRef} className="w-full h-full block" />;
});

export default BossRenderer;
