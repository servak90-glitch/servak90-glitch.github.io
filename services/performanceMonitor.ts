/**
 * Performance Monitor — сервис мониторинга FPS и адаптивного качества
 * 
 * [DEV_CONTEXT: OPTIMIZATION] v5.2
 * Отслеживает FPS в реальном времени и предоставляет рекомендации
 * по уровню качества для других компонентов рендеринга.
 */

class PerformanceMonitor {
    private frameCount = 0;
    private lastTime = performance.now();
    private fps = 60;
    private fpsHistory: number[] = [];
    private readonly historySize = 30; // Скользящее среднее за 30 измерений

    // Адаптивное качество
    private qualityLevel: 'low' | 'medium' | 'high' = 'high';
    private lastQualityChange = 0;
    private readonly qualityChangeCooldown = 2000; // 2 секунды между изменениями

    // Throttle для пропуска кадров
    private skipFrameCounter = 0;

    constructor() {
        // Запускаем измерение FPS
        this.startMeasuring();
    }

    private startMeasuring() {
        const measure = () => {
            this.frameCount++;
            const now = performance.now();
            const delta = now - this.lastTime;

            // Обновляем FPS каждую секунду
            if (delta >= 1000) {
                this.fps = Math.round((this.frameCount * 1000) / delta);
                this.fpsHistory.push(this.fps);

                if (this.fpsHistory.length > this.historySize) {
                    this.fpsHistory.shift();
                }

                this.frameCount = 0;
                this.lastTime = now;

                // Обновляем уровень качества на основе последних измерений
                this.updateQualityLevel(now);
            }

            requestAnimationFrame(measure);
        };

        requestAnimationFrame(measure);
    }

    private updateQualityLevel(now: number) {
        // Ждём cooldown перед изменением качества
        if (now - this.lastQualityChange < this.qualityChangeCooldown) return;

        const avgFps = this.getAverageFPS();
        let newQuality = this.qualityLevel;

        // Логика понижения качества
        if (avgFps < 25) {
            newQuality = 'low';
        } else if (avgFps < 40) {
            newQuality = 'medium';
        } else if (avgFps >= 55) {
            // Повышаем качество только если FPS стабильно высокий
            newQuality = 'high';
        }

        if (newQuality !== this.qualityLevel) {
            console.log(`[PerformanceMonitor] Quality changed: ${this.qualityLevel} -> ${newQuality} (avg FPS: ${avgFps})`);
            this.qualityLevel = newQuality;
            this.lastQualityChange = now;
        }
    }

    /**
     * Получить текущий FPS
     */
    getFPS(): number {
        return this.fps;
    }

    /**
     * Получить средний FPS за последние измерения
     */
    getAverageFPS(): number {
        if (this.fpsHistory.length === 0) return 60;
        const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.fpsHistory.length);
    }

    /**
     * Получить адаптивный уровень качества
     */
    getQualityLevel(): 'low' | 'medium' | 'high' {
        return this.qualityLevel;
    }

    /**
     * Проверить, нужно ли пропустить текущий кадр для тяжёлых операций
     * Возвращает true если FPS низкий и можно пропустить
     */
    shouldSkipHeavyOperation(): boolean {
        if (this.fps >= 50) return false;

        this.skipFrameCounter++;

        // При низком FPS пропускаем каждый 2-й тяжёлый кадр
        if (this.fps < 30) {
            return this.skipFrameCounter % 2 === 0;
        }

        // При среднем FPS пропускаем каждый 3-й
        return this.skipFrameCounter % 3 === 0;
    }

    /**
     * Получить множитель для количества частиц
     * Возвращает 0.2-1.0 в зависимости от FPS
     */
    getParticleMultiplier(): number {
        if (this.fps >= 55) return 1.0;
        if (this.fps >= 45) return 0.8;
        if (this.fps >= 35) return 0.5;
        if (this.fps >= 25) return 0.3;
        return 0.2;
    }

    /**
     * Получить интервал обновления статов в тиках RAF
     * Чем ниже FPS, тем реже обновляем статы
     */
    getStatsUpdateInterval(): number {
        if (this.fps >= 55) return 6;  // ~10 раз/сек при 60 FPS
        if (this.fps >= 40) return 10; // ~6 раз/сек
        if (this.fps >= 25) return 15; // ~4 раз/сек
        return 20; // ~3 раза/сек
    }

    /**
     * Проверить, нужно ли отключить фильтры
     */
    shouldDisableFilters(): boolean {
        return this.fps < 25 || this.qualityLevel === 'low';
    }
}

// Singleton экспорт
export const performanceMonitor = new PerformanceMonitor();
