import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { audioEngine } from '../services/audioEngine';
import { DrillSlot } from '../types';
import { BITS, ENGINES, COOLERS, HULLS, LOGIC_CORES, CONTROL_UNITS, GEARBOXES, POWER_CORES, ARMORS, CARGO_BAYS } from '../constants';
import { calculateStats } from '../services/gameMath';
import { UpgradeCard, FusionTab, DronesTab } from './forge';
import { ConsumablesTab } from './forge/ConsumablesTab';
import { CraftingJobCard } from './forge/CraftingJobCard';  // NEW: Phase 2.1

type ForgeTab = 'DRILL' | 'SYSTEMS' | 'HULL' | 'FUSION' | 'DRONES' | 'SUPPLY';

const TABS: { id: ForgeTab; label: string }[] = [
    { id: 'DRILL', label: 'БУР' },
    { id: 'SYSTEMS', label: 'СИСТЕМЫ' },
    { id: 'HULL', label: 'КОРПУС' },
    { id: 'SUPPLY', label: 'СНАБЖЕНИЕ' },
    { id: 'FUSION', label: 'СИНТЕЗ' },
    { id: 'DRONES', label: 'ДРОНЫ' },
];

const ForgeView: React.FC = () => {
    const [forgeTab, setForgeTab] = useState<ForgeTab>('DRILL');

    useEffect(() => {
        audioEngine.playUIPanelOpen();
    }, []);

    const firstRender = useRef(true);
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        audioEngine.playUITabSwitch();
    }, [forgeTab]);

    // Connect to store
    const drill = useGameStore(s => s.drill);
    const resources = useGameStore(s => s.resources);
    const buyUpgrade = useGameStore(s => s.buyUpgrade);
    const inventory = useGameStore(s => s.inventory);
    const droneLevels = useGameStore(s => s.droneLevels);
    const skillLevels = useGameStore(s => s.skillLevels);
    const equippedArtifacts = useGameStore(s => s.equippedArtifacts);
    const depth = useGameStore(s => s.depth);
    const heatStabilityTimer = useGameStore(s => s.heatStabilityTimer);
    const integrity = useGameStore(s => s.integrity);
    const lang = useGameStore(s => s.settings.language);

    // NEW: Phase 2.1 - Crafting Queue
    const craftingQueue = useGameStore(s => s.craftingQueue);
    const startCraft = useGameStore(s => s.startCraft);
    const collectCraftedItem = useGameStore(s => s.collectCraftedItem);
    const cancelCraft = useGameStore(s => s.cancelCraft);
    const equipmentInventory = useGameStore(s => s.equipmentInventory);

    const stats = calculateStats(drill, skillLevels, equippedArtifacts, inventory, depth);
    const forgeStats = { prod: drill.power.baseStats.energyOutput, cons: stats.energyCons };

    /**
     * Helper: Определить следующий доступный тир для крафта
     * Логика: следующий тир = max(текущий на буре, максимальный в инвентаре) + 1
     */
    const getNextAvailablePart = (
        partType: DrillSlot,
        currentPart: any,
        allParts: any[]
    ) => {
        // Найти максимальный тир в инвентаре для этого типа
        const maxTierInInventory = Math.max(
            currentPart.tier, // Текущий на буре
            ...equipmentInventory
                .filter(item => item.slotType === partType)
                .map(item => item.tier)
        );

        // Следующий тир = maxTier + 1
        const nextTier = maxTierInInventory + 1;

        // Найти деталь с этим тиром
        return allParts.find(p => p.tier === nextTier);
    };

    const renderActiveTab = () => {
        switch (forgeTab) {
            case 'DRILL':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 space-y-2 md:space-y-0">
                        <UpgradeCard title="НАКОНЕЧНИК" current={drill.bit} next={getNextAvailablePart(DrillSlot.BIT, drill.bit, BITS)} type={DrillSlot.BIT} resources={resources} onStartCraft={startCraft} craftingQueue={craftingQueue} />
                        <UpgradeCard title="ДВИГАТЕЛЬ" current={drill.engine} next={getNextAvailablePart(DrillSlot.ENGINE, drill.engine, ENGINES)} type={DrillSlot.ENGINE} resources={resources} onStartCraft={startCraft} craftingQueue={craftingQueue} />
                        <UpgradeCard title="ОХЛАЖДЕНИЕ" current={drill.cooling} next={getNextAvailablePart(DrillSlot.COOLING, drill.cooling, COOLERS)} type={DrillSlot.COOLING} resources={resources} onStartCraft={startCraft} craftingQueue={craftingQueue} />
                    </div>
                );
            case 'SYSTEMS':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
                        <UpgradeCard title="ЛОГИКА" current={drill.logic} next={getNextAvailablePart(DrillSlot.LOGIC, drill.logic, LOGIC_CORES)} type={DrillSlot.LOGIC} resources={resources} onStartCraft={startCraft} craftingQueue={craftingQueue} />
                        <UpgradeCard title="УПРАВЛЕНИЕ" current={drill.control} next={getNextAvailablePart(DrillSlot.CONTROL, drill.control, CONTROL_UNITS)} type={DrillSlot.CONTROL} resources={resources} onStartCraft={startCraft} craftingQueue={craftingQueue} />
                        <UpgradeCard title="ГРУЗОВОЙ ОТСЕК" current={drill.cargoBay} next={getNextAvailablePart(DrillSlot.CARGO_BAY, drill.cargoBay, CARGO_BAYS)} type={DrillSlot.CARGO_BAY} resources={resources} onStartCraft={startCraft} craftingQueue={craftingQueue} />
                        <UpgradeCard title="РЕДУКТОР" current={drill.gearbox} next={getNextAvailablePart(DrillSlot.GEARBOX, drill.gearbox, GEARBOXES)} type={DrillSlot.GEARBOX} resources={resources} onStartCraft={startCraft} craftingQueue={craftingQueue} />
                    </div>
                );
            case 'HULL':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
                        <UpgradeCard title="КАРКАС" current={drill.hull} next={getNextAvailablePart(DrillSlot.HULL, drill.hull, HULLS)} type={DrillSlot.HULL} resources={resources} onStartCraft={startCraft} craftingQueue={craftingQueue} />
                        <UpgradeCard title="ПИТАНИЕ" current={drill.power} next={getNextAvailablePart(DrillSlot.POWER, drill.power, POWER_CORES)} type={DrillSlot.POWER} resources={resources} onStartCraft={startCraft} craftingQueue={craftingQueue} />
                        <UpgradeCard title="БРОНЯ" current={drill.armor} next={getNextAvailablePart(DrillSlot.ARMOR, drill.armor, ARMORS)} type={DrillSlot.ARMOR} resources={resources} onStartCraft={startCraft} craftingQueue={craftingQueue} />
                    </div>
                );
            case 'SUPPLY':
                return <ConsumablesTab resources={resources} onStartCraft={startCraft} lang={lang || 'EN'} />;
            case 'FUSION':
                return (
                    <FusionTab
                        resources={resources}
                        inventory={inventory}
                        depth={depth}
                        heatStabilityTimer={heatStabilityTimer}
                        integrity={integrity}
                        drill={drill}
                    />
                );
            case 'DRONES':
                return <DronesTab resources={resources} droneLevels={droneLevels} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex-1 bg-black flex flex-col min-h-0 h-full">
            {/* TABS */}
            <div className="flex bg-zinc-950 border-b border-zinc-800 overflow-x-auto scrollbar-hide whitespace-nowrap min-h-[44px] touch-pan-x">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setForgeTab(tab.id)}
                        className={`flex-none py-3 md:py-4 px-4 md:px-6 text-[10px] md:text-xs font-bold pixel-text transition-colors border-r border-zinc-900 ${forgeTab === tab.id ? 'bg-zinc-900 text-white border-b-2 border-b-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ENERGY STATS */}
            <div className="bg-zinc-900 border-b border-zinc-800 p-2 px-2 md:px-4 flex justify-between items-center text-[10px] md:text-xs font-mono">
                <span className="text-zinc-500">БАЛАНС ЭНЕРГИИ:</span>
                <div className="flex items-center gap-2 md:gap-4">
                    <span className="text-green-400">ГЕН:{forgeStats.prod}</span>
                    <span className={forgeStats.cons > forgeStats.prod ? 'text-red-500 animate-pulse' : 'text-amber-400'}>ПОТР:{forgeStats.cons}</span>
                </div>
            </div>

            {/* NEW: CRAFTING QUEUE PANEL */}
            {craftingQueue.length > 0 && (
                <div className="bg-gray-800/50 border-b-2 border-cyan-500/30 p-3 md:p-4">
                    <h3 className="text-cyan-400 font-bold text-sm md:text-base mb-3 flex items-center gap-2">
                        <span>🛠️</span>
                        <span>ОЧЕРЕДЬ КРАФТА</span>
                        <span className="text-[10px] text-gray-500">({craftingQueue.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                        {craftingQueue.map(job => (
                            <CraftingJobCard
                                key={job.id}
                                job={job}
                                onCollect={() => collectCraftedItem(job.id)}
                                onCancel={() => cancelCraft(job.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* CONTENT */}
            <div className="flex-1 p-2 md:p-8 overflow-y-auto scrollbar-hide pb-32 overscroll-contain touch-pan-y">
                {renderActiveTab()}
            </div>
        </div>
    );
};

export default ForgeView;
