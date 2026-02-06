
import { LocalizedString } from './core';
import { ResourceType } from './resources';

export enum RegionId {
    RUST_VALLEY = 'rust_valley',
    CRYSTAL_WASTES = 'crystal_wastes',
    IRON_GATES = 'iron_gates',
    MAGMA_CORE = 'magma_core',
    VOID_CHASM = 'void_chasm'
}

export type ZoneColor = 'green' | 'yellow' | 'red';

export interface Region {
    id: RegionId;
    name: LocalizedString;
    coordinates: { x: number; y: number };
    recommendedLevel: number;
    baseZoneColor: ZoneColor;
    resourceBonuses?: Partial<Record<ResourceType, number>>;
    description?: LocalizedString;
    tierLimit: number;
}

export type HazardType = 'NONE' | 'CORROSION' | 'MAGNETIC' | 'HEAT_REFLECTION' | 'RADIATION' | 'VOID_PRESSURE';

export interface Biome {
    name: LocalizedString;
    depth: number;
    resource: ResourceType;
    color: string;
    description: LocalizedString;
    hub?: string;
    hazard: HazardType;
    hazardLevel: number;
    gemResource?: ResourceType;
}

export type SideTunnelType = 'SAFE' | 'RISKY' | 'CRYSTAL' | 'MINE' | 'NEST';

export interface SideTunnelState {
    type: SideTunnelType;
    progress: number;
    maxProgress: number;
    rewards: Record<string, number>;
    difficulty: number;
    name: LocalizedString;
}

export type PropType = 'FOSSIL' | 'PIPE' | 'CRYSTAL' | 'RUIN' | 'TECH_DEBRIS';

export interface TunnelPropDef {
    type: PropType;
    minDepth: number;
    maxDepth: number;
    chance: number;
    color: string;
}

export interface TravelState {
    targetRegion: RegionId;
    startTime: number;
    duration: number;
    fuelType: ResourceType;
    fuelCost: number;
    distance: number;
}

export interface FlyingObject {
    id: string;
    x: number;
    y: number;
    type: 'GEODE_SMALL' | 'GEODE_LARGE' | 'SATELLITE_DEBRIS';
    rarity: 'COMMON' | 'RARE' | 'EPIC';
    vx: number;
    vy: number;
    hp: number;
    maxHp: number;
}
