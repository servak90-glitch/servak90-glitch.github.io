
/**
 * Cooling Simulation Script (Active Rhythm)
 * 
 * Tests if the Active Rhythm Cooling mechanic is viable at high depths.
 * Simulates:
 * - Constant Heat Generation (based on depth)
 * - Driller Heat (while active)
 * - Active Cooling attempts (Player Rhythm)
 * 
 * Goal: Prove that a Skilled Player (80% accuracy) can keep heat < 100 at 10,000m depth.
 * 
 * Run with: npx tsx scripts/cooling_simulation.ts
 */

// === CONSTANTS ===
const DEPTH = 10000; // Deep game
const MAX_HEAT = 100;
const HEAT_GEN_BASE = 5; // Base heat per second while drilling
const HEAT_GEN_DEPTH_FACTOR = DEPTH / 1000; // +10 heat/sec at 10km? That's insane. Let's start smaller.
// Checking gameMath logic... 
// Actual Game Logic (approx): ambientTemp max 50. 
// Heat Gen Multiplier usually 1.0.
// Let's model:
const PASSIVE_HEAT_GAIN = 2; // Heat creeping up
const DRILLING_HEAT_GAIN = 10; // Heat per second while holding drill

const COOLING_COOLDOWN = 0.8; // Faster rhythm (was 1.0)
const COOLING_PERFECT_AMT = 20; // Improved reward (was 15)
const COOLING_GOOD_AMT = 12;    // (was 10)
const COOLING_MISS_PENALTY = 5;

// Player Skill
const PLAYER_ACCURACY_PERFECT = 0.4; // 40% Perfect
const PLAYER_ACCURACY_GOOD = 0.4;    // 40% Good
const PLAYER_ACCURACY_MISS = 0.2;    // 20% Miss

const SIM_DURATION_SEC = 60;
const FPS = 10; // Simulation tick rate

function runCoolingSim(depth: number) {
    let heat = 50; // Start warm
    let time = 0;
    let totalCooled = 0;
    let overheatedTime = 0;
    let ventAttempts = 0;
    let nextVentTime = 0;

    // Simulate 60 seconds of "Sweaty" gameplay: Drilling non-stop + Venting
    while (time < SIM_DURATION_SEC) {
        const dt = 1 / FPS;
        time += dt;

        // 1. Heat Generation
        // Drilling adds heat
        heat += DRILLING_HEAT_GAIN * dt;
        // Depth ambient heat pressure? (Maybe slows cooling, here adds load)
        heat += (depth / 5000) * dt;

        // 2. Active Cooling (Rhythm)
        // Player tries to vent every time cooldown is ready
        if (time >= nextVentTime) {
            ventAttempts++;
            nextVentTime = time + COOLING_COOLDOWN;

            const roll = Math.random();
            if (roll < PLAYER_ACCURACY_PERFECT) {
                heat -= COOLING_PERFECT_AMT;
                totalCooled += COOLING_PERFECT_AMT;
                // console.log(`[${time.toFixed(1)}] PERFECT VENT! Heat: ${heat.toFixed(1)}`);
            } else if (roll < PLAYER_ACCURACY_PERFECT + PLAYER_ACCURACY_GOOD) {
                heat -= COOLING_GOOD_AMT;
                totalCooled += COOLING_GOOD_AMT;
                // console.log(`[${time.toFixed(1)}] Good Vent. Heat: ${heat.toFixed(1)}`);
            } else {
                heat += COOLING_MISS_PENALTY;
                // console.log(`[${time.toFixed(1)}] MISS! Backfire! Heat: ${heat.toFixed(1)}`);
            }
        }

        // Clamp
        heat = Math.max(0, heat);

        if (heat >= MAX_HEAT) {
            overheatedTime += dt;
            // In game, usually forces stop. Here we assume player KEEPS TRYING (stress test).
        }
    }

    return { heat, overheatedTime, totalCooled, ventAttempts };
}

// === MAIN ===
console.log('Running Active Cooling Simulation...');
console.log(`Depth: ${DEPTH}m`);
console.log(`Drilling Heat: +${DRILLING_HEAT_GAIN}/sec`);
console.log(`Cooling Rhythm: Every ${COOLING_COOLDOWN}s`);
console.log('--------------------------------');

const result = runCoolingSim(DEPTH);

console.log(`Final Heat: ${result.heat.toFixed(1)}`);
console.log(`Total Cooled: ${result.totalCooled} (Attempts: ${result.ventAttempts})`);
console.log(`Time Overheated: ${result.overheatedTime.toFixed(1)}s / ${SIM_DURATION_SEC}s`);

// Analysis
const heatGenerated = (DRILLING_HEAT_GAIN + (DEPTH / 5000)) * SIM_DURATION_SEC;
const coolingNeeded = heatGenerated;
const actualCoolingRate = result.totalCooled / SIM_DURATION_SEC;
const generationRate = heatGenerated / SIM_DURATION_SEC;

console.log(`\nHeat Gen Rate: ${generationRate.toFixed(1)}/sec`);
console.log(`Avg Cooling Rate: ${actualCoolingRate.toFixed(1)}/sec`);

if (actualCoolingRate > generationRate) {
    console.log('[PASS] Skilled player can sustain continuous drilling!');
} else {
    console.log('[FAIL] Overheat inevitable even with skill. Needs balance adjustment.');
    console.log(`Deficit: ${(generationRate - actualCoolingRate).toFixed(1)} heat/sec`);
}
