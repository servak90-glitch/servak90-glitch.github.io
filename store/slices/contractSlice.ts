/**
 * CONTRACT SLICE — управление госзаказами (State Contracts)
 * Phase 6: Фракции и Госзаказы
 */

import { SliceCreator } from './types';
import type { StateContract, FactionId, ResourceType, ContractStatus } from '../../types';
import { generateContractFromTemplate, getRandomContractTemplate } from '../../constants/stateContracts';

export interface ContractActions {
    activeContracts: StateContract[];
    availableContracts: StateContract[];
    completedContractIds: string[];

    generateDailyContracts: () => void;
    acceptContract: (contractId: string) => boolean;
    deliverToContract: (contractId: string, resource: ResourceType, amount: number) => void;
    completeContract: (contractId: string) => void;
    failContract: (contractId: string) => void;
    checkContractExpiration: () => void;
}

export const createContractSlice: SliceCreator<ContractActions> = (set, get) => ({
    activeContracts: [],
    availableContracts: [],
    completedContractIds: [],

    /**
     * Генерация ежедневных госзаказов (вызывается из GameEngine)
     */
    generateDailyContracts: () => {
        const state = get();
        const gameTime = state.gameTime || 0;

        // Проверка: прошло ли 24 игровых часа (24 * 60 * 60 = 86400 игровых секунд = 24 минуты реального времени)
        const timeSinceLastGeneration = gameTime - (state.lastContractGeneration || 0);
        const GENERATION_INTERVAL = 24 * 60 * 60; // 24 игровых часа

        if (timeSinceLastGeneration < GENERATION_INTERVAL && state.lastContractGeneration > 0) {
            return; // Ещё рано генерировать
        }

        // Генерируем по 1 контракту для каждой фракции
        const factions: FactionId[] = ['CORPORATE', 'SCIENCE', 'REBELS'];
        const newContracts: StateContract[] = [];

        factions.forEach(factionId => {
            const templateIndex = getRandomContractTemplate(factionId);
            const contract = generateContractFromTemplate(factionId, templateIndex, gameTime);
            newContracts.push(contract);
        });

        set(s => ({
            availableContracts: [...s.availableContracts, ...newContracts],
            lastContractGeneration: gameTime,
            actionLogQueue: [...s.actionLogQueue, {
                type: 'LOG',
                msg: 'НОВЫЕ ГОСЗАКАЗЫ ДОСТУПНЫ',
                color: 'text-cyan-400',
                icon: '📋'
            }]
        }));
    },

    /**
     * Принять госзаказ
     */
    acceptContract: (contractId) => {
        const state = get();
        const contract = state.availableContracts.find(c => c.id === contractId);

        if (!contract) return false;

        // Проверка уровня репутации
        const repLevel = (state as any).getReputationLevel(contract.factionId);
        if (repLevel < contract.minReputationLevel) {
            set(s => ({
                actionLogQueue: [...s.actionLogQueue, {
                    type: 'LOG',
                    msg: `НЕДОСТАТОЧНАЯ РЕПУТАЦИЯ (требуется уровень ${contract.minReputationLevel})`,
                    color: 'text-red-400'
                }]
            }));
            return false;
        }

        // Проверка эксклюзивности
        if (contract.exclusive) {
            const hasActiveExclusive = state.activeContracts.some(c => c.exclusive);
            if (hasActiveExclusive) {
                set(s => ({
                    actionLogQueue: [...s.actionLogQueue, {
                        type: 'LOG',
                        msg: 'УЖЕ ВЫПОЛНЯЕТСЯ ЭКСКЛЮЗИВНЫЙ КОНТРАКТ',
                        color: 'text-red-400'
                    }]
                }));
                return false;
            }
        }

        // Принять контракт
        const acceptedContract = {
            ...contract,
            status: 'active' as ContractStatus,
            acceptedAt: state.gameTime || 0,
        };

        set(s => ({
            availableContracts: s.availableContracts.filter(c => c.id !== contractId),
            activeContracts: [...s.activeContracts, acceptedContract],
            actionLogQueue: [...s.actionLogQueue, {
                type: 'LOG',
                msg: `КОНТРАКТ ПРИНЯТ: ${contract.factionId}`,
                color: 'text-green-400',
                icon: '✓'
            }]
        }));

        return true;
    },

    /**
     * Доставить ресурсы в контракт
     */
    deliverToContract: (contractId, resource, amount) => {
        const state = get();
        const contractIndex = state.activeContracts.findIndex(c => c.id === contractId);

        if (contractIndex === -1) return;

        const contract = state.activeContracts[contractIndex];
        const reqIndex = contract.requirements.findIndex(r => r.resource === resource);

        if (reqIndex === -1) return;

        // Проверка наличия ресурсов
        const currentAmount = state.resources[resource] || 0;
        const actualDelivery = Math.min(amount, currentAmount);

        if (actualDelivery <= 0) return;

        // Обновить прогресс
        const updatedContract = { ...contract };
        updatedContract.requirements = [...contract.requirements];
        updatedContract.requirements[reqIndex] = {
            ...contract.requirements[reqIndex],
            delivered: Math.min(
                contract.requirements[reqIndex].delivered + actualDelivery,
                contract.requirements[reqIndex].amount
            ),
        };

        // Списать ресурсы
        const updatedContracts = [...state.activeContracts];
        updatedContracts[contractIndex] = updatedContract;

        set(s => ({
            activeContracts: updatedContracts,
            resources: {
                ...s.resources,
                [resource]: (s.resources[resource] || 0) - actualDelivery,
            },
            actionLogQueue: [...s.actionLogQueue, {
                type: 'LOG',
                msg: `ДОСТАВЛЕНО: ${actualDelivery} ${resource.toUpperCase()}`,
                color: 'text-cyan-400'
            }]
        }));

        // Проверить завершение
        const allDelivered = updatedContract.requirements.every(
            req => req.delivered >= req.amount
        );

        if (allDelivered) {
            (get() as any).completeContract(contractId);
        }
    },

    /**
     * Завершить контракт (выдать награды)
     */
    completeContract: (contractId) => {
        const state = get();
        const contractIndex = state.activeContracts.findIndex(c => c.id === contractId);

        if (contractIndex === -1) return;

        const contract = state.activeContracts[contractIndex];

        // Выдать награды
        set(s => ({
            resources: {
                ...s.resources,
                credits: (s.resources.credits || 0) + contract.rewards.credits,
                ...(contract.rewards.bonus || {}),
            },
            activeContracts: s.activeContracts.filter(c => c.id !== contractId),
            completedContractIds: [...s.completedContractIds, contractId],
            actionLogQueue: [...s.actionLogQueue, {
                type: 'LOG',
                msg: `КОНТРАКТ ВЫПОЛНЕН! +${contract.rewards.credits} CR, +${contract.rewards.reputation} REP`,
                color: 'text-green-400',
                icon: '★'
            }]
        }));

        // Добавить репутацию
        (state as any).addReputation(contract.factionId, contract.rewards.reputation);

        // TODO: Разблокировать чертёж если есть
        if (contract.rewards.blueprint) {
            // Добавить логику разблокировки чертежа
        }
    },

    /**
     * Провалить контракт (применить штрафы)
     */
    failContract: (contractId) => {
        const state = get();
        const contractIndex = state.activeContracts.findIndex(c => c.id === contractId);

        if (contractIndex === -1) return;

        const contract = state.activeContracts[contractIndex];

        // Применить штрафы
        if (contract.failurePenalty) {
            (state as any).addReputation(contract.factionId, -contract.failurePenalty.reputation);

            if (contract.failurePenalty.credits) {
                set(s => ({
                    resources: {
                        ...s.resources,
                        credits: Math.max(0, (s.resources.credits || 0) - contract.failurePenalty!.credits!),
                    },
                }));
            }
        }

        set(s => ({
            activeContracts: s.activeContracts.filter(c => c.id !== contractId),
            actionLogQueue: [...s.actionLogQueue, {
                type: 'LOG',
                msg: `КОНТРАКТ ПРОВАЛЕН: ${contract.factionId} (-${contract.failurePenalty?.reputation || 0} REP)`,
                color: 'text-red-400',
                icon: '✗'
            }]
        }));
    },

    /**
     * Проверка истечения контрактов (вызывается из GameEngine)
     */
    checkContractExpiration: () => {
        const state = get();
        const currentTime = state.gameTime || 0;

        // Проверить активные контракты
        const expiredActive = state.activeContracts.filter(c =>
            c.timeLimit && c.expiresAt <= currentTime
        );

        expiredActive.forEach(contract => {
            (get() as any).failContract(contract.id);
        });

        // Удалить истёкшие доступные контракты
        set(s => ({
            availableContracts: s.availableContracts.filter(c => c.expiresAt > currentTime),
        }));
    },
});
