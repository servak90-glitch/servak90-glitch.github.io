/**
 * CraftingJobCard - отображение задания в очереди крафта
 * Показывает прогресс, оставшееся время, кнопки действий
 */

import React, { useState, useEffect } from 'react';
import { CraftingJob } from '../../types';
import { getPartDefinition } from '../../store/slices/craftSlice';
import { t } from '../../services/localization';
import { useGameStore } from '../../store/gameStore';

interface CraftingJobCardProps {
    job: CraftingJob;
    onCollect: () => void;
    onCancel: () => void;
}

export const CraftingJobCard: React.FC<CraftingJobCardProps> = ({ job, onCollect, onCancel }) => {
    const [now, setNow] = useState(Date.now());
    const lang = useGameStore(s => s.settings.language);

    // Обновляем время каждую секунду для live прогресса
    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const remaining = Math.max(0, job.completionTime - now);
    const totalTime = job.completionTime - job.startTime;
    const progress = totalTime > 0 ? Math.min(1, 1 - (remaining / totalTime)) : 1;

    // Форматирование времени (мм:сс)
    const remainingMin = Math.floor(remaining / 60000);
    const remainingSec = Math.floor((remaining % 60000) / 1000);
    const timeStr = `${remainingMin}:${remainingSec.toString().padStart(2, '0')}`;

    // Получить название детали
    const partDef = getPartDefinition(job.partId);
    const displayName = partDef ? t(partDef.name, lang) : job.partId;

    return (
        <div className="bg-gray-900 border border-gray-700 rounded p-3 hover:border-cyan-500/50 transition-all">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">{displayName}</span>
                    <span className="text-[10px] text-gray-500 uppercase">{job.slotType}</span>
                </div>
                {job.status === 'in_progress' && (
                    <span className="text-yellow-400 text-sm font-mono">{timeStr}</span>
                )}
                {job.status === 'ready_to_collect' && (
                    <span className="text-green-400 animate-pulse font-bold text-sm">✅ ГОТОВО!</span>
                )}
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-800 rounded mb-3 overflow-hidden">
                <div
                    className={`h-full rounded transition-all duration-1000 ${job.status === 'ready_to_collect'
                        ? 'bg-green-500'
                        : 'bg-cyan-500'
                        }`}
                    style={{ width: `${progress * 100}%` }}
                />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
                {job.status === 'ready_to_collect' && (
                    <button
                        onClick={onCollect}
                        className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 px-3 rounded font-bold text-sm transition-colors"
                    >
                        ✓ СОБРАТЬ
                    </button>
                )}
                {job.status === 'in_progress' && (
                    <button
                        onClick={onCancel}
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 px-3 rounded text-sm transition-colors"
                    >
                        ✕ ОТМЕНИТЬ (-50%)
                    </button>
                )}
            </div>
        </div>
    );
};
