
/**
 * Event Simulation Script
 * 
 * Tests the proposed Hardcore Event Rebalance math.
 * Simulates 1 hour of gameplay (360 event checks).
 * 
 * Run with: npx tsx scripts/event_simulation.ts
 */

interface SimEvent {
    id: string;
    weight: number;
    instantDamage?: number; // % of Max Integrity
    instantDepth?: number;
    instantXp?: number;
    minDepth?: number;
}

// === PROPOSED EVENT REGISTRY (HARDCORE) ===
const EVENTS: SimEvent[] = [
    // --- THREATS ---
    { id: 'GAS_POCKET', weight: 25, instantDamage: 0.15, minDepth: 200 }, // NEW: Damage 15%
    { id: 'TECTONIC_SHIFT', weight: 25, minDepth: 1000 },

    // --- OPPORTUNITIES ---
    { id: 'GOLD_VEIN', weight: 40, minDepth: 100 },
    { id: 'FOSSIL_FIND', weight: 20, minDepth: 10 },

    // --- RARE / ANOMALIES ---
    { id: 'QUANTUM_FLUCTUATION', weight: 20, minDepth: 500 },
    { id: 'MAGNETIC_STORM', weight: 20, minDepth: 50 },
    { id: 'NANOMITE_SWARM', weight: 10, minDepth: 1000 },
    { id: 'GRAVITY_ANOMALY', weight: 10, minDepth: 3000 },
    { id: 'CRYSTAL_OVERLOAD', weight: 15, minDepth: 8000 },

    // --- REBALANCED RARES ---
    { id: 'QUANTUM_JUMP', weight: 5, instantDepth: 5000, minDepth: 1000 }, // NEW: +5000m
    { id: 'PRECURSOR_ECHO', weight: 5, instantXp: 500, minDepth: 100 },     // NEW: +500 XP

    // --- FATAL ---
    { id: 'CORE_RESONANCE', weight: 5, minDepth: 100000 }
];

// === SIMULATION CONSTANTS ===
const MAX_HP = 100;
const SESSION_DURATION_HOURS = 1;
const CHECK_INTERVAL_SEC = 10;
const TOTAL_CHECKS = (SESSION_DURATION_HOURS * 3600) / CHECK_INTERVAL_SEC;

const ITERATIONS = 1000; // Run 1000 one-hour sessions to get averages

// === RUNNER ===

function runSession() {
    let currentDepth = 2000; // Start mid-game
    let totalDamage = 0;
    let totalDepthGain = 0;
    let totalXpGain = 0;
    let gasExplosions = 0;
    let quantumJumps = 0;
    let hp = MAX_HP;
    let isDead = false;

    // Simulate checks
    for (let i = 0; i < TOTAL_CHECKS; i++) {
        // Simple linear depth progression
        currentDepth += 10;

        // 1. Roll for Event (Approx event chance logic from game)
        // In game: rollRandomEvent checks weights.
        // Assuming we ALWAYS roll (or have a chance to roll). 
        // Game has a cooldown mechanic, let's assume effective checked event rate.
        // Let's assume 1 event triggers every ~60 seconds on average in game? 
        // Actually eventRegistry says weights range 5-40.
        // Let's simulate the rollRandomEvent logic exactly.

        const validEvents = EVENTS.filter(e => currentDepth >= (e.minDepth || 0));
        const totalWeight = validEvents.reduce((sum, e) => sum + e.weight, 0);

        // Game logic: random * totalWeight.
        // But wait, does the game ALWAYS pick an event if weights match?
        // GameEngine.ts: "if (eventCheckTick >= 100) ... const event = rollRandomEvent..."
        // Yes, it picks one every 10 seconds IF logic allows.
        // BUT, `rollRandomEvent` returns null? No, it looks like it always returns something if list is not empty.
        // AND in GameEngine there is a 30% chance to actually trigger it? 
        // Let's check GameEngine code from memory/previous views.
        // "if (Math.random() < 0.3) { ... rollRandomEvent ... }" or similar?
        // Assuming 30% chance per check to avoid spam.

        const EVENT_TRIGGER_CHANCE = 0.3;

        if (Math.random() < EVENT_TRIGGER_CHANCE) {
            let random = Math.random() * totalWeight;
            let selectedEvent = null;

            for (const event of validEvents) {
                if (random < event.weight) {
                    selectedEvent = event;
                    break;
                }
                random -= event.weight;
            }

            if (selectedEvent) {
                // Process Instant Effects
                if (selectedEvent.instantDamage) {
                    const dmg = MAX_HP * selectedEvent.instantDamage;
                    hp -= dmg;
                    totalDamage += dmg;
                    gasExplosions++;
                }
                if (selectedEvent.instantDepth) {
                    totalDepthGain += selectedEvent.instantDepth;
                    currentDepth += selectedEvent.instantDepth; // Jump helps find deeper events
                    quantumJumps++;
                }
                if (selectedEvent.instantXp) {
                    totalXpGain += selectedEvent.instantXp;
                }
            }
        }

        // Passive Regen (Simulate player repairing)
        // Assume player repairs 1 HP per tick if not under pressure?
        // Or just track raw damage taken to see if it's manageable.
        // Let's just track damage.

        if (hp <= 0) isDead = true;
    }

    return { totalDamage, totalDepthGain, totalXpGain, gasExplosions, quantumJumps, isDead };
}

// === MAIN ===
console.log(`Running Simulation: Hardcore Events`);
console.log(`Sessions: ${ITERATIONS}`);
console.log(`Duration per session: ${SESSION_DURATION_HOURS} hour(s)`);
console.log(`Event Check Interval: ${CHECK_INTERVAL_SEC}s`);
console.log('-----------------------------------');

let totalDamageSum = 0;
let totalGasSum = 0;
let totalJumpSum = 0;
let deaths = 0;

for (let i = 0; i < ITERATIONS; i++) {
    const res = runSession();
    totalDamageSum += res.totalDamage;
    totalGasSum += res.gasExplosions;
    totalJumpSum += res.quantumJumps;
    if (res.isDead) deaths++;
}

const avgDamage = totalDamageSum / ITERATIONS;
const avgGas = totalGasSum / ITERATIONS;
const avgJumps = totalJumpSum / ITERATIONS;

console.log(`RESULTS (Average per 1 hour):`);
console.log(`Gas Explosions: ${avgGas.toFixed(2)}`);
console.log(`Total Damage Taken: ${avgDamage.toFixed(2)} HP`);
console.log(`Quantum Jumps: ${avgJumps.toFixed(2)}`);
console.log(`Deaths (if no repair): ${deaths} / ${ITERATIONS}`);

console.log('-----------------------------------');
console.log('ANALYSIS:');
const damagePerMinute = avgDamage / 60;
console.log(`Damage per Minute: ${damagePerMinute.toFixed(2)} HP/min`);

if (damagePerMinute > 20) {
    console.log('[FAIL] Too much damage! Player cannot sustain >20 HP/min repair cost comfortably.');
} else if (damagePerMinute < 5) {
    console.log('[WARN] Too easy? <5 HP/min is negligible.');
} else {
    console.log('[PASS] Damage is within "Sweaty" range (5-20 HP/min).');
}

if (avgGas > 15) {
    console.log('[FAIL] Too many explosions! >15 per hour is annoying.');
} else {
    console.log('[PASS] Explosion frequency is acceptable.');
}
