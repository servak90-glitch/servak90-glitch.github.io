/**
 * STATE CONTRACTS TAB — Госзаказы от фракций
 * Phase 6: Крупные контракты с повышенной наградой
 */

import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { t } from '../../services/localization';
import { StateContract, FactionId, ContractTier } from '../../types';
import { Star, Clock, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';

const TIER_COLORS: Record<ContractTier, string> = {
    STANDARD: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5',
    PRIORITY: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
    CRITICAL: 'text-red-400 border-red-500/30 bg-red-500/5',
};

const TIER_LABELS: Record<ContractTier, { RU: string; EN: string }> = {
    STANDARD: { RU: 'СТАНДАРТ', EN: 'STANDARD' },
    PRIORITY: { RU: 'ПРИОРИТЕТ', EN: 'PRIORITY' },
    CRITICAL: { RU: 'КРИТИЧЕСКИЙ', EN: 'CRITICAL' },
};

const FACTION_COLORS: Record<FactionId, string> = {
    CORPORATE: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5',
    SCIENCE: 'text-purple-400 border-purple-500/30 bg-purple-500/5',
    REBELS: 'text-orange-400 border-orange-500/30 bg-orange-500/5',
};

const StateContractsTab: React.FC = () => {
    const {
        availableContracts,
        activeContracts,
        acceptContract,
        deliverToContract,
        completeContract,
        getReputationLevel,
        resources,
        settings,
    } = useGameStore();

    const lang = settings.language;

    const handleAccept = (contractId: string) => {
        acceptContract(contractId);
    };

    const handleDeliver = (contractId: string, contract: StateContract) => {
        // Доставить все требуемые ресурсы
        contract.requirements.forEach(req => {
            const available = resources[req.resource] || 0;
            const needed = req.amount - req.delivered;
            const toDeliver = Math.min(available, needed);
            if (toDeliver > 0) {
                deliverToContract(contractId, req.resource, toDeliver);
            }
        });
    };

    const renderContract = (contract: StateContract, isActive: boolean) => {
        const repLevel = getReputationLevel(contract.factionId);
        const canAccept = repLevel >= contract.minReputationLevel;
        const tierColor = TIER_COLORS[contract.tier];
        const factionColor = FACTION_COLORS[contract.factionId];

        // Проверка завершённости
        const allDelivered = contract.requirements.every(req => req.delivered >= req.amount);

        return (
            <div
                key={contract.id}
                className={`border p-4 flex flex-col gap-3 relative group ${factionColor}`}
            >
                {/* HEADER */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${tierColor} uppercase w-fit`}>
                            {t(TIER_LABELS[contract.tier], lang)}
                        </span>
                        <span className="text-[8px] text-white/40 uppercase tracking-widest">
                            {contract.factionId}
                        </span>
                    </div>
                    {contract.timeLimit && (
                        <div className="flex items-center gap-1 text-[9px] text-amber-400">
                            <Clock className="w-3 h-3" />
                            <span>{contract.timeLimit}ч</span>
                        </div>
                    )}
                </div>

                {/* TITLE & DESCRIPTION */}
                <div>
                    <h4 className="text-sm font-bold text-white mb-1">{t(contract.title, lang)}</h4>
                    <p className="text-[9px] text-zinc-400 leading-tight">{t(contract.description, lang)}</p>
                </div>

                {/* REQUIREMENTS */}
                <div>
                    <div className="text-[8px] text-zinc-500 font-bold mb-1 uppercase">Требования:</div>
                    <div className="bg-black/30 p-2 border-l-2 border-red-900/30 space-y-1">
                        {contract.requirements.map((req, i) => {
                            const progress = (req.delivered / req.amount) * 100;
                            const isComplete = req.delivered >= req.amount;
                            return (
                                <div key={i}>
                                    <div className="flex justify-between text-[10px] font-mono mb-1">
                                        <span className="uppercase">{req.resource}</span>
                                        <span className={isComplete ? 'text-green-500' : 'text-red-500'}>
                                            {req.delivered.toLocaleString()} / {req.amount.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="h-1 bg-black/60 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${isComplete ? 'bg-green-500' : 'bg-cyan-500'}`}
                                            style={{ width: `${Math.min(100, progress)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* REWARDS */}
                <div>
                    <div className="text-[8px] text-zinc-500 font-bold mb-1 uppercase">Награда:</div>
                    <div className="bg-black/30 p-2 border-l-2 border-green-900/30">
                        <div className="flex justify-between text-[10px] font-mono text-green-400">
                            <span>CREDITS</span>
                            <span>+{contract.rewards.credits.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-green-400">
                            <span>REPUTATION</span>
                            <span>+{contract.rewards.reputation}</span>
                        </div>
                        {contract.rewards.blueprint && (
                            <div className="flex items-center gap-1 text-[9px] text-purple-400 mt-1">
                                <Star className="w-3 h-3" />
                                <span className="uppercase">ЧЕРТЁЖ: {contract.rewards.blueprint}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* WARNINGS */}
                {contract.exclusive && (
                    <div className="flex items-center gap-2 text-[8px] text-amber-400 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span className="uppercase">Эксклюзивный контракт (блокирует другие фракции)</span>
                    </div>
                )}

                {/* ACTION BUTTON */}
                {!isActive ? (
                    <button
                        onClick={() => handleAccept(contract.id)}
                        disabled={!canAccept}
                        className={`w-full py-2 text-[10px] font-bold pixel-text uppercase ${canAccept
                                ? 'bg-white text-black hover:bg-green-400 transition-colors'
                                : 'bg-black text-zinc-600 border border-zinc-800 cursor-not-allowed'
                            }`}
                    >
                        {canAccept ? (
                            'ПРИНЯТЬ КОНТРАКТ'
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <Lock className="w-3 h-3" />
                                <span>ТРЕБУЕТСЯ УРОВЕНЬ {contract.minReputationLevel}</span>
                            </div>
                        )}
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleDeliver(contract.id, contract)}
                            disabled={allDelivered}
                            className={`flex-1 py-2 text-[10px] font-bold pixel-text uppercase ${!allDelivered
                                    ? 'bg-cyan-500 text-black hover:bg-cyan-400 transition-colors'
                                    : 'bg-black text-zinc-600 border border-zinc-800 cursor-not-allowed'
                                }`}
                        >
                            ДОСТАВИТЬ
                        </button>
                        <button
                            onClick={() => completeContract(contract.id)}
                            disabled={!allDelivered}
                            className={`flex-1 py-2 text-[10px] font-bold pixel-text uppercase flex items-center justify-center gap-2 ${allDelivered
                                    ? 'bg-green-500 text-black hover:bg-green-400 transition-colors'
                                    : 'bg-black text-zinc-600 border border-zinc-800 cursor-not-allowed'
                                }`}
                        >
                            <CheckCircle2 className="w-3 h-3" />
                            ЗАВЕРШИТЬ
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* ACTIVE CONTRACTS */}
            {activeContracts.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold pixel-text text-white mb-3 uppercase">
                        Активные Госзаказы ({activeContracts.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeContracts.map(contract => renderContract(contract, true))}
                    </div>
                </div>
            )}

            {/* AVAILABLE CONTRACTS */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold pixel-text text-white uppercase">
                        Доступные Госзаказы ({availableContracts.length})
                    </h3>
                    <div className="text-[9px] text-zinc-500 uppercase tracking-widest">
                        Обновление: каждые 24 игровых часа
                    </div>
                </div>

                {availableContracts.length === 0 ? (
                    <div className="border border-zinc-800 bg-zinc-900/50 p-8 text-center">
                        <h4 className="text-zinc-500 font-bold pixel-text text-sm mb-2 uppercase">
                            Нет доступных госзаказов
                        </h4>
                        <p className="text-zinc-600 font-mono text-xs">
                            Новые контракты появятся через некоторое время
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableContracts.map(contract => renderContract(contract, false))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StateContractsTab;
