/**
 * Shared types for Forge tab components
 */

import {
    Resources, DrillPart, EnginePart, CoolerPart, HullPart,
    LogicPart, ControlPart, GearboxPart, PowerCorePart, ArmorPart, CargoBayPart,
    DrillSlot, InventoryItem, DrillState
} from '../../types';

// Объединение всех типов частей бура
export type AnyDrillPart = DrillPart | EnginePart | CoolerPart | HullPart |
    LogicPart | ControlPart | GearboxPart | PowerCorePart | ArmorPart | CargoBayPart;

export type ForgeTab = 'DRILL' | 'SYSTEMS' | 'HULL' | 'FUSION' | 'DRONES' | 'SUPPLY';

export interface UpgradeCardProps {
    title: string;
    current: AnyDrillPart;
    next?: AnyDrillPart;
    type: DrillSlot;
    resources: Resources;
    onStartCraft: (partId: string, type: DrillSlot | 'CONSUMABLE') => void;
    craftingQueue: Array<{ id: string; partId: string; slotType: string; startTime: number; completionTime: number; status: string }>;
}

export interface DrillTabProps {
    drill: {
        bit: DrillPart;
        engine: EnginePart;
        cooling: CoolerPart;
    };
    resources: Resources;
    onStartCraft: (partId: string, type: DrillSlot | 'CONSUMABLE') => void;
}

export interface SystemsTabProps {
    drill: {
        logic: LogicPart;
        control: ControlPart;
        gearbox: GearboxPart;
    };
    resources: Resources;
    onStartCraft: (partId: string, type: DrillSlot | 'CONSUMABLE') => void;
}

export interface HullTabProps {
    drill: {
        hull: HullPart;
        power: PowerCorePart;
        armor: ArmorPart;
    };
    resources: Resources;
    onStartCraft: (partId: string, type: DrillSlot | 'CONSUMABLE') => void;
}

export interface FusionTabProps {
    resources: Resources;
    inventory: Record<string, InventoryItem>;
    depth: number;
    heatStabilityTimer: number;
    integrity: number;
    drill: DrillState;
}

export interface DronesTabProps {
    resources: Resources;
    droneLevels: Record<string, number>;
}
