/**
 * EquipmentInventoryView - главное окно инвентаря equipment
 * Трёхзонный дизайн:
 * ⬆️ ВЕРХ (30%): EquipmentDoll - "кукла" бура с 10 слотами
 * ↔️ СЕРЕДИНА (10%): QuickAccessBar - быстрые слоты (Phase 3)
 * ⬇️ НИЗ (50%): WeightBar + InventoryGrid
 */

import React from 'react';
import { useGameStore } from '../store/gameStore';
import { audioEngine } from '../services/audioEngine';
import { EquipmentCard } from './equipment/EquipmentCard';
import { WeightBar } from './equipment/WeightBar';
import { EquipmentDoll } from './equipment/EquipmentDoll';
import { DrillSlot } from '../types';

interface EquipmentInventoryViewProps {
    onClose: () => void;
}

export const EquipmentInventoryView: React.FC<EquipmentInventoryViewProps> = ({ onClose }) => {
    const [selectedSlot, setSelectedSlot] = React.useState<DrillSlot | null>(null);

    React.useEffect(() => {
        audioEngine.playUIPanelOpen();
    }, []);

    const equipmentInventory = useGameStore(s => s.equipmentInventory);

    // Фильтрация инвентаря
    const filteredInventory = React.useMemo(() => {
        let items = [...equipmentInventory];
        if (selectedSlot) {
            items = items.filter(item => item.slotType === selectedSlot);
        }
        // Сначала неэкипированные, потом по тиру (убывание)
        return items.sort((a, b) => {
            if (a.isEquipped !== b.isEquipped) return a.isEquipped ? 1 : -1;
            return b.tier - a.tier;
        });
    }, [equipmentInventory, selectedSlot]);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
                className="bg-[#0a0e17] border-2 border-[#3b82f6] rounded-lg p-4 md:p-6 max-w-6xl w-full h-[95vh] md:h-[90vh] flex flex-col overflow-hidden"
                style={{ boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)' }}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl md:text-3xl">⚙️</span>
                        <h2 className="text-xl md:text-3xl font-bold text-[#3b82f6] font-['Inter'] uppercase tracking-tighter">
                            Инвентарь Оборудования
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl md:text-3xl transition-colors p-1"
                    >
                        ✕
                    </button>
                </div>

                {/* ⬆️ ЗОНА 1: Кукла бура (30% высоты) */}
                <div className="h-[30%] mb-4 border border-gray-700/50 rounded-lg p-3 bg-gray-900/20 shrink-0">
                    <EquipmentDoll
                        selectedSlot={selectedSlot}
                        onSlotClick={setSelectedSlot}
                    />
                </div>

                {/* ↔️ ЗОНА 2: Quick Access (10% высоты) */}
                <div className="h-[12%] md:h-[10%] mb-4 border border-gray-700/30 rounded-lg p-2 bg-gray-900/10 shrink-0">
                    <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest font-bold">БЫСТРЫЙ ДОСТУП (Q | E | R | F)</div>
                    <div className="grid grid-cols-4 gap-2 h-10 md:h-12">
                        {['Q', 'E', 'R', 'F'].map(key => (
                            <div
                                key={key}
                                className="bg-gray-800/50 border border-gray-700/50 rounded flex items-center justify-center relative group overflow-hidden"
                            >
                                <span className="absolute top-0.5 left-1 text-[8px] text-gray-500 font-mono">{key}</span>
                                <span className="text-gray-600 text-[10px] uppercase font-bold group-hover:text-gray-400 transition-colors">Пусто</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ⬇️ ЗОНА 3: Склад (50% высоты) */}
                <div className="flex-1 min-h-0 flex flex-col">
                    {/* WeightBar - индикатор M_total */}
                    <WeightBar />

                    {/* InventoryGrid */}
                    <div className="flex-1 bg-gray-950/50 border border-gray-800 rounded-lg p-3 overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-3">
                            <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                                Склад {selectedSlot && <span className="text-[#3b82f6]">/ {selectedSlot.toUpperCase()}</span>}
                                <span className="ml-2 text-gray-600">({filteredInventory.length} предметов)</span>
                            </div>
                            <div className="flex gap-2">
                                {/* Здесь могут быть кнопки сортировки */}
                            </div>
                        </div>

                        {filteredInventory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-600 border-2 border-dashed border-gray-800 rounded-lg">
                                <span className="text-4xl mb-2 opacity-20">📦</span>
                                <p className="text-sm">Ничего не найдено</p>
                                {selectedSlot && (
                                    <button
                                        onClick={() => setSelectedSlot(null)}
                                        className="mt-2 text-[#3b82f6] text-xs hover:underline"
                                    >
                                        Показать всё
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {filteredInventory.map(item => (
                                    <EquipmentCard
                                        key={item.instanceId}
                                        item={item}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
