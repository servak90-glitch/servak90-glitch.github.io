import { SliceCreator } from './types';
import { LogCategory, LogEntry } from '../../types';

export interface LogbookSlice {
    logEntries: LogEntry[];

    // Actions
    addLogEntry: (entry: Omit<LogEntry, 'id' | 'timestamp' | 'realTimestamp' | 'isRead'>) => void;
    markLogAsRead: (id: string) => void;
    markAllLogsAsRead: (category?: LogCategory) => void;
    clearLogs: () => void; // Debug/Admin
}

export const createLogbookSlice: SliceCreator<LogbookSlice> = (set, get) => ({
    logEntries: [],

    addLogEntry: (partialEntry) => {
        const id = Math.random().toString(36).substr(2, 9);
        const timestamp = get().gameTime;
        const realTimestamp = Date.now();

        const newEntry: LogEntry = {
            id,
            timestamp,
            realTimestamp,
            isRead: false,
            ...partialEntry
        };

        set(state => ({
            logEntries: [newEntry, ...state.logEntries].slice(0, 200) // Limit history to last 200 items to save space
        }));
    },

    /* 
       DIALOG SYSTEM INTEGRATION (Reserved)
       This section is reserved for integration with the future Dialog System.
       When dialogs are triggered, use addLogEntry({ category: LogCategory.DIALOG, ... })
    */

    markLogAsRead: (id) => set(state => ({
        logEntries: state.logEntries.map(e => e.id === id ? { ...e, isRead: true } : e)
    })),

    markAllLogsAsRead: (category) => set(state => ({
        logEntries: state.logEntries.map(e =>
            (!category || e.category === category) ? { ...e, isRead: true } : e
        )
    })),

    clearLogs: () => set({ logEntries: [] })
});
