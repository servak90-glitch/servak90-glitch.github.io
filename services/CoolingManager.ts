
import { CoolingState } from '../types';

export class CoolingManager {
    private state: CoolingState = {
        isActive: false,
        pulseSize: 1.0,
        targetSize: 1.0,
        perfectWindow: 0.15, // Expanded slightly for mobile
        goodWindow: 0.4,
        combo: 0,
        cooldownTimer: 0
    };

    private time: number = 0;
    private readonly PULSE_SPEED = 3.0; // Speed of the sine wave
    private readonly COOLDOWN_DURATION = 0.8; // From Simulation

    // --- GAME LOOP ---
    public update(dt: number, heat: number): CoolingState {
        this.time += dt;

        // Cooldown
        if (this.state.cooldownTimer > 0) {
            this.state.cooldownTimer -= dt;
        }

        // Pulse Logic (Always active if heat > 0 to show readiness?)
        // Or only active when "Vent Mode" is on?
        // Let's make it always pulsing if system is hot enough to need attention.
        // Pulse Logic (Always active for rhythm feedback, but visual intensity varies)
        this.state.isActive = true;

        // Sine wave oscillating between 0.5 and 1.5
        this.state.pulseSize = 1.0 + Math.sin(this.time * this.PULSE_SPEED) * 0.5;

        return { ...this.state };
    }

    // --- INTERACTION ---
    public attemptVent(): { success: boolean, heatReduction: number, result: 'PERFECT' | 'GOOD' | 'MISS' | 'COOLDOWN' } {
        if (this.state.cooldownTimer > 0) {
            return { success: false, heatReduction: 0, result: 'COOLDOWN' };
        }

        const diff = Math.abs(this.state.pulseSize - this.state.targetSize);
        let heatReduction = 0;
        let result: 'PERFECT' | 'GOOD' | 'MISS' = 'MISS';

        if (diff <= this.state.perfectWindow) {
            result = 'PERFECT';
            heatReduction = 20; // Rebalanced Value
            this.state.combo++;
        } else if (diff <= this.state.goodWindow) {
            result = 'GOOD';
            heatReduction = 12;
            this.state.combo = 0; // Combo breaks on non-perfect? Or keeps? Let's break on non-perfect for "Hardcore".
        } else {
            result = 'MISS';
            heatReduction = -5; // Penalty
            this.state.combo = 0;
        }

        // Apply Cooldown
        this.state.cooldownTimer = this.COOLDOWN_DURATION;
        this.state.lastVentResult = result;

        return { success: true, heatReduction, result };
    }

    public getState(): CoolingState {
        return { ...this.state };
    }
}

export const coolingManager = new CoolingManager();
