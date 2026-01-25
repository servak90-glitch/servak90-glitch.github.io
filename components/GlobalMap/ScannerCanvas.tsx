import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { motion, AnimatePresence } from 'framer-motion';
import { RegionId, PlayerBase, Caravan, ResourceType } from '../../types';
import { REGIONS, REGION_IDS } from '../../constants/regions';
import { t } from '../../services/localization';
import { useGameStore } from '../../store/gameStore';
import { ObjectPool } from '../../services/ObjectPool';

interface ScannerCanvasProps {
    regions: RegionId[];
    activeRegion: RegionId;
    bases: PlayerBase[];
    caravans: Caravan[];
    onRegionSelect: (id: RegionId) => void;
}

export const ScannerCanvas: React.FC<ScannerCanvasProps> = ({
    activeRegion,
    bases,
    caravans,
    onRegionSelect
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const indicatorPoolRef = useRef<ObjectPool<PIXI.Graphics> | null>(null);
    const indicatorRef = useRef<PIXI.Graphics | null>(null);
    const lang = useGameStore(s => s.settings.language);

    const dataRef = useRef({ bases, caravans, activeRegion });
    useEffect(() => { dataRef.current = { bases, caravans, activeRegion }; }, [bases, caravans, activeRegion]);

    useEffect(() => {
        let isMounted = true;

        const initApp = async () => {
            const app = new PIXI.Application();
            try {
                await app.init({
                    resizeTo: containerRef.current!,
                    backgroundAlpha: 0,
                    antialias: true,
                    resolution: window.devicePixelRatio || 1,
                    autoDensity: true
                });
            } catch (e) {
                console.error("Scanner Pixi Init Error:", e);
                return;
            }

            if (!isMounted || !containerRef.current) {
                app.destroy(true);
                return;
            }

            containerRef.current.appendChild(app.canvas);
            appRef.current = app;

            // Pools
            indicatorPoolRef.current = new ObjectPool(() => {
                const g = new PIXI.Graphics();
                g.setStrokeStyle({ width: 2, color: 0xFFFFFF });
                g.beginFill(0x38BDF8, 0.5);
                g.drawCircle(0, 0, 10);
                g.endFill();
                g.stroke();
                return g;
            }, 1);

            // Layers
            const mainScrollContainer = new PIXI.Container();
            const backgroundLayer = new PIXI.Container();
            const regionsLayer = new PIXI.Container();
            const interactiveLayer = new PIXI.Container();
            const overlayLayer = new PIXI.Container();

            mainScrollContainer.addChild(backgroundLayer);
            mainScrollContainer.addChild(regionsLayer);
            mainScrollContainer.addChild(interactiveLayer);
            mainScrollContainer.addChild(overlayLayer);
            app.stage.addChild(mainScrollContainer);

            const REGION_HEIGHT = 400;
            const sortedRegionIds = [...REGION_IDS].sort((a, b) => REGIONS[a].tierLimit - REGIONS[b].tierLimit);

            const redrawAll = () => {
                const width = app.screen.width;
                backgroundLayer.removeChildren();

                const grid = new PIXI.Graphics();
                grid.setStrokeStyle({ width: 0.5, color: 0x38BDF8, alpha: 0.1 });
                const totalHeight = REGION_IDS.length * REGION_HEIGHT + 1000;
                for (let i = 0; i < totalHeight; i += 50) {
                    grid.moveTo(0, i).lineTo(width, i);
                }
                for (let i = 0; i < width; i += 50) {
                    grid.moveTo(i, 0).lineTo(i, totalHeight);
                }
                grid.stroke();
                backgroundLayer.addChild(grid);

                const drawRegionContent = (g: PIXI.Graphics, id: RegionId, x: number, y: number, w: number, h: number, color: number) => {
                    const cx = x + w / 2;
                    const cy = y + h / 2;
                    const now = Date.now();

                    // --- 1. Background Grid / Decorative elements ---
                    g.setStrokeStyle({ width: 1, color: color, alpha: 0.05 });
                    for (let i = 0; i < h; i += 40) g.moveTo(x + 50, y + i).lineTo(x + w - 50, y + i);
                    for (let i = 0; i < w; i += 40) g.moveTo(x + i, y + 20).lineTo(x + i, y + h - 20);
                    g.stroke();

                    // --- 2. Central Tactical Icon ---
                    g.setStrokeStyle({ width: 1.5, color: color, alpha: 0.6 });

                    switch (id) {
                        case RegionId.RUST_VALLEY:
                            // Blueprint of a massive drill
                            const dW = 60, dH = 100;
                            // Main body
                            g.rect(cx - dW / 2, cy - dH / 2, dW, dH * 0.6).stroke();
                            // Drill bit
                            g.moveTo(cx - dW / 2, cy + dH * 0.1).lineTo(cx, cy + dH / 2).lineTo(cx + dW / 2, cy + dH * 0.1).stroke();
                            // Interior screw lines
                            for (let i = 0; i < 4; i++) {
                                g.moveTo(cx - dW / 2 + (i * 5), cy + dH * 0.1 + (i * 5)).lineTo(cx + dW / 2 - (i * 5), cy + dH * 0.1 + (i * 10)).stroke();
                            }
                            break;
                        case RegionId.CRYSTAL_WASTES:
                            // Ornate crystal lattice
                            const cS = 50;
                            for (let i = 0; i < 3; i++) {
                                const offset = i * 20 - 20;
                                g.moveTo(cx + offset, cy - cS).lineTo(cx + offset + 20, cy).lineTo(cx + offset, cy + cS).lineTo(cx + offset - 20, cy).closePath().stroke();
                                g.moveTo(cx + offset, cy - cS).lineTo(cx + offset, cy + cS).stroke();
                            }
                            break;
                        case RegionId.IRON_GATES:
                            // Fortified Gate / Industrial HUD
                            const gW = 120, gH = 80;
                            g.rect(cx - gW / 2, cy - gH / 2, gW, gH).stroke();
                            g.moveTo(cx, cy - gH / 2).lineTo(cx, cy + gH / 2).stroke();
                            // Cross-braces
                            g.moveTo(cx - gW / 2, cy - gH / 2).lineTo(cx + gW / 2, cy + gH / 2).stroke();
                            g.moveTo(cx + gW / 2, cy - gH / 2).lineTo(cx - gW / 2, cy + gH / 2).stroke();
                            // Circular radar nodes
                            g.circle(cx - gW / 2, cy - gH / 2, 10).stroke();
                            g.circle(cx + gW / 2, cy + gH / 2, 10).stroke();
                            break;
                        case RegionId.MAGMA_CORE:
                            // Heat waves / Thermal map (Adaptive Radii)
                            const maxR = Math.min(w / 2 - 20, 120);
                            for (let i = 0; i < 5; i++) {
                                const r = 30 + i * (maxR / 5);
                                g.setStrokeStyle({ width: 1, color: color, alpha: 0.6 - i * 0.1 });
                                g.arc(cx, cy + 20, r, Math.PI, 0).stroke();
                                // Little sparks
                                g.rect(cx + Math.sin(now / 500 + i) * r, cy - Math.cos(now / 500 + i) * 20, 2, 2).stroke();
                            }
                            break;
                        case RegionId.VOID_CHASM:
                            // Singularity / Spatial Anomaly
                            const vR = 60;
                            g.circle(cx, cy, vR).stroke();
                            g.setStrokeStyle({ width: 1, color: color, alpha: 0.3 });
                            for (let i = 0; i < 8; i++) {
                                const angle = (now / 1000) + (i * Math.PI / 4);
                                g.moveTo(cx, cy).lineTo(cx + Math.cos(angle) * vR, cy + Math.sin(angle) * vR).stroke();
                            }
                            // Digital orbits
                            g.ellipse(cx, cy, vR * 1.5, vR * 0.5).stroke();
                            break;
                    }

                    // --- 3. Scanning Beam Animation ---
                    const beamY = y + 20 + ((now / 20) % (h - 40));
                    g.setStrokeStyle({ width: 2, color: 0xFFFFFF, alpha: 0.15 });
                    g.moveTo(x + 50, beamY).lineTo(x + w - 50, beamY).stroke();
                    // Glow under beam
                    g.setStrokeStyle({ width: 8, color: color, alpha: 0.05 });
                    g.moveTo(x + 60, beamY).lineTo(x + w - 60, beamY).stroke();

                    // --- 4. Technical Labels ---
                    const tierText = new PIXI.Text({
                        text: `SYST_LVL::00${REGIONS[id].tierLimit}`,
                        style: { fontFamily: 'Share Tech Mono, monospace', fontSize: 10, fill: color }
                    });
                    tierText.alpha = 0.4;
                    tierText.x = x + 15;
                    tierText.y = y + h - 25;
                    regionsLayer.addChild(tierText);

                    const coordText = new PIXI.Text({
                        text: `COORD::${REGIONS[id].coordinates.x}.${REGIONS[id].coordinates.y}`,
                        style: { fontFamily: 'Share Tech Mono, monospace', fontSize: 10, fill: color }
                    });
                    coordText.alpha = 0.4;
                    coordText.x = x + w - 120;
                    coordText.y = y + h - 25;
                    regionsLayer.addChild(coordText);
                };

                regionsLayer.removeChildren();
                sortedRegionIds.forEach((id, index) => {
                    const region = REGIONS[id];
                    const y = index * REGION_HEIGHT + 100;
                    const color = id === RegionId.RUST_VALLEY ? 0x38BDF8 :
                        id === RegionId.CRYSTAL_WASTES ? 0xA855F7 :
                            id === RegionId.IRON_GATES ? 0xEAB308 :
                                id === RegionId.MAGMA_CORE ? 0xEF4444 : 0x8B5CF6;

                    // Primary Frame
                    const area = new PIXI.Graphics();
                    area.setStrokeStyle({ width: 2, color: color, alpha: 0.3 });
                    area.rect(50, y, width - 100, REGION_HEIGHT - 20);
                    area.fill({ color: 0x000000, alpha: 0.01 });
                    area.stroke();

                    // Clip Mask to prevent overflow (v8 syntax)
                    const mask = new PIXI.Graphics();
                    mask.rect(50, y, width - 100, REGION_HEIGHT - 20);
                    mask.fill(0xFFFFFF);
                    area.mask = mask;
                    regionsLayer.addChild(mask);

                    // Technical Corners
                    area.setStrokeStyle({ width: 3, color: color, alpha: 0.8 });
                    const gap = 20;
                    // Top-left
                    area.moveTo(50, y + gap).lineTo(50, y).lineTo(50 + gap, y).stroke();
                    // Top-right
                    area.moveTo(width - 50 - gap, y).lineTo(width - 50, y).lineTo(width - 50, y + gap).stroke();
                    // Bottom-left
                    area.moveTo(50, y + REGION_HEIGHT - 20 - gap).lineTo(50, y + REGION_HEIGHT - 20).lineTo(50 + gap, y + REGION_HEIGHT - 20).stroke();
                    // Bottom-right
                    area.moveTo(width - 50 - gap, y + REGION_HEIGHT - 20).lineTo(width - 50, y + REGION_HEIGHT - 20).lineTo(width - 50, y + REGION_HEIGHT - 20 - gap).stroke();

                    // Render Dynamic Content
                    drawRegionContent(area, id, 50, y, width - 100, REGION_HEIGHT - 20, color);

                    area.interactive = true;
                    area.cursor = 'pointer';
                    area.on('pointerup', () => onRegionSelect(id));

                    const labelText = new PIXI.Text({
                        text: `${t(region.name, lang).toUpperCase()}`,
                        style: {
                            fontFamily: 'Share Tech Mono, monospace',
                            fontSize: 18,
                            fill: color,
                            fontWeight: '900',
                            letterSpacing: 4,
                            dropShadow: { color: 0x000000, alpha: 0.8, distance: 2, blur: 4 }
                        }
                    });
                    labelText.x = 80;
                    labelText.y = y + 30;

                    regionsLayer.addChild(area);
                    regionsLayer.addChild(labelText);
                });
            };

            redrawAll();
            app.renderer.on('resize', redrawAll);

            // Interaction
            let isDragging = false;
            let lastY = 0;
            let scrollY = 0;

            app.stage.eventMode = 'static';
            app.stage.hitArea = app.screen;

            app.stage.on('pointerdown', (e) => {
                isDragging = true;
                lastY = e.global.y;
            });

            app.stage.on('pointermove', (e) => {
                if (isDragging) {
                    const dy = e.global.y - lastY;
                    scrollY += dy;
                    const maxScroll = -(sortedRegionIds.length * REGION_HEIGHT - app.screen.height + 200);
                    scrollY = Math.min(0, Math.max(maxScroll, scrollY));
                    mainScrollContainer.y = scrollY;
                    lastY = e.global.y;
                }
            });

            app.stage.on('pointerup', () => isDragging = false);
            app.stage.on('pointerupoutside', () => isDragging = false);

            const wheelHandler = (e: WheelEvent) => {
                e.preventDefault();
                scrollY -= e.deltaY;
                const maxScroll = -(sortedRegionIds.length * REGION_HEIGHT - app.screen.height + 200);
                scrollY = Math.min(0, Math.max(maxScroll, scrollY));
                mainScrollContainer.y = scrollY;
            };
            app.canvas.addEventListener('wheel', wheelHandler, { passive: false });

            // Ticker: Sync Indicator
            app.ticker.add(() => {
                if (!isMounted || !app.renderer) return;
                const { activeRegion } = dataRef.current;
                const activeIdx = sortedRegionIds.indexOf(activeRegion);

                if (activeIdx !== -1) {
                    if (!indicatorRef.current) {
                        indicatorRef.current = indicatorPoolRef.current!.get();
                        interactiveLayer.addChild(indicatorRef.current);
                    }
                    const y = activeIdx * REGION_HEIGHT + 100 + (REGION_HEIGHT / 2);
                    indicatorRef.current.x = app.screen.width / 2;
                    indicatorRef.current.y = y;
                    indicatorRef.current.scale.set(1 + Math.sin(Date.now() / 200) * 0.1);
                } else if (indicatorRef.current) {
                    interactiveLayer.removeChild(indicatorRef.current);
                    indicatorPoolRef.current!.release(indicatorRef.current);
                    indicatorRef.current = null;
                }
            });
        };

        initApp();

        return () => {
            isMounted = false;
            if (appRef.current) {
                appRef.current.destroy(true, { children: true });
                appRef.current = null;
                indicatorPoolRef.current?.destroy();
            }
        };
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-slate-900/40">
            <div className="absolute inset-0 pointer-events-none border border-cyan-500/10" />
            <div className="absolute bottom-4 right-4 text-[10px] font-mono text-cyan-400/50 uppercase tracking-widest">
                System_Link_Active // Lithosphere_Ver_5.1
            </div>
        </div>
    );
};
