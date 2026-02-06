
import { LocalizedString } from './core';
import { Resources, ArtifactRarity } from './resources';

export enum BossType {
    WORM = 'WORM',
    CORE = 'CORE',
    CONSTRUCT = 'CONSTRUCT',
    SWARM = 'SWARM',
    VOID_SENTINEL = 'VOID_SENTINEL'
}

export type AbilityType = 'EMP_BURST' | 'THERMAL_STRIKE' | 'BARRIER' | 'OVERLOAD';

export interface AbilityDef {
    id: AbilityType;
    name: LocalizedString;
    description: LocalizedString;
    cooldownMs: number;
    energyCost: number;
    heatCost: number;
    icon: string;
    unlockLevel: number;
}

export interface ActiveAbilityState {
    id: AbilityType;
    cooldownRemaining: number;
    isActive: boolean;
    durationRemaining: number;
}

export type CombatMinigameType = 'TIMING' | 'MEMORY' | 'MASH' | 'ALIGN' | 'GLYPH' | 'WIRES';

export interface WeakPoint {
    id: string;
    x: number;
    y: number;
    radius: number;
    currentHp: number;
    maxHp: number;
    isActive: boolean;
    phaseRequired?: number;
}

export interface Boss {
    id: string;
    name: LocalizedString;
    type: BossType;
    color: string;
    maxHp: number;
    currentHp: number;
    damage: number;
    attackSpeed: number;
    description: LocalizedString;
    isMob?: boolean;

    reward: {
        xp: number;
        resources: Partial<Resources>;
        guaranteedArtifactRarity?: ArtifactRarity;
    };
    phases: number[];
    isInvulnerable?: boolean;
    minigameWeakness: CombatMinigameType;
    weakPoints: WeakPoint[];
}

export interface CombatMinigame {
    active: boolean;
    type: CombatMinigameType;
    difficulty: number;
}
