
import { LocalizedString } from './core';
import { ResourceType, Resources } from './resources';
import { RegionId } from './world';

export type BaseType = 'outpost' | 'camp' | 'station';
export type BaseStatus = 'building' | 'active' | 'abandoned' | 'damaged' | 'under_attack';

export enum BaseModuleType {
    SCIENCE = 'SCIENCE',
    LOGISTICS = 'LOGISTICS',
    INDUSTRIAL = 'INDUSTRIAL',
    DRONE_COMMAND = 'DRONE_COMMAND',
    COMMS = 'COMMS'
}

export interface BaseModule {
    type: BaseModuleType;
    level: number;
    unlocked: boolean;
    status: 'ACTIVE' | 'UPGRADING' | 'DISABLED';
    completionTime?: number;
}

export interface DroneStation {
    level: number;
    fuelStorage: {
        coal: number;
        oil: number;
        gas: number;
    };
    maxFuelStorage: number;
    activeDrones: number;
    maxDrones: number;
    maintenanceLevel: number;
}

export interface BaseDefense {
    infantry: number;
    drones: number;
    turrets: number;
    integrity: number;
    shields: number;
}

export type DefenseUnitType = 'infantry' | 'drone' | 'turret' | 'shield_gen';

export interface DefenseProductionJob {
    id: string;
    unitType: DefenseUnitType;
    startTime: number;
    completionTime: number;
}

export type FacilityId = 'basic_refinery' | 'advanced_refinery' | 'workshop_facility' | 'advanced_workshop' | 'research_lab';

export interface Facility {
    id: FacilityId;
    name: LocalizedString;
    cost: number;
    description: LocalizedString;
    unlocksRecipes: string[];
}

export interface PlayerBase {
    id: string;
    regionId: RegionId;
    type: BaseType;
    status: BaseStatus;
    defense: BaseDefense;
    storageCapacity: number;
    storedResources: Partial<Resources>;
    hasWorkshop: boolean;
    workshopTierRange: [number, number] | null;
    hasFuelFacilities: boolean;
    hasMarket: boolean;
    hasFortification: boolean;
    hasGuards: boolean;
    constructionStartTime: number;
    constructionCompletionTime: number;
    lastVisitedAt: number;
    upgradeLevel: number;
    facilities: FacilityId[];
    productionQueue: DefenseProductionJob[];
    droneStation?: DroneStation;
    modules: BaseModule[];
}

export interface CraftingRecipe {
    id: string;
    name: LocalizedString;
    description: LocalizedString;
    requiredFacility?: FacilityId;
    input: Array<{ resource: ResourceType; amount: number }>;
    output: { resource: ResourceType; amount: number };
    craftTime?: number;
}
