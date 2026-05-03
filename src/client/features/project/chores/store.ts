import { createStore } from '@/client/stores';
import type { Chore } from './types';
import { genId, startOfDay, startOfToday } from './utils';

export type NewChoreInput = {
    listId: string;
    name: string;
    repeat_interval_days: number;
    last_completed_at: number | null;
};

export type EditChoreInput = {
    name: string;
    repeat_interval_days: number;
    last_completed_at: number | null;
};

interface ChoresState {
    chores: Chore[];
    addChore: (input: NewChoreInput) => Chore;
    updateChore: (id: string, input: EditChoreInput) => void;
    deleteChore: (id: string) => void;
    deleteChoresForList: (listId: string) => void;
    markDone: (id: string) => void;
}

function clampLastCompleted(value: number | null): number | null {
    if (value == null) return null;
    const today = startOfToday();
    const day = startOfDay(value);
    return day > today ? today : day;
}

export const useChoresStore = createStore<ChoresState>({
    key: 'chores-storage',
    label: 'Chores',
    creator: (set) => ({
        chores: [],

        addChore: (input) => {
            const now = Date.now();
            const newChore: Chore = {
                id: genId(),
                listId: input.listId,
                name: input.name.trim(),
                repeat_interval_days: Math.max(1, input.repeat_interval_days),
                last_completed_at: clampLastCompleted(input.last_completed_at),
                created_at: now,
                updated_at: now,
            };
            set((state) => ({ chores: [...state.chores, newChore] }));
            return newChore;
        },

        updateChore: (id, input) => {
            const now = Date.now();
            const interval = Math.max(1, input.repeat_interval_days);
            set((state) => ({
                chores: state.chores.map((chore) =>
                    chore.id !== id
                        ? chore
                        : {
                              ...chore,
                              name: input.name.trim(),
                              repeat_interval_days: interval,
                              last_completed_at: clampLastCompleted(input.last_completed_at),
                              updated_at: now,
                          }
                ),
            }));
        },

        deleteChore: (id) => {
            set((state) => ({ chores: state.chores.filter((c) => c.id !== id) }));
        },

        deleteChoresForList: (listId) => {
            set((state) => ({ chores: state.chores.filter((c) => c.listId !== listId) }));
        },

        markDone: (id) => {
            const today = startOfToday();
            const now = Date.now();
            set((state) => ({
                chores: state.chores.map((chore) =>
                    chore.id === id
                        ? { ...chore, last_completed_at: today, updated_at: now }
                        : chore
                ),
            }));
        },
    }),
    persistOptions: {
        partialize: (state) => ({ chores: state.chores }),
    },
});
