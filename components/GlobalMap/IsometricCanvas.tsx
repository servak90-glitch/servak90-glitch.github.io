import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { gridToIso, TILE_WIDTH, TILE_HEIGHT } from '../../services/isometricMath';
import { RegionId, PlayerBase, Caravan } from '../../types';
import { TextureGenerator } from '../../services/TextureGenerator';
import { ObjectPool } from '../../services/ObjectPool';

interface IsometricCanvasProps {
    regions: RegionId[];
    activeRegion: RegionId;
    bases: PlayerBase[];
    caravans: Caravan[];
    onRegionSelect: (id: RegionId) => void;
}

const REGION_POSITIONS: Record<RegionId, { x: number, y: number }> = {
    [RegionId.RUST_VALLEY]: { x: 0, y: 0 },
    [RegionId.CRYSTAL_WASTES]: { x: -2, y: -2 },
    [RegionId.IRON_GATES]: { x: 2, y: -2 },
    [RegionId.MAGMA_CORE]: { x: -2, y: 2 },
    [RegionId.VOID_CHASM]: { x: 2, y: 2 }
};

export const IsometricCanvas: React.FC<IsometricCanvasProps> = ({ regions, activeRegion, bases, caravans, onRegionSelect }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);

    // Pools and Active Objects
    const basePoolRef = useRef<ObjectPool<PIXI.Sprite> | null>(null);
    const caravanPoolRef = useRef<ObjectPool<PIXI.Graphics> | null>(null);
    const activeBasesRef = useRef<Map<string, PIXI.Sprite>>(new Map());
    const activeCaravansRef = useRef<Map<string, PIXI.Graphics>>(new Map());

    // Data Ref for ticker access
    const dataRef = useRef({ bases, caravans });
    useEffect(() => { dataRef.current = { bases, caravans }; }, [bases, caravans]);

    useEffect(() => {
        let isMounted = true;

        const initApp = async () => {
            const app = new PIXI.Application();
            try {
                await app.init({
                    resizeTo: containerRef.current!,
                    backgroundAlpha: 0,
                    antialias: true
                });
            } catch (e) {
                console.error("Isometric Pixi Init Error:", e);
                return;
            }

            if (!isMounted || !containerRef.current) {
                app.destroy(true);
                return;
            }

            containerRef.current.appendChild(app.canvas);
            appRef.current = app;

            // Generate Textures
            const generator = new TextureGenerator(app);
            const tileTextures: Record<string, PIXI.Texture> = {};
            const baseTextures: Record<string, PIXI.Texture> = {
                outpost: generator.generateBaseTexture('outpost'),
                camp: generator.generateBaseTexture('camp'),
                station: generator.generateBaseTexture('station'),
            };

            Object.keys(REGION_POSITIONS).forEach((id) => {
                tileTextures[id] = generator.generateRegionTexture(id as RegionId);
            });

            // Pools Initialization
            basePoolRef.current = new ObjectPool(() => {
                const sprite = new PIXI.Sprite();
                sprite.anchor.set(0.5, 1.0);
                const label = new PIXI.Text({
                    text: '',
                    style: {
                        fontSize: 10,
                        fill: 0xFFFF00,
                        dropShadow: { color: 0x000000, distance: 1, alpha: 0.8 }
                    }
                });
                label.anchor.set(0.5, 1);
                label.y = -40;
                sprite.addChild(label);
                return sprite;
            }, 5);

            caravanPoolRef.current = new ObjectPool(() => {
                const g = new PIXI.Graphics();
                g.rect(-12, -8, 24, 12);
                g.fill(0x00FF00);
                g.stroke({ width: 1, color: 0xFFFFFF });
                g.circle(-8, 4, 3);
                g.circle(8, 4, 3);
                g.fill(0x000000);
                return g;
            }, 5);

            // Containers
            const mapContainer = new PIXI.Container();
            const terrainLayer = new PIXI.Container();
            const objLayer = new PIXI.Container();
            const unitLayer = new PIXI.Container();

            mapContainer.addChild(terrainLayer);
            mapContainer.addChild(objLayer);
            mapContainer.addChild(unitLayer);

            objLayer.sortableChildren = true;
            unitLayer.sortableChildren = true;

            mapContainer.x = app.screen.width / 2 - TILE_WIDTH / 2;
            mapContainer.y = app.screen.height / 2;
            app.stage.addChild(mapContainer);

            // Interaction state
            let isDragging = false;
            let lastPos = { x: 0, y: 0 };
            let dragDistance = 0;
            const activePointers = new Map<number, { x: number, y: number }>();
            let lastPinchDist = 0;

            app.stage.eventMode = 'static';
            app.stage.hitArea = app.screen;

            app.stage.on('pointerdown', (e) => {
                activePointers.set(e.pointerId, { x: e.global.x, y: e.global.y });
                if (activePointers.size === 1) {
                    isDragging = true;
                    lastPos = { x: e.global.x, y: e.global.y };
                    dragDistance = 0;
                } else if (activePointers.size === 2) {
                    isDragging = false;
                    const points = Array.from(activePointers.values());
                    lastPinchDist = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
                }
            });

            app.stage.on('pointermove', (e) => {
                activePointers.set(e.pointerId, { x: e.global.x, y: e.global.y });
                if (activePointers.size === 1 && isDragging) {
                    const dx = e.global.x - lastPos.x;
                    const dy = e.global.y - lastPos.y;
                    mapContainer.x += dx;
                    mapContainer.y += dy;
                    dragDistance += Math.sqrt(dx * dx + dy * dy);
                    lastPos = { x: e.global.x, y: e.global.y };
                } else if (activePointers.size === 2) {
                    const points = Array.from(activePointers.values());
                    const dist = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
                    if (lastPinchDist > 0) {
                        const zoomFactor = dist / lastPinchDist;
                        const newScale = mapContainer.scale.x * zoomFactor;
                        if (newScale > 0.5 && newScale < 3.0) mapContainer.scale.set(newScale);
                    }
                    lastPinchDist = dist;
                }
            });

            const onPointerUp = (e: PIXI.FederatedPointerEvent) => {
                activePointers.delete(e.pointerId);
                if (activePointers.size < 2) lastPinchDist = 0;
                if (activePointers.size === 0) isDragging = false;
                else if (activePointers.size === 1) {
                    const remaining = activePointers.values().next().value;
                    if (remaining) {
                        lastPos = { x: remaining.x, y: remaining.y };
                        isDragging = true;
                    }
                }
            };
            app.stage.on('pointerup', onPointerUp);
            app.stage.on('pointerupoutside', onPointerUp);

            const wheelHandler = (e: WheelEvent) => {
                e.preventDefault();
                const scaleFactor = 1.1;
                const newScale = e.deltaY < 0 ? mapContainer.scale.x * scaleFactor : mapContainer.scale.x / scaleFactor;
                if (newScale > 0.5 && newScale < 3.0) mapContainer.scale.set(newScale);
            };
            app.canvas.addEventListener('wheel', wheelHandler, { passive: false });

            // Render Static Terrain
            Object.entries(REGION_POSITIONS).forEach(([id, pos]) => {
                const regionId = id as RegionId;
                const iso = gridToIso(pos.x, pos.y);
                const sprite = new PIXI.Sprite(tileTextures[regionId]);
                sprite.x = iso.x;
                sprite.y = iso.y;
                sprite.interactive = true;
                sprite.cursor = 'pointer';
                sprite.on('pointerup', () => { if (dragDistance < 10) onRegionSelect(regionId); });
                sprite.on('pointerover', () => { sprite.scale.set(1.05); });
                sprite.on('pointerout', () => { sprite.scale.set(1.0); });

                terrainLayer.addChild(sprite);

                const label = new PIXI.Text({
                    text: regionId.replace('_', ' '),
                    style: { fontFamily: 'monospace', fontSize: 12, fill: 0x00FFFF }
                });
                label.anchor.set(0.5);
                label.x = iso.x + TILE_WIDTH / 2;
                label.y = iso.y - 10;
                terrainLayer.addChild(label);
            });

            // Ticker: Sync Bases and Caravans
            app.ticker.add(() => {
                if (!isMounted || !app.renderer || (app.renderer as any).destroyed) return;

                const { bases, caravans } = dataRef.current;
                const now = Date.now();

                // 1. Sync Bases
                const baseIds = new Set(bases.map(b => b.id));
                // Remove deleted
                activeBasesRef.current.forEach((sprite, id) => {
                    if (!baseIds.has(id)) {
                        objLayer.removeChild(sprite);
                        basePoolRef.current?.release(sprite);
                        activeBasesRef.current.delete(id);
                    }
                });
                // Add or update
                bases.forEach(base => {
                    let sprite = activeBasesRef.current.get(base.id);
                    if (!sprite) {
                        sprite = basePoolRef.current!.get();
                        objLayer.addChild(sprite);
                        activeBasesRef.current.set(base.id, sprite);
                    }
                    const regPos = REGION_POSITIONS[base.regionId];
                    if (regPos) {
                        const iso = gridToIso(regPos.x, regPos.y);
                        sprite.x = iso.x + TILE_WIDTH / 2;
                        sprite.y = iso.y + TILE_HEIGHT / 2 + 10;
                        sprite.texture = baseTextures[base.type] || baseTextures['outpost'];
                        sprite.zIndex = sprite.y;

                        const labelText = sprite.getChildAt(0) as PIXI.Text;
                        const newText = `BASE (${base.type})`;
                        if (labelText.text !== newText) labelText.text = newText;
                    }
                });

                // 2. Sync Caravans
                const activeCaravanList = caravans.filter(c => c.status === 'in_transit');
                const caravanIds = new Set(activeCaravanList.map(c => c.id));
                // Remove deleted
                activeCaravansRef.current.forEach((gfx, id) => {
                    if (!caravanIds.has(id)) {
                        unitLayer.removeChild(gfx);
                        caravanPoolRef.current?.release(gfx);
                        activeCaravansRef.current.delete(id);
                    }
                });
                // Add or update
                activeCaravanList.forEach(caravan => {
                    const fromBase = bases.find(b => b.id === caravan.fromBaseId);
                    const toBase = bases.find(b => b.id === caravan.toBaseId);
                    if (fromBase && toBase) {
                        const fromPos = REGION_POSITIONS[fromBase.regionId];
                        const toPos = REGION_POSITIONS[toBase.regionId];
                        if (fromPos && toPos) {
                            let gfx = activeCaravansRef.current.get(caravan.id);
                            if (!gfx) {
                                gfx = caravanPoolRef.current!.get();
                                unitLayer.addChild(gfx);
                                activeCaravansRef.current.set(caravan.id, gfx);
                            }
                            const progress = Math.min(1, Math.max(0, (now - caravan.departureTime) / (caravan.arrivalTime - caravan.departureTime)));
                            const curX = fromPos.x + (toPos.x - fromPos.x) * progress;
                            const curY = fromPos.y + (toPos.y - fromPos.y) * progress;
                            const iso = gridToIso(curX, curY);
                            const bounce = Math.sin(now / 100 * Math.PI) * 2;

                            gfx.x = iso.x + TILE_WIDTH / 2;
                            gfx.y = iso.y + TILE_HEIGHT / 2 + bounce - 5;
                            gfx.zIndex = gfx.y;
                        }
                    }
                });

                objLayer.sortChildren();
                unitLayer.sortChildren();
                mapContainer.y = app.screen.height / 2 + Math.sin(now / 2000) * 5;
            });
        };

        if (!appRef.current) initApp();

        return () => {
            isMounted = false;
            if (appRef.current) {
                appRef.current.destroy(true, { children: true });
                appRef.current = null;
                basePoolRef.current?.destroy();
                caravanPoolRef.current?.destroy();
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative"
            style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
        />
    );
};
