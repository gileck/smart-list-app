import { createStore } from '@/client/stores';
import { MS_PER_DAY } from '../_shared/date';
import type { SmartListItem } from './types';
import { genId, makeSampleItems } from './utils';

export type NewItemInput = {
    listId: string;
    name: string;
    quantity_total: number;
    consumption_per_day: number;
};

export type EditItemInput = {
    name: string;
    quantity_total: number;
    quantity_left?: number;
    consumption_per_day: number;
};

interface SmartListState {
    items: SmartListItem[];
    lastConsumptionAt: number;
    addItem: (input: NewItemInput) => SmartListItem;
    updateItem: (id: string, input: EditItemInput) => void;
    deleteItem: (id: string) => void;
    deleteItemsForList: (listId: string) => void;
    restockBy: (id: string, amount: number) => void;
    runDailyConsumption: () => void;
    seedSampleItemsForList: (listId: string) => void;
    reassignItems: (fromListId: string, toListId: string) => void;
    reassignOrphansToList: (listId: string) => void;
}

function applyDailyConsumption(items: SmartListItem[], daysPassed: number): SmartListItem[] {
    if (daysPassed < 1) return items;
    const now = Date.now();
    return items.map((item) => ({
        ...item,
        quantity_left: Math.max(0, item.quantity_left - item.consumption_per_day * daysPassed),
        updated_at: now,
    }));
}

export const useSmartListStore = createStore<SmartListState>({
    key: 'smart-list-storage',
    label: 'Smart List Items',
    creator: (set, get) => ({
        items: [],
        lastConsumptionAt: Date.now(),

        addItem: (input) => {
            const now = Date.now();
            const total = Math.max(0, input.quantity_total);
            const perDay = Math.max(0, input.consumption_per_day);
            const newItem: SmartListItem = {
                id: genId(),
                listId: input.listId,
                name: input.name.trim(),
                quantity_total: total,
                quantity_left: total,
                consumption_per_day: perDay,
                restock_amount: total,
                created_at: now,
                updated_at: now,
            };
            set((state) => ({ items: [...state.items, newItem] }));
            return newItem;
        },

        updateItem: (id, input) => {
            const now = Date.now();
            const total = Math.max(0, input.quantity_total);
            const perDay = Math.max(0, input.consumption_per_day);
            set((state) => ({
                items: state.items.map((item) => {
                    if (item.id !== id) return item;
                    const nextLeft =
                        input.quantity_left !== undefined &&
                        !Number.isNaN(input.quantity_left) &&
                        input.quantity_left >= 0
                            ? input.quantity_left
                            : item.quantity_left;
                    return {
                        ...item,
                        name: input.name.trim(),
                        quantity_total: total,
                        quantity_left: nextLeft,
                        consumption_per_day: perDay,
                        restock_amount: total,
                        updated_at: now,
                    };
                }),
            }));
        },

        deleteItem: (id) => {
            set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
        },

        deleteItemsForList: (listId) => {
            set((state) => ({ items: state.items.filter((item) => item.listId !== listId) }));
        },

        restockBy: (id, amount) => {
            if (!Number.isFinite(amount) || amount < 0) return;
            const now = Date.now();
            set((state) => ({
                items: state.items.map((item) =>
                    item.id === id
                        ? {
                              ...item,
                              quantity_left: Math.max(0, item.quantity_left) + amount,
                              updated_at: now,
                          }
                        : item
                ),
            }));
        },

        runDailyConsumption: () => {
            const state = get();
            const now = Date.now();
            const daysPassed = Math.floor((now - state.lastConsumptionAt) / MS_PER_DAY);
            if (daysPassed < 1) return;
            set({
                items: applyDailyConsumption(state.items, daysPassed),
                lastConsumptionAt: state.lastConsumptionAt + daysPassed * MS_PER_DAY,
            });
        },

        seedSampleItemsForList: (listId) => {
            set((state) => ({
                items: [...state.items, ...makeSampleItems(listId)],
            }));
        },

        reassignItems: (fromListId, toListId) => {
            const now = Date.now();
            set((state) => ({
                items: state.items.map((item) =>
                    item.listId === fromListId
                        ? { ...item, listId: toListId, updated_at: now }
                        : item
                ),
            }));
        },

        reassignOrphansToList: (listId) => {
            const now = Date.now();
            set((state) => {
                const hasOrphans = state.items.some((item) => !item.listId);
                if (!hasOrphans) return state;
                return {
                    items: state.items.map((item) =>
                        item.listId ? item : { ...item, listId, updated_at: now }
                    ),
                };
            });
        },
    }),
    persistOptions: {
        partialize: (state) => ({
            items: state.items,
            lastConsumptionAt: state.lastConsumptionAt,
        }),
    },
});
