/**
 * Optimized Store Selectors
 * 
 * Эти хуки обеспечивают атомарный доступ к состоянию, что предотвращает лишние ререндеры.
 * Вместо того чтобы возвращать один большой объект, который меняется при каждом тике,
 * мы используем точечные подписки.
 */

import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from './gameStore';
import { GameState, DrillState, Stats } from '../types';

// === ATOMIC SELECTORS  ===

/**
 * Универсальный селектор для любого поля из стора
 */
export const useGameSelector = <T>(selector: (state: GameState) => T): T => useGameStore(selector);

/**
 * Селектор для конкретного стата
 */
export const useStatsProperty = <K extends keyof Stats>(key: K): Stats[K] =>
    useGameStore(s => s.stats[key]);

/**
 * Селектор для конкретного поля бура
 */
export const useDrillProperty = <K extends keyof DrillState>(key: K): DrillState[K] =>
    useGameStore(s => s.drill[key]);


// === COMPOSITE SELECTORS (OPTIMIZED) ===

/**
 * Core game state: game lifecycle and view
 */
export const useGameCore = () => useGameStore(
    useShallow(s => ({
        isGameActive: s.isGameActive,
        activeView: s.activeView,
        settings: s.settings,
        enterGame: s.enterGame,
        manualLoad: s.manualLoad,
        tick: s.tick,
    }))
);

/**
 * Drill state (slow changing: stats, drill parts)
 * Рефакторинг: stats теперь вынесен за пределы shallow-объекта, если нужно
 */
export const useDrillStats = () => useGameStore(
    useShallow(s => ({
        drill: s.drill,
        resources: s.resources,
        xp: s.xp,
        integrity: s.integrity,
        currentCargoWeight: s.currentCargoWeight,
        sideTunnel: s.sideTunnel,
        stats: s.stats,
        activeEffects: s.activeEffects,
        equipmentInventory: s.equipmentInventory,
        inventory: s.inventory
    }))
);

/**
 * Drill movement (fast changing: depth, heat, shield)
 */
export const useDrillDynamic = () => useGameStore(
    useShallow(s => ({
        depth: s.depth,
        heat: s.heat,
        shieldCharge: s.shieldCharge,
    }))
);

/**
 * Drill interaction actions
 */
export const useDrillActions = () => useGameStore(
    useShallow(s => ({
        isDrilling: s.isDrilling,
        isOverheated: s.isOverheated,
        setDrilling: s.setDrilling,
        manualClick: s.manualClick,
        manualRechargeShield: s.manualRechargeShield,
    }))
);

/**
 * Combat and events state
 */
export const useCombatState = () => useGameStore(
    useShallow(s => ({
        currentBoss: s.currentBoss,
        combatMinigame: s.combatMinigame,
        eventQueue: s.eventQueue,
        isCoolingGameActive: s.isCoolingGameActive,
        clickFlyingObject: s.clickFlyingObject,
    }))
);

/**
 * Combat actions
 */
export const useCombatActions = () => useGameStore(
    useShallow(s => ({
        handleEventOption: s.handleEventOption,
        completeCombatMinigame: s.completeCombatMinigame,
        setCoolingGame: s.setCoolingGame,
        forceVentHeat: s.forceVentHeat,
        triggerOverheat: s.triggerOverheat,
        damageWeakPoint: s.damageWeakPoint, // Перенесено в боевые действия
    }))
);

/**
 * Abilities state and actions
 */
export const useAbilities = () => useGameStore(
    useShallow(s => ({
        activeAbilities: s.activeAbilities || [],
        activateAbility: s.activateAbility,
    }))
);

/**
 * City-related state for CityView
 */
export const useCityState = () => useGameStore(
    useShallow(s => ({
        skillLevels: s.skillLevels,
        equippedArtifacts: s.equippedArtifacts,
        inventory: s.inventory,
        activeQuests: s.activeQuests,
        discoveredArtifacts: s.discoveredArtifacts,
    }))
);

/**
 * City actions
 */
export const useCityActions = () => useGameStore(
    useShallow(s => ({
        tradeCity: s.tradeCity,
        healCity: s.healCity,
        repairHull: s.repairHull,
        completeQuest: s.completeQuest,
        refreshQuests: s.refreshQuests,
    }))
);

/**
 * Settings and configuration
 */
export const useSettingsActions = () => useGameStore(
    useShallow(s => ({
        setLanguage: s.setLanguage,
        updateSettings: s.updateSettings,
        resetProgress: s.resetProgress,
        selectBiome: s.selectBiome,
        selectedBiome: s.selectedBiome,
    }))
);

/**
 * AI companion state
 */
export const useAIState = () => useGameStore(
    useShallow(s => ({
        aiState: s.aiState,
    }))
);

/**
 * View navigation actions
 */
export const useViewActions = () => useGameStore(
    useShallow(s => ({
        setView: s.setView,
    }))
);

/**
 * Forge and Crafting state/actions
 */
export const useForgeState = () => useGameStore(
    useShallow(s => ({
        droneLevels: s.droneLevels,
        depth: s.depth,
        heatStabilityTimer: s.heatStabilityTimer,
        integrity: s.integrity,
        craftingQueue: s.craftingQueue,
    }))
);

export const useCraftActions = () => useGameStore(
    useShallow(s => ({
        startCraft: s.startCraft,
        collectCraftedItem: s.collectCraftedItem,
        cancelCraft: s.cancelCraft,
    }))
);

/**
 * Global Map and Travel state/actions
 */
export const useMapState = () => useGameStore(
    useShallow(s => ({
        level: s.level,
        unlockedLicenses: s.unlockedLicenses,
        travel: s.travel,
        currentRegion: s.currentRegion,
        playerBases: s.playerBases,
        caravans: s.caravans,
        currentCargoWeight: s.currentCargoWeight,
    }))
);

export const useMapActions = () => useGameStore(
    useShallow(s => ({
        travelToRegion: s.travelToRegion,
        buildBase: s.buildBase,
    }))
);
