import { createStore } from '@/client/stores';
import type { List, ListTypeId } from './types';

function genListId(): string {
    return 'list_' + Math.random().toString(36).slice(2, 10);
}

export type NewListInput = {
    name: string;
    type: ListTypeId;
};

interface ListsState {
    lists: List[];
    addList: (input: NewListInput) => List;
    renameList: (id: string, name: string) => void;
    deleteList: (id: string) => void;
    upsertSeed: (list: List) => void;
}

export const useListsStore = createStore<ListsState>({
    key: 'lists-storage',
    label: 'Lists',
    creator: (set) => ({
        lists: [],

        addList: (input) => {
            const now = Date.now();
            const newList: List = {
                id: genListId(),
                name: input.name.trim(),
                type: input.type,
                created_at: now,
                updated_at: now,
            };
            set((state) => ({ lists: [...state.lists, newList] }));
            return newList;
        },

        renameList: (id, name) => {
            const now = Date.now();
            set((state) => ({
                lists: state.lists.map((l) =>
                    l.id === id ? { ...l, name: name.trim(), updated_at: now } : l
                ),
            }));
        },

        deleteList: (id) => {
            set((state) => ({ lists: state.lists.filter((l) => l.id !== id) }));
        },

        upsertSeed: (list) => {
            set((state) =>
                state.lists.some((l) => l.id === list.id)
                    ? state
                    : { lists: [...state.lists, list] }
            );
        },
    }),
    persistOptions: {
        partialize: (state) => ({ lists: state.lists }),
    },
});

export const DEFAULT_LIST_ID = 'list_default';

export function getDefaultList(): List {
    const now = Date.now();
    return {
        id: DEFAULT_LIST_ID,
        name: 'Shopping List',
        type: 'shopping',
        created_at: now,
        updated_at: now,
    };
}
