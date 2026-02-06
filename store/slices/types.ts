/**
 * Типы для слайсов store
 * 
 * SliceCreator — функция создания слайса, получающая set/get от zustand
 */

import { StoreApi } from 'zustand';
import { OperatorActions } from './operatorSlice';
import { GameState, View, VisualEvent, DialogueState } from '../../types';

/**
 * Расширение GameState для store
 */
export interface GameStore extends GameState,
    OperatorActions {
    isGameActive: boolean;
    activeView: View;
    actionLogQueue: VisualEvent[];

    startDialogue: (state: DialogueState) => void;
    chooseDialogueOption: (choiceIndex: number) => void;
    closeDialogue: () => void;
}

/**
 * Типы для set/get от zustand
 */
export type SetState = StoreApi<GameStore>['setState'];
export type GetState = () => GameStore;

/**
 * Тип для функции создания слайса
 */
export type SliceCreator<T> = (set: SetState, get: GetState) => T;

/**
 * Утилита: добавить событие в очередь логов
 */
export function pushLog(s: GameStore, event: VisualEvent): VisualEvent[] {
    return [...s.actionLogQueue, event];
}

/**
 * Утилита: добавить несколько событий в очередь логов
 */
export function pushLogs(s: GameStore, events: VisualEvent[]): VisualEvent[] {
    return [...s.actionLogQueue, ...events];
}
