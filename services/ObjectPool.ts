import * as PIXI from 'pixi.js';

/**
 * Universal Object Pool for PixiJS elements.
 * Helps prevent GC pressure by reusing Containers (Sprites, Graphics, etc).
 */
export class ObjectPool<T extends PIXI.Container> {
    private pool: T[] = [];
    private factory: () => T;

    constructor(factory: () => T, initialSize: number = 0) {
        this.factory = factory;
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.factory());
        }
    }

    /**
     * Get an object from the pool or create a new one if empty.
     */
    public get(): T {
        const obj = this.pool.pop() || this.factory();
        obj.visible = true;
        return obj;
    }

    /**
     * Return an object to the pool.
     */
    public release(obj: T) {
        obj.visible = false;
        this.pool.push(obj);
    }

    /**
     * Clear the pool and destroy objects.
     */
    public destroy() {
        this.pool.forEach(obj => {
            if (!(obj as any).destroyed) {
                obj.destroy({ children: true });
            }
        });
        this.pool = [];
    }
}
