import { PlayerBase, Resources, GameEvent, EventTrigger, VisualEvent } from '../../types';
import { RESOURCE_WEIGHTS } from '../gameMath'; // Assumed exist, or we approximate

/**
 * RAID SYSTEM
 * Handles logic for base raids: probability, defense calculation, resolution.
 */

export class RaidSystem {

    /**
     * Calculates the raid threat level for a specific base based on its wealth and visibility
     */
    public calculateThreatLevel(base: PlayerBase, reputation: number): number {
        // 1. Resource Wealth Factor
        let wealthScore = 0;
        // Simple heuristic: amount of high-tier resources
        const highTierResources = ['gold', 'titanium', 'uranium', 'diamonds', 'ancientTech'];

        Object.entries(base.storedResources).forEach(([res, amount]) => {
            if (highTierResources.includes(res)) {
                wealthScore += (amount as number) * 2;
            } else {
                wealthScore += (amount as number) * 0.5;
            }
        });

        // Normalize wealth score (0-100 scale ideally, but can go higher)
        // Wealth factor: every 10,000 "value" adds 1 threat
        const wealthThreat = Math.min(50, Math.floor(wealthScore / 10000));

        // 2. Base Visibility/Activity
        const activityThreat = base.status === 'active' ? 10 : 0;

        // 3. Reputation Mitigation (Rebels protect implies less Pirate/Corporate raids?)
        // If High Corporate rep -> Corporate raids unlikely? 
        // Let's assume Threat is generic "Pirates/Xenomorphs"
        // High Rebels rep (Liberation hero) reduces threat
        const repFactor = reputation > 2000 ? -20 : 0;

        return Math.max(5, wealthThreat + activityThreat + repFactor);
    }

    /**
     * Determines if a raid should occur
     */
    public checkRaidInfo(base: PlayerBase, threatLevel: number): boolean {
        // Base chance per check (e.g. daily or per travel)
        const baseChance = 0.05; // 5%

        // Threat multiplier: Threat 50 -> 2.5x chance -> 12.5%
        const finalChance = baseChance * (1 + threatLevel / 20);

        return Math.random() < finalChance;
    }

    /**
     * Resolves a raid
     * @returns Result object describing outcome
     */
    public resolveRaid(base: PlayerBase, defenseBonus: number = 0): {
        success: boolean;
        damage: number;
        stolenResources: Partial<Resources>;
        logMessage: string;
    } {
        // Defense Calculation
        // Base has defenses? (Station has guards, Outpost might not)
        let baseDefense = base.hasGuards ? 50 : 10;
        if (base.hasFortification) baseDefense += 30;
        if (base.type === 'station') baseDefense += 20;

        // Add external bonuses (Perks, temporary buffs)
        baseDefense += defenseBonus;

        // Attack Roll (50-150 strength usually)
        const attackStrength = 50 + Math.random() * 100;

        const success = baseDefense >= attackStrength;
        const stolenResources: Partial<Resources> = {};
        let damage = 0;

        let logMessage = '';

        if (success) {
            logMessage = `RAID REPELLED! Base [${base.id}] defense (${baseDefense}) held against attacker (${Math.floor(attackStrength)}).`;
        } else {
            // RAID FAILED
            damage = Math.floor(Math.random() * 20) + 10; // 10-30% damage to integrity/storage? Or just HP reduction if Bases had HP.
            // For now, let's say "Damage" is % efficiency loss or repair cost.

            // Steal Resources
            const stealPercentage = 0.1 + Math.random() * 0.2; // 10-30%

            Object.keys(base.storedResources).forEach((key) => {
                const resKey = key as keyof Resources;
                const current = base.storedResources[resKey] || 0;
                if (current > 0) {
                    const stolen = Math.floor(current * stealPercentage);
                    if (stolen > 0) {
                        stolenResources[resKey] = stolen;
                        // Determine loss logic in GameEngine (actually applying the reduction)
                    }
                }
            });

            logMessage = `BASE RAIDED! Defenses failed (${baseDefense} vs ${Math.floor(attackStrength)}). Resources lost.`;
        }


        return {
            success,
            damage,
            stolenResources,
            logMessage
        };
    }

    /**
     * Process potential raids for all bases (Tick logic)
     * ИЗМЕНЕНО v4.1.3: Теперь происходит ОДИН рейд на случайную базу,
     * а не проверка каждой базы независимо (что создавало слишком много рейдов)
     */
    public processBaseRaids(
        bases: PlayerBase[],
        reputation: number,
        currentTrigger: EventTrigger
    ): { updatedBases: PlayerBase[], events: VisualEvent[] } {
        const events: VisualEvent[] = [];

        // Фильтруем только активные базы
        const activeBases = bases.filter(b => b.status === 'active' || b.status === 'building');

        if (activeBases.length === 0) {
            return { updatedBases: bases, events: [] };
        }

        // Выбираем ОДНУ случайную базу для потенциального рейда
        const targetBase = activeBases[Math.floor(Math.random() * activeBases.length)];
        const targetIndex = bases.findIndex(b => b.id === targetBase.id);

        if (targetIndex === -1) {
            return { updatedBases: bases, events: [] };
        }

        // Рассчитываем угрозу для этой базы
        const threat = this.calculateThreatLevel(targetBase, reputation);

        // Проверяем, произойдёт ли рейд (ОДИН шанс вместо N проверок)
        if (!this.checkRaidInfo(targetBase, threat)) {
            return { updatedBases: bases, events: [] };
        }

        // РЕЙД ПРОИЗОШЁЛ!
        const result = this.resolveRaid(targetBase);
        const updatedBases = [...bases];
        updatedBases[targetIndex] = { ...updatedBases[targetIndex] };

        // Создаём визуальное уведомление
        if (result.success) {
            events.push({
                type: 'LOG',
                msg: `🛡️ [${targetBase.regionId}] ${result.logMessage}`,
                color: 'text-green-400'
            });
            events.push({ type: 'SOUND', sfx: 'RAID_SUCCESS' as any });
        } else {
            events.push({
                type: 'LOG',
                msg: `⚠️ [${targetBase.regionId}] ${result.logMessage}`,
                color: 'text-red-500 font-bold'
            });
            events.push({ type: 'SCREEN_SHAKE', intensity: 10, duration: 500 });
            events.push({ type: 'SOUND', sfx: 'RAID_ALARM' as any });
            events.push({ type: 'SOUND', sfx: 'RAID_FAILURE' as any });
        }

        // Применяем потерю ресурсов
        if (!result.success && Object.keys(result.stolenResources).length > 0) {
            const newStored = { ...updatedBases[targetIndex].storedResources };
            Object.entries(result.stolenResources).forEach(([res, amount]) => {
                const r = res as keyof Resources;
                if (newStored[r]) {
                    newStored[r] = Math.max(0, (newStored[r] as number) - (amount as number));
                }
            });
            updatedBases[targetIndex].storedResources = newStored;
            updatedBases[targetIndex].lastVisitedAt = Date.now();
        }

        return {
            updatedBases,
            events
        };
    }
}

export const raidSystem = new RaidSystem();
