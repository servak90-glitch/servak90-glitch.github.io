/**
 * Shared types for Forge tab components
 */

import { Resources, DrillPart, DrillSlot, InventoryItem } from '../../types';

export interface UpgradeCardProps {
    title: string;
    current: DrillPart;
    next?: DrillPart;
    type: DrillSlot;
    resources: Resources;
    onBuy: (type: DrillSlot) => void;
}

export interface DrillTabProps {
    drill: {
        bit: DrillPart;
        engine: DrillPart;
        cooling: DrillPart;
    };
    resources: Resources;
    onBuy: (type: DrillSlot) => void;
}

export interface SystemsTabProps {
    drill: {
        logic: DrillPart;
        control: DrillPart;
        gearbox: DrillPart;
    };
    resources: Resources;
    onBuy: (type: DrillSlot) => void;
}

export interface HullTabProps {
    drill: {
        hull: DrillPart;
        power: DrillPart;
        armor: DrillPart;
    };
    resources: Resources;
    onBuy: (type: DrillSlot) => void;
}

export interface FusionTabProps {
    resources: Resources;
    inventory: Record<string, InventoryItem>;
    depth: number;
    heatStabilityTimer: number;
    integrity: number;
    drill: Record<string, DrillPart>; // Добавлено для проверки макс. тира
}

export interface DronesTabProps {
    resources: Resources;
    droneLevels: Record<string, number>;
}
