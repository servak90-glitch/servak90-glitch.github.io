
import React, { useEffect, useRef } from 'react';
import { VisualEffectType } from '../types';
import { TUNNEL_PROPS, BIOMES } from '../constants';
import { useGameStore } from '../store/gameStore';
import { ARTIFACTS } from '../services/artifactRegistry';

interface DrillRendererProps {
    // No data props, component reads directly from store for performance
    activeBuffIds?: string[];
}

const getRarityColor = (rarity: string) => {
    switch (rarity) {
        case 'Common': return '#64748b'; // Slate
        case 'Rare': return '#3b82f6';   // Blue
        case 'Epic': return '#a855f7';   // Purple
        case 'Legendary': return '#f59e0b'; // Amber
        case 'Godly': return '#ef4444';  // Red
        default: return '#64748b';
    }
};

const getPropAtDepth = (depthIndex: number) => {
    // Simple hash function for deterministic prop placement
    const sin = Math.sin(depthIndex * 12.9898);
    const random = sin - Math.floor(sin);
    const meters = depthIndex * 50;
    const eligible = TUNNEL_PROPS.filter(p => meters >= p.minDepth && meters <= p.maxDepth);
    if (eligible.length === 0) return null;
    if (random < 0.2) {
        const prop = eligible[Math.floor(Math.random() * eligible.length)];
        if (random < prop.chance) return prop;
    }
    return null;
};

// [DEV_CONTEXT: PERFORMANCE] Using React.memo to prevent re-renders from parent
const DrillRenderer: React.FC<DrillRendererProps> = React.memo(() => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scrollRef = useRef(0);
    const prevDepthRef = useRef(0);

    // Pre-calculated noise buffer to avoid Math.random() in render loop
    const noiseBufferRef = useRef<Float32Array | null>(null);

    useEffect(() => {
        // Init static noise buffer (Performance Optimization)
        if (!noiseBufferRef.current) {
            noiseBufferRef.current = new Float32Array(200); // 200 segments is enough for any screen height
            for (let i = 0; i < 200; i++) {
                noiseBufferRef.current[i] = Math.random();
            }
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency on canvas bg
        if (!ctx) return;

        let frameId = 0;
        let tick = 0;

        const render = () => {
            frameId = requestAnimationFrame(render);
            tick++;

            // [DEV_CONTEXT: DIRECT ACCESS] Bypass React State for 60FPS
            const state = useGameStore.getState();
            const { heat, drill, isDrilling, activeEffects, depth, selectedBiome, inventory, equippedArtifacts, isShielding } = state;

            // [DEV_CONTEXT: WARP SYNC] Detect large depth changes (admin jump) and sync visuals
            if (Math.abs(depth - prevDepthRef.current) > 500) {
                scrollRef.current = depth * 4;
            }
            prevDepthRef.current = depth;

            const spinning = isDrilling;

            const activeBuffIds = activeEffects.map(e => e.id.split('_')[1] || e.id);

            const activeVisualEffects: VisualEffectType[] = [];
            equippedArtifacts.forEach(id => {
                const item = inventory[id];
                if (item) {
                    const def = ARTIFACTS.find(a => a.id === item.defId);
                    if (def?.visualEffect) activeVisualEffects.push(def.visualEffect);
                }
            });

            // Calculate Biome Color
            let currentBiome = BIOMES[0];
            if (selectedBiome) {
                currentBiome = BIOMES.find(b => (typeof b.name === 'string' ? b.name : b.name.EN) === selectedBiome) || BIOMES[0];
            } else {
                currentBiome = BIOMES.slice().reverse().find(b => depth >= b.depth) || BIOMES[0];
            }
            const biomeColor = currentBiome.color;

            const w = canvas.width;
            const h = canvas.height;
            const cx = w / 2;

            const scale = Math.min(w / 400, h / 800);
            const cy = h * 0.35;

            // Scroll Physics
            const baseSpeed = spinning ? (heat >= 100 ? 0 : (15 + (drill.engine.tier * 2)) * 0.5) : 0;
            scrollRef.current += baseSpeed;

            // Clear Canvas
            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, w, h);

            // --- 1. TUNNEL BACKGROUND RENDERING ---
            const drawTunnel = () => {
                // A. Gradient Background (Simulates depth fog)
                const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
                bgGrad.addColorStop(0, '#000');
                bgGrad.addColorStop(0.3, `${biomeColor}11`);
                bgGrad.addColorStop(1, `${biomeColor}44`);
                ctx.fillStyle = bgGrad;
                ctx.fillRect(0, 0, w, h);

                // B. Strata Lines & Props (Batched)
                const segmentHeight = 200;
                const scrollY = scrollRef.current % segmentHeight;
                const currentSegmentIndex = Math.floor(scrollRef.current / segmentHeight);

                const segmentsInView = Math.ceil(h / segmentHeight) + 1;

                for (let i = -1; i < segmentsInView; i++) {
                    const drawY = (i * segmentHeight) - scrollY;
                    const absoluteSegmentIndex = currentSegmentIndex + i;

                    // Draw Strata Band
                    ctx.fillStyle = `${biomeColor}22`;
                    ctx.fillRect(0, drawY, w, segmentHeight * 0.4);

                    // Draw Separator Line
                    ctx.fillStyle = `${biomeColor}55`;
                    ctx.fillRect(0, drawY, w, 2);

                    // Draw Prop (if exists)
                    const prop = getPropAtDepth(absoluteSegmentIndex);
                    if (prop) {
                        const propX = (absoluteSegmentIndex % 2 === 0) ? w * 0.2 : w * 0.8;

                        ctx.save();
                        ctx.translate(propX, drawY + segmentHeight / 2);
                        ctx.fillStyle = prop.color;
                        ctx.globalAlpha = 0.5;

                        if (prop.type === 'FOSSIL') {
                            ctx.strokeStyle = '#AAA';
                            ctx.lineWidth = 3;
                            ctx.beginPath();
                            ctx.moveTo(-10, 0); ctx.lineTo(10, 0);
                            ctx.moveTo(-5, -5); ctx.lineTo(-5, 5);
                            ctx.moveTo(5, -5); ctx.lineTo(5, 5);
                            ctx.stroke();
                        } else if (prop.type === 'PIPE') {
                            ctx.fillStyle = '#554433';
                            ctx.fillRect(-15, -100, 30, 200); // Simple pipe
                        } else if (prop.type === 'CRYSTAL') {
                            ctx.beginPath();
                            ctx.moveTo(0, -40);
                            ctx.lineTo(25, 0);
                            ctx.lineTo(0, 40);
                            ctx.lineTo(-25, 0);
                            ctx.fill();
                        } else if (prop.type === 'RUIN') {
                            ctx.fillStyle = '#333';
                            ctx.fillRect(-25, -25, 50, 50);
                            ctx.fillStyle = '#FFD700';
                            ctx.font = '12px monospace';
                            ctx.fillText('?', -4, 4);
                        }
                        ctx.restore();
                    }
                }

                // C. Tunnel Walls (Optimized Noise)
                const wallWidth = w * 0.15;
                const wallSegHeight = 40; // Pixels per noise segment
                const wallScroll = scrollRef.current % wallSegHeight;
                const noiseOffset = Math.floor(scrollRef.current / wallSegHeight);

                const noiseArr = noiseBufferRef.current!;
                const noiseLen = noiseArr.length;

                ctx.fillStyle = '#000';

                // Left Wall
                ctx.beginPath();
                ctx.moveTo(0, 0);
                for (let i = -1; i < segmentsInView * (segmentHeight / wallSegHeight); i++) {
                    const y = (i * wallSegHeight) - wallScroll;
                    // Loop noise buffer
                    const noiseIdx = Math.abs((noiseOffset + i) % noiseLen);
                    const roughness = noiseArr[noiseIdx] * 30;
                    ctx.lineTo(wallWidth + roughness, y);
                }
                ctx.lineTo(0, h);
                ctx.closePath();
                ctx.fill();

                // Right Wall
                ctx.beginPath();
                ctx.moveTo(w, 0);
                for (let i = -1; i < segmentsInView * (segmentHeight / wallSegHeight); i++) {
                    const y = (i * wallSegHeight) - wallScroll;
                    // Offset noise index for variety on right side
                    const noiseIdx = Math.abs((noiseOffset + i + 50) % noiseLen);
                    const roughness = noiseArr[noiseIdx] * 30;
                    ctx.lineTo(w - wallWidth - roughness, y);
                }
                ctx.lineTo(w, h);
                ctx.closePath();
                ctx.fill();

                // Speed Lines (Visual Juice)
                if (spinning) {
                    ctx.strokeStyle = biomeColor;
                    ctx.lineWidth = 2;
                    ctx.globalAlpha = 0.2;
                    const speedLineCount = 4;
                    for (let i = 0; i < speedLineCount; i++) {
                        // Deterministic pseudo-random lines based on scroll
                        const lineSeed = Math.floor(scrollRef.current / 300) + i;
                        const xL = wallWidth + (lineSeed % 20);
                        const xR = w - wallWidth - ((lineSeed * 2) % 20);
                        const y = (scrollRef.current % h + (i * 200)) % h;
                        const len = 100;

                        ctx.beginPath(); ctx.moveTo(xL, y); ctx.lineTo(xL, y - len); ctx.stroke();
                        ctx.beginPath(); ctx.moveTo(xR, y); ctx.lineTo(xR, y - len); ctx.stroke();
                    }
                    ctx.globalAlpha = 1.0;
                }
            };
            drawTunnel();

            // --- 2. DRILL RENDERING (Foreground) ---

            let shakeX = 0;
            let shakeY = 0;
            if (spinning) {
                const intensity = (heat / 50) + 0.5;
                shakeX = (Math.random() - 0.5) * intensity;
                shakeY = (Math.random() - 0.5) * intensity;
            }

            ctx.save();
            ctx.translate(cx + shakeX, cy + shakeY);
            ctx.scale(scale, scale);

            // [DEV_CONTEXT: SHIELD RENDER]
            if (isShielding) { // Render active shield
                ctx.save();
                const shieldSize = 250 + Math.sin(tick * 0.2) * 5; // Fast pulse
                const grad = ctx.createRadialGradient(0, 0, shieldSize * 0.8, 0, 0, shieldSize);
                grad.addColorStop(0, 'rgba(56, 189, 248, 0)'); // Cyan center
                grad.addColorStop(1, 'rgba(56, 189, 248, 0.4)'); // Cyan edge

                ctx.fillStyle = grad;
                ctx.beginPath();
                // Hexagon Shield Shape
                for (let i = 0; i < 6; i++) {
                    const ang = (Math.PI / 3) * i;
                    const sx = Math.cos(ang) * shieldSize;
                    const sy = Math.sin(ang) * shieldSize;
                    if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
                }
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = '#38bdf8'; // Cyan
                ctx.lineWidth = 3;
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#0ea5e9';
                ctx.stroke();
                ctx.restore();
            } else if (activeBuffIds.includes('shield')) {
                // Render Passive Item Shield (Purple) if active and no Kinetic Shield
                ctx.save();
                const shieldSize = 250 + Math.sin(tick * 0.05) * 10;
                const grad = ctx.createRadialGradient(0, 0, shieldSize * 0.8, 0, 0, shieldSize);
                grad.addColorStop(0, 'rgba(147, 51, 234, 0)');
                grad.addColorStop(1, 'rgba(147, 51, 234, 0.4)');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, shieldSize, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#a855f7';
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.5;
                ctx.stroke();
                ctx.restore();
            }

            // TRACKS
            const drawTracks = () => {
                const trackW = 40 + (drill.engine.tier * 2);
                const trackH = 280;
                const trackX_Offset = 110;
                const trackY = -100;

                ctx.strokeStyle = '#444';
                ctx.lineWidth = 2;

                const drawOneTrack = (x: number) => {
                    // Металлический градиент для гусениц (3D-эффект)
                    const trackGrad = ctx.createLinearGradient(x - trackW / 2, 0, x + trackW / 2, 0);
                    trackGrad.addColorStop(0, '#0a0a0a');
                    trackGrad.addColorStop(0.2, '#1a1a1a');
                    trackGrad.addColorStop(0.4, '#2a2a2a');
                    trackGrad.addColorStop(0.5, '#333');
                    trackGrad.addColorStop(0.6, '#2a2a2a');
                    trackGrad.addColorStop(0.8, '#1a1a1a');
                    trackGrad.addColorStop(1, '#0a0a0a');
                    ctx.fillStyle = trackGrad;

                    ctx.beginPath();
                    ctx.roundRect(x - trackW / 2, trackY - trackH / 2, trackW, trackH, 10);
                    ctx.fill();
                    ctx.stroke();

                    // Блик на гусенице
                    ctx.save();
                    ctx.globalAlpha = 0.15;
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(x - trackW / 2 + 3, trackY - trackH / 2 + 5, 4, trackH - 10);
                    ctx.restore();

                    // Track treads
                    ctx.save();
                    ctx.beginPath();
                    ctx.roundRect(x - trackW / 2, trackY - trackH / 2, trackW, trackH, 10);
                    ctx.clip();
                    const speed = spinning ? (heat > 90 ? 0 : 4) : 0;
                    const offset = (tick * speed) % 20;

                    for (let i = -20; i < trackH + 20; i += 20) {
                        const y = (trackY - trackH / 2) + i - offset;
                        // Тень гребня
                        ctx.strokeStyle = '#222';
                        ctx.lineWidth = 5;
                        ctx.beginPath();
                        ctx.moveTo(x - trackW / 2 + 2, y + 2);
                        ctx.lineTo(x + trackW / 2 - 2, y + 2);
                        ctx.stroke();
                        // Гребень
                        ctx.strokeStyle = '#555';
                        ctx.lineWidth = 4;
                        ctx.beginPath();
                        ctx.moveTo(x - trackW / 2 + 2, y);
                        ctx.lineTo(x + trackW / 2 - 2, y);
                        ctx.stroke();
                    }
                    ctx.restore();

                    // Wheels с 3D-эффектом
                    const drawWheel = (wheelY: number) => {
                        const wheelR = trackW / 3;
                        // Тень
                        ctx.fillStyle = '#0a0a0a';
                        ctx.beginPath(); ctx.arc(x + 2, wheelY + 2, wheelR, 0, Math.PI * 2); ctx.fill();
                        // Основа
                        const wheelGrad = ctx.createRadialGradient(x - wheelR / 3, wheelY - wheelR / 3, 0, x, wheelY, wheelR);
                        wheelGrad.addColorStop(0, '#444');
                        wheelGrad.addColorStop(0.5, '#2a2a2a');
                        wheelGrad.addColorStop(1, '#111');
                        ctx.fillStyle = wheelGrad;
                        ctx.beginPath(); ctx.arc(x, wheelY, wheelR, 0, Math.PI * 2); ctx.fill();
                        // Блик
                        ctx.fillStyle = 'rgba(255,255,255,0.1)';
                        ctx.beginPath(); ctx.arc(x - wheelR / 4, wheelY - wheelR / 4, wheelR / 4, 0, Math.PI * 2); ctx.fill();
                    };
                    drawWheel(trackY - trackH / 2 + trackW / 2);
                    drawWheel(trackY + trackH / 2 - trackW / 2);
                };

                drawOneTrack(-trackX_Offset);
                drawOneTrack(trackX_Offset);

                // Axles с 3D-градиентом
                const axleGrad = ctx.createLinearGradient(0, trackY - 50, 0, trackY - 30);
                axleGrad.addColorStop(0, '#333');
                axleGrad.addColorStop(0.5, '#444');
                axleGrad.addColorStop(1, '#222');
                ctx.fillStyle = axleGrad;
                ctx.fillRect(-trackX_Offset, trackY - 50, trackX_Offset * 2, 20);
                ctx.fillRect(-trackX_Offset, trackY + 50, trackX_Offset * 2, 20);
            };
            drawTracks();

            // COOLING TANKS
            const drawCooling = () => {
                const tankW = 30;
                const tankH = 80;
                const tankX_Offset = 65;
                const tankY = 50;

                const drawTank = (x: number) => {
                    ctx.fillStyle = 'rgba(0, 20, 40, 0.8)';
                    ctx.strokeStyle = getRarityColor(drill.cooling.rarity);
                    ctx.lineWidth = 2;

                    ctx.beginPath();
                    ctx.roundRect(x - tankW / 2, tankY, tankW, tankH, 5);
                    ctx.fill();
                    ctx.stroke();

                    const fillLevel = Math.max(0.1, 1 - (heat / 120));
                    const liquidH = tankH * fillLevel;
                    const liquidY = tankY + (tankH - liquidH);

                    const isFrozen = activeBuffIds.includes('cold');
                    ctx.fillStyle = isFrozen ? '#e0f2fe' : (activeVisualEffects.includes('FROST_BLUE') ? '#a5f3fc' : '#06b6d4');

                    // Liquid
                    ctx.beginPath();
                    ctx.roundRect(x - tankW / 2 + 2, liquidY, tankW - 4, liquidH - 2, 2);
                    ctx.fill();

                    // Bubbles (if hot)
                    if (heat > 50 || isFrozen) {
                        ctx.fillStyle = 'rgba(255,255,255,0.5)';
                        for (let i = 0; i < 3; i++) {
                            // Deterministic bubbles based on tick
                            const bx = x - tankW / 4 + Math.sin(tick * 0.1 + i) * 5;
                            const by = liquidY + ((tick * 2 + i * 20) % liquidH);
                            ctx.beginPath(); ctx.arc(bx, by, 2, 0, Math.PI * 2); ctx.fill();
                        }
                    }
                };

                drawTank(-tankX_Offset);
                drawTank(tankX_Offset);
            };
            drawCooling();

            // MAIN BODY
            const drawBody = () => {
                const hullW = 100;
                const hullH = 180;
                const hullY = -50;

                // 3D-градиент с освещением сверху
                const bodyGrad = ctx.createLinearGradient(0, hullY - hullH / 2, 0, hullY + hullH / 2);
                bodyGrad.addColorStop(0, '#2a2a2e');   // Светлее сверху
                bodyGrad.addColorStop(0.15, '#222226');
                bodyGrad.addColorStop(0.5, '#18181b'); // Основной цвет
                bodyGrad.addColorStop(0.85, '#121214');
                bodyGrad.addColorStop(1, '#0a0a0b');   // Тень снизу
                ctx.fillStyle = bodyGrad;
                ctx.strokeStyle = getRarityColor(drill.hull.rarity);
                ctx.lineWidth = 3;

                // Hexagonal Shape
                ctx.beginPath();
                ctx.moveTo(-hullW / 2, hullY - hullH / 2 + 20);
                ctx.lineTo(-hullW / 2 + 20, hullY - hullH / 2);
                ctx.lineTo(hullW / 2 - 20, hullY - hullH / 2);
                ctx.lineTo(hullW / 2, hullY - hullH / 2 + 20);
                ctx.lineTo(hullW / 2, hullY + hullH / 2 - 20);
                ctx.lineTo(hullW / 2 - 10, hullY + hullH / 2);
                ctx.lineTo(-hullW / 2 + 10, hullY + hullH / 2);
                ctx.lineTo(-hullW / 2, hullY + hullH / 2 - 20);
                ctx.closePath();

                ctx.fill();
                ctx.stroke();

                // Металлические блики на гранях
                ctx.save();
                ctx.globalAlpha = 0.12;
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                // Левая грань
                ctx.beginPath();
                ctx.moveTo(-hullW / 2 + 3, hullY - hullH / 2 + 25);
                ctx.lineTo(-hullW / 2 + 3, hullY + hullH / 2 - 25);
                ctx.stroke();
                // Верхняя грань
                ctx.beginPath();
                ctx.moveTo(-hullW / 2 + 25, hullY - hullH / 2 + 3);
                ctx.lineTo(hullW / 2 - 25, hullY - hullH / 2 + 3);
                ctx.stroke();
                ctx.restore();

                // Тень снизу корпуса
                ctx.save();
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.moveTo(-hullW / 2 + 10, hullY + hullH / 2);
                ctx.lineTo(hullW / 2 - 10, hullY + hullH / 2);
                ctx.lineTo(hullW / 2 - 10, hullY + hullH / 2 + 8);
                ctx.lineTo(-hullW / 2 + 10, hullY + hullH / 2 + 8);
                ctx.closePath();
                ctx.fill();
                ctx.restore();

                // Regen Effect
                if (activeBuffIds.includes('regen')) {
                    ctx.save();
                    ctx.fillStyle = '#4ade80';
                    ctx.globalAlpha = 0.6;
                    const yOffset = (tick * 2) % hullH;
                    ctx.font = '10px monospace';
                    ctx.fillText('+', 20, hullY + hullH / 2 - yOffset);
                    ctx.fillText('+', -20, hullY + hullH / 2 - ((yOffset + 50) % hullH));
                    ctx.restore();
                }

                // Vents
                const engineTier = drill.engine.tier;
                const isOverdrive = activeBuffIds.includes('power');
                const ventColor = isOverdrive ? '#fff' : (heat > 80 ? '#ef4444' : '#f59e0b');

                for (let i = 0; i < 3 + Math.floor(engineTier / 5); i++) {
                    const vy = hullY - hullH / 2 + 30 + (i * 15);
                    // Тень вентиляции
                    ctx.fillStyle = '#050505';
                    ctx.fillRect(-hullW / 2 + 10, vy + 1, hullW - 20, 8);
                    // Основа вентиляции
                    ctx.fillStyle = '#0a0a0a';
                    ctx.fillRect(-hullW / 2 + 10, vy, hullW - 20, 8);

                    if (spinning) {
                        ctx.fillStyle = ventColor;
                        ctx.globalAlpha = 0.5 + Math.sin(tick * 0.5 + i) * 0.5;
                        ctx.fillRect(-hullW / 2 + 12, vy + 2, hullW - 24, 4);
                        ctx.globalAlpha = 1.0;
                    }
                }
            };
            drawBody();

            // POWER CORE
            const drawCore = () => {
                const cx = 0;
                const cy = 20;
                const radius = 25 + (drill.power.tier * 2);
                const color = getRarityColor(drill.power.rarity);

                ctx.fillStyle = '#000';
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(cx, cy, radius + 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                const pulse = Math.sin(tick * 0.1) * 0.2 + 0.8;
                ctx.fillStyle = color;

                // Glow hack: Draw multiple semi-transparent circles instead of expensive shadowBlur
                if (heat > 0) {
                    ctx.globalAlpha = 0.3;
                    ctx.beginPath(); ctx.arc(cx, cy, radius * 1.2 * pulse, 0, Math.PI * 2); ctx.fill();
                    ctx.globalAlpha = 1.0;
                }

                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.save();
                ctx.translate(cx, cy);
                if (spinning) ctx.rotate(tick * 0.1);
                ctx.beginPath();
                ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 1.5);
                ctx.stroke();
                ctx.restore();
            };
            drawCore();

            // COCKPIT / LOGIC
            const drawCockpit = () => {
                const cpY = -140;
                const cpW = 80;
                const cpH = 40;
                const color = getRarityColor(drill.logic.rarity);

                ctx.fillStyle = '#0f172a';
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;

                ctx.beginPath();
                ctx.moveTo(-cpW / 2 + 10, cpY);
                ctx.lineTo(cpW / 2 - 10, cpY);
                ctx.lineTo(cpW / 2, cpY + cpH);
                ctx.lineTo(-cpW / 2, cpY + cpH);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Windows
                ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
                ctx.fillRect(-cpW / 2 + 15, cpY + 5, 20, 15);
                ctx.fillRect(cpW / 2 - 35, cpY + 5, 20, 15);
                ctx.fillRect(-5, cpY + 5, 10, 15);

                // Dish (Logic Scanner)
                const drawDish = (x: number, scale: number) => {
                    ctx.save();
                    ctx.translate(x, cpY);
                    if (spinning) ctx.rotate(Math.sin(tick * 0.05) * 0.2);

                    ctx.strokeStyle = '#888';
                    ctx.beginPath();
                    ctx.moveTo(0, 0); ctx.lineTo(0, -10 * scale);
                    ctx.stroke();

                    ctx.fillStyle = '#222';
                    ctx.beginPath();
                    ctx.arc(0, -10 * scale, 8 * scale, 0, Math.PI, true);
                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();
                };

                drawDish(-30, 1);
                if (drill.logic.tier > 5) drawDish(30, 0.8);
            };
            drawCockpit();

            // DRILL BIT
            const drawDrillBit = () => {
                const gearY = 60;
                const bitY = 100;
                const bitLen = 120 + (drill.bit.tier * 5);
                const bitW = 70 + (drill.bit.tier * 2);
                const color = getRarityColor(drill.bit.rarity);

                // Gearbox housing с 3D-эффектом
                const gearGrad = ctx.createLinearGradient(-25, gearY, 25, gearY);
                gearGrad.addColorStop(0, '#1a1a1a');
                gearGrad.addColorStop(0.3, '#333');
                gearGrad.addColorStop(0.5, '#444');
                gearGrad.addColorStop(0.7, '#333');
                gearGrad.addColorStop(1, '#1a1a1a');
                ctx.fillStyle = gearGrad;
                ctx.fillRect(-25, gearY, 50, 40);
                // Блик на редукторе
                ctx.fillStyle = 'rgba(255,255,255,0.08)';
                ctx.fillRect(-22, gearY + 3, 44, 3);

                ctx.save();
                ctx.translate(0, bitY);

                if (spinning) ctx.translate((Math.random() - 0.5) * 2, 0);

                const isSharpened = activeBuffIds.includes('sharp');

                // Bit Gradient с улучшенным 3D-эффектом
                const grad = ctx.createLinearGradient(-bitW / 2, 0, bitW / 2, 0);
                if (isSharpened) {
                    grad.addColorStop(0, '#e0f2fe');
                    grad.addColorStop(0.3, '#67e8f9');
                    grad.addColorStop(0.5, '#0ea5e9');
                    grad.addColorStop(0.7, '#67e8f9');
                    grad.addColorStop(1, '#e0f2fe');
                } else {
                    grad.addColorStop(0, '#0a0a0a');
                    grad.addColorStop(0.2, '#222');
                    grad.addColorStop(0.4, '#444');
                    grad.addColorStop(0.5, '#555');
                    grad.addColorStop(0.6, '#444');
                    grad.addColorStop(0.8, '#222');
                    grad.addColorStop(1, '#0a0a0a');
                }
                ctx.fillStyle = grad;

                ctx.beginPath();
                ctx.moveTo(-bitW / 2, 0);

                // Draw jagged edges
                const steps = 6;
                for (let i = 0; i < steps; i++) {
                    const y = (bitLen / steps) * (i + 1);
                    const x = (bitW / 2) * (1 - (i + 1) / steps);
                    ctx.lineTo(-x - 5, y - 10);
                    ctx.lineTo(-x, y);
                }
                ctx.lineTo(0, bitLen);

                for (let i = steps - 1; i >= 0; i--) {
                    const y = (bitLen / steps) * (i + 1);
                    const x = (bitW / 2) * (1 - (i + 1) / steps);
                    ctx.lineTo(x, y);
                    ctx.lineTo(x + 5, y - 10);
                }
                ctx.lineTo(bitW / 2, 0);
                ctx.closePath();
                ctx.fill();

                // Спиральные канавки с затенением
                ctx.save();
                ctx.globalAlpha = 0.4;
                for (let i = 0; i < 5; i++) {
                    const startY = 15 + (i * 20);
                    const curveX = bitW / 2 * (1 - startY / bitLen) * 0.7;
                    // Тень
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(-curveX, startY + 2);
                    ctx.quadraticCurveTo(0, startY + 12, curveX, startY + 2);
                    ctx.stroke();
                    // Канавка
                    ctx.strokeStyle = '#666';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(-curveX, startY);
                    ctx.quadraticCurveTo(0, startY + 10, curveX, startY);
                    ctx.stroke();
                }
                ctx.restore();

                // [DEV_CONTEXT: THERMAL GRADIENT - DYNAMIC HEAT VISUALIZATION]
                // Градиент нагрева: кончик (красный → жёлтый → белый) → юбка
                // Работает при бурении И при остывании (heat > 5)
                if (heat > 5) {
                    ctx.save();
                    ctx.globalCompositeOperation = 'lighter';

                    // Нормализованный процент нагрева (0-1) с плавным переходом
                    const rawHeatPct = Math.min(1, heat / 100);
                    // Применяем easing для более плавного перехода (ease-in-out)
                    const heatPct = rawHeatPct < 0.5
                        ? 2 * rawHeatPct * rawHeatPct
                        : 1 - Math.pow(-2 * rawHeatPct + 2, 2) / 2;

                    // Высота прогрева от кончика вверх (от 5% до 100% длины бура)
                    const heatHeight = bitLen * (0.05 + heatPct * 0.95);

                    // Создаём вертикальный градиент от кончика вверх
                    const heatGrad = ctx.createLinearGradient(0, bitLen, 0, bitLen - heatHeight);

                    // Уменьшаем интенсивность при остывании (когда не spinning)
                    const intensityMult = spinning ? 1 : 0.7;

                    // Более плавные цветовые переходы
                    if (heatPct < 0.25) {
                        // Очень низкий нагрев: тусклый красный
                        const alpha = heatPct * 3 * intensityMult;
                        heatGrad.addColorStop(0, `rgba(255, 60, 0, ${alpha})`);
                        heatGrad.addColorStop(0.6, `rgba(255, 80, 0, ${alpha * 0.5})`);
                        heatGrad.addColorStop(1, 'rgba(255, 80, 0, 0)');
                    } else if (heatPct < 0.5) {
                        // Низкий-средний нагрев: красный → оранжевый
                        const t = (heatPct - 0.25) / 0.25;
                        heatGrad.addColorStop(0, `rgba(255, ${60 + t * 80}, 0, ${(0.5 + t * 0.3) * intensityMult})`);
                        heatGrad.addColorStop(0.4, `rgba(255, ${50 + t * 60}, 0, ${(0.35 + t * 0.2) * intensityMult})`);
                        heatGrad.addColorStop(0.75, `rgba(255, 50, 0, ${0.15 * intensityMult})`);
                        heatGrad.addColorStop(1, 'rgba(255, 50, 0, 0)');
                    } else if (heatPct < 0.75) {
                        // Средний-высокий нагрев: оранжевый → жёлтый
                        const t = (heatPct - 0.5) / 0.25;
                        heatGrad.addColorStop(0, `rgba(255, ${140 + t * 80}, ${t * 50}, ${(0.75 + t * 0.15) * intensityMult})`);
                        heatGrad.addColorStop(0.25, `rgba(255, ${110 + t * 60}, 0, ${(0.6 + t * 0.1) * intensityMult})`);
                        heatGrad.addColorStop(0.55, `rgba(255, ${70 + t * 30}, 0, ${(0.4 + t * 0.05) * intensityMult})`);
                        heatGrad.addColorStop(0.8, `rgba(255, 50, 0, ${0.2 * intensityMult})`);
                        heatGrad.addColorStop(1, 'rgba(255, 50, 0, 0)');
                    } else if (heatPct < 0.9) {
                        // Высокий нагрев: жёлтый → почти белый
                        const t = (heatPct - 0.75) / 0.15;
                        heatGrad.addColorStop(0, `rgba(255, ${220 + t * 35}, ${50 + t * 120}, ${(0.85 + t * 0.1) * intensityMult})`);
                        heatGrad.addColorStop(0.2, `rgba(255, ${180 + t * 40}, ${t * 80}, ${(0.7 + t * 0.1) * intensityMult})`);
                        heatGrad.addColorStop(0.45, `rgba(255, ${120 + t * 40}, 0, ${(0.5 + t * 0.1) * intensityMult})`);
                        heatGrad.addColorStop(0.7, `rgba(255, ${60 + t * 20}, 0, ${(0.3 + t * 0.05) * intensityMult})`);
                        heatGrad.addColorStop(0.9, `rgba(255, 50, 0, ${0.15 * intensityMult})`);
                        heatGrad.addColorStop(1, 'rgba(255, 40, 0, 0)');
                    } else {
                        // Критический нагрев (90-100%): белый кончик → жёлтый → красная юбка
                        const t = (heatPct - 0.9) / 0.1;
                        heatGrad.addColorStop(0, `rgba(255, 255, ${200 + t * 55}, ${(0.95 + t * 0.05) * intensityMult})`);
                        heatGrad.addColorStop(0.12, `rgba(255, 255, ${150 + t * 50}, ${0.9 * intensityMult})`);
                        heatGrad.addColorStop(0.28, `rgba(255, ${240 - t * 20}, ${80 + t * 40}, ${0.8 * intensityMult})`);
                        heatGrad.addColorStop(0.45, `rgba(255, ${180 - t * 30}, ${20 + t * 20}, ${0.65 * intensityMult})`);
                        heatGrad.addColorStop(0.65, `rgba(255, ${100 - t * 30}, 0, ${0.5 * intensityMult})`);
                        heatGrad.addColorStop(0.82, `rgba(255, 50, 0, ${0.35 * intensityMult})`);
                        heatGrad.addColorStop(1, `rgba(200, 30, 0, ${(0.15 + t * 0.1) * intensityMult})`);
                    }

                    ctx.fillStyle = heatGrad;

                    // Рисуем форму бура для эффекта нагрева (внутри границ)
                    ctx.beginPath();
                    ctx.moveTo(-bitW / 2, 0);
                    for (let i = 0; i < steps; i++) {
                        const y = (bitLen / steps) * (i + 1);
                        const x = (bitW / 2) * (1 - (i + 1) / steps);
                        ctx.lineTo(-x - 5, y - 10);
                        ctx.lineTo(-x, y);
                    }
                    ctx.lineTo(0, bitLen);
                    for (let i = steps - 1; i >= 0; i--) {
                        const y = (bitLen / steps) * (i + 1);
                        const x = (bitW / 2) * (1 - (i + 1) / steps);
                        ctx.lineTo(x, y);
                        ctx.lineTo(x + 5, y - 10);
                    }
                    ctx.lineTo(bitW / 2, 0);
                    ctx.closePath();
                    ctx.fill();

                    ctx.restore();
                }



                ctx.strokeStyle = isSharpened ? '#fff' : color;
                ctx.lineWidth = 2;
                ctx.stroke();

                // Блик на буре (левая грань)
                ctx.save();
                ctx.globalAlpha = 0.15;
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-bitW / 2 + 5, 5);
                ctx.lineTo(-bitW / 4, bitLen * 0.4);
                ctx.stroke();
                ctx.restore();

                // Spiral Animation
                const spinOffset = spinning ? (tick * 5) % 60 : 0;
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                for (let i = 0; i < 3; i++) {
                    const startX = -bitW / 3 + (i * bitW / 3);
                    ctx.moveTo(startX, 0);
                    ctx.quadraticCurveTo(startX + spinOffset - 30, bitLen / 2, 0, bitLen);
                }
                ctx.stroke();

                ctx.restore();
            };
            drawDrillBit();

            ctx.restore();
        };

        // Initial render call
        render();

        const handleResize = () => {
            if (canvas.parentElement) {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight;
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameId);
        };
    }, []); // Dependencies empty: updates happen via store subscription inside RAF

    return <canvas ref={canvasRef} className="w-full h-full block" />;
});

export default DrillRenderer;
