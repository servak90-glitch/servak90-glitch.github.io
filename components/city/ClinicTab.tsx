import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { OPERATORS } from '../../constants/rpg';
import { OperatorId } from '../../types';
import { t, TEXT_IDS } from '../../services/localization';
import { Activity, AlertTriangle, DollarSign } from 'lucide-react';

const RESPEC_COST = 10000;

export const ClinicTab: React.FC = () => {
    const { operatorId, changeOperator, resources, settings } = useGameStore();
    const lang = settings.language;
    const [selectedId, setSelectedId] = React.useState<OperatorId | null>(null);
    const [showConfirm, setShowConfirm] = React.useState(false);

    const currentOperator = OPERATORS.find(o => o.id === operatorId);
    const selectedOperator = selectedId ? OPERATORS.find(o => o.id === selectedId) : null;
    const canAfford = resources.credits >= RESPEC_COST;

    const handleRespec = () => {
        if (!selectedId || !canAfford) return;
        const success = changeOperator(selectedId, RESPEC_COST);
        if (success) {
            setShowConfirm(false);
            setSelectedId(null);
        }
    };

    if (!currentOperator) {
        return (
            <div className="flex items-center justify-center h-full text-zinc-500">
                <p className="font-mono text-sm">ERROR: NO OPERATOR ASSIGNED</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-zinc-950 to-black p-6 overflow-y-auto touch-pan-y">
            {/* Header */}
            <div className="mb-8 border-b border-cyan-900/30 pb-4">
                <div className="flex items-center gap-3 mb-2">
                    <Activity className="w-6 h-6 text-cyan-400" />
                    <h2 className="text-2xl font-black text-white uppercase tracking-wider">
                        MEDICAL BAY
                    </h2>
                </div>
                <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">
                    Operator Re-certification Facility
                </p>
            </div>

            {/* Current Operator */}
            <div className="mb-8">
                <div className="text-xs font-mono text-cyan-400 mb-3 uppercase tracking-widest">
                    Current Certification
                </div>
                <div className="bg-zinc-900/50 border-2 border-cyan-900/30 p-4 flex gap-4">
                    <div className="w-24 h-24 border border-zinc-700 overflow-hidden bg-black flex-shrink-0">
                        <img
                            src={currentOperator.portraitPath}
                            alt={t(currentOperator.name, lang)}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white uppercase mb-1">
                            {t(currentOperator.name, lang)}
                        </h3>
                        <p className="text-xs text-zinc-400 mb-2 italic">
                            {t(currentOperator.uniqueTrait, lang)}
                        </p>
                        <p className="text-xs text-zinc-500 font-mono">
                            {t(currentOperator.passiveBonus, lang)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Warning */}
            <div className="bg-orange-950/20 border border-orange-800/50 p-4 mb-6 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                    <div className="text-sm font-bold text-orange-400 mb-1">
                        БИОМЕТРИЧЕСКАЯ ПЕРЕПОДГОТОВКА
                    </div>
                    <p className="text-xs text-orange-300/80 leading-relaxed">
                        Процедура смены класса необратима и требует полной перенастройки нейроинтерфейса.
                        Стоимость: <span className="font-bold">{RESPEC_COST.toLocaleString()} CR</span>
                    </p>
                </div>
            </div>

            {/* Available Classes */}
            <div className="mb-6">
                <div className="text-xs font-mono text-zinc-400 mb-3 uppercase tracking-widest">
                    Available Certifications
                </div>
                <div className="space-y-3">
                    {OPERATORS.filter(op => op.id !== operatorId).map(op => (
                        <button
                            key={op.id}
                            onClick={() => setSelectedId(op.id)}
                            className={`
                                w-full text-left p-4 border-2 transition-all
                                ${selectedId === op.id
                                    ? 'bg-cyan-950/30 border-cyan-500'
                                    : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-600'
                                }
                            `}
                        >
                            <div className="flex gap-3">
                                <div className="w-16 h-16 border border-zinc-700 overflow-hidden bg-black flex-shrink-0">
                                    <img
                                        src={op.portraitPath}
                                        alt={t(op.name, lang)}
                                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-white uppercase text-sm mb-1">
                                        {t(op.name, lang)}
                                    </div>
                                    <div className="text-xs text-orange-400 mb-1">
                                        {t(op.uniqueTrait, lang)}
                                    </div>
                                    <div className="text-[10px] text-zinc-500 font-mono">
                                        {t(op.passiveBonus, lang)}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={() => setShowConfirm(true)}
                disabled={!selectedId || !canAfford}
                className={`
                    w-full py-4 font-black uppercase tracking-widest text-sm
                    transition-all relative overflow-hidden
                    ${selectedId && canAfford
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-black cursor-pointer'
                        : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                    }
                `}
            >
                <div className="flex items-center justify-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>
                        {!canAfford ? 'INSUFFICIENT CREDITS' : 'INITIATE RE-CERTIFICATION'}
                    </span>
                </div>
            </button>

            {/* Confirmation Modal */}
            {showConfirm && selectedOperator && (
                <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border-2 border-cyan-500 p-6 max-w-md w-full">
                        <h3 className="text-xl font-black text-white uppercase mb-4">
                            CONFIRM RE-CERTIFICATION
                        </h3>
                        <p className="text-sm text-zinc-400 mb-4">
                            Вы уверены, что хотите сменить класс с <span className="text-white font-bold">{t(currentOperator.name, lang)}</span> на <span className="text-cyan-400 font-bold">{t(selectedOperator.name, lang)}</span>?
                        </p>
                        <p className="text-xs text-orange-400 mb-6">
                            Стоимость: {RESPEC_COST.toLocaleString()} CR (необратимо)
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-bold uppercase text-sm"
                            >
                                ОТМЕНА
                            </button>
                            <button
                                onClick={handleRespec}
                                className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-bold uppercase text-sm"
                            >
                                ПОДТВЕРДИТЬ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
