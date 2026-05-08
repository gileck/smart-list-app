import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createItem as createItemApi,
    deleteItem as deleteItemApi,
    getItems,
    getRestockHistory,
    restockItem as restockItemApi,
    updateItem as updateItemApi,
} from '@/apis/project/shopping-items/client';
import type {
    GetItemsResponse,
    GetRestockHistoryResponse,
} from '@/apis/project/shopping-items/types';
import { useQueryDefaults } from '@/client/query/defaults';
import { generateId } from '@/client/utils/id';
import type { SmartListItem } from './types';

export const itemsQueryKey = ['shopping-items'] as const;
export const restockHistoryQueryKey = (itemId: string) =>
    ['shopping-items', itemId, 'restock-history'] as const;

export function useShoppingItems(options?: { enabled?: boolean }) {
    const queryDefaults = useQueryDefaults();
    return useQuery({
        queryKey: itemsQueryKey,
        queryFn: async (): Promise<GetItemsResponse> => {
            const response = await getItems({});
            if (response.data?.error) throw new Error(response.data.error);
            return response.data;
        },
        enabled: options?.enabled ?? true,
        ...queryDefaults,
    });
}

export type CreateItemInput = {
    listId: string;
    name: string;
    emoji?: string;
    quantity_left: number;
    consumption_per_day: number;
    restock_presets?: number[];
};

export function useCreateShoppingItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateItemInput & { _id: string }) => {
            const response = await createItemApi(data);
            if (response.data?.error) throw new Error(response.data.error);
            return response.data?.item;
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: itemsQueryKey });
            const previous = queryClient.getQueryData<GetItemsResponse>(itemsQueryKey);
            const now = Date.now();
            const optimistic: SmartListItem = {
                id: variables._id,
                listId: variables.listId,
                name: variables.name.trim(),
                emoji: variables.emoji,
                quantity_left: Math.max(0, variables.quantity_left),
                consumption_per_day: Math.max(0, variables.consumption_per_day),
                restock_presets: variables.restock_presets,
                created_at: now,
                updated_at: now,
            };
            queryClient.setQueryData<GetItemsResponse>(itemsQueryKey, (old) => ({
                items: [...(old?.items ?? []), optimistic],
            }));
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(itemsQueryKey, context.previous);
        },
        onSuccess: () => {},
        onSettled: () => {},
    });
}

type CreateItemMutate = ReturnType<typeof useCreateShoppingItem>['mutate'];
type CreateItemOptions = Parameters<CreateItemMutate>[1];

export function useCreateShoppingItemWithId() {
    const mutation = useCreateShoppingItem();
    return {
        ...mutation,
        mutate: (data: CreateItemInput, options?: CreateItemOptions) =>
            mutation.mutate({ ...data, _id: generateId() }, options),
        mutateAsync: (data: CreateItemInput) =>
            mutation.mutateAsync({ ...data, _id: generateId() }),
    };
}

export type UpdateItemInput = {
    itemId: string;
    name?: string;
    emoji?: string;
    quantity_left?: number;
    consumption_per_day?: number;
    restock_presets?: number[];
};

export function useUpdateShoppingItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: UpdateItemInput) => {
            const response = await updateItemApi(data);
            if (response.data?.error) throw new Error(response.data.error);
            return response.data?.item;
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: itemsQueryKey });
            const previous = queryClient.getQueryData<GetItemsResponse>(itemsQueryKey);
            queryClient.setQueryData<GetItemsResponse>(itemsQueryKey, (old) => {
                if (!old?.items) return old;
                const now = Date.now();
                return {
                    items: old.items.map((item) => {
                        if (item.id !== variables.itemId) return item;
                        return {
                            ...item,
                            name: variables.name?.trim() ?? item.name,
                            emoji: variables.emoji ?? item.emoji,
                            quantity_left:
                                variables.quantity_left !== undefined
                                    ? Math.max(0, variables.quantity_left)
                                    : item.quantity_left,
                            consumption_per_day:
                                variables.consumption_per_day !== undefined
                                    ? Math.max(0, variables.consumption_per_day)
                                    : item.consumption_per_day,
                            restock_presets:
                                variables.restock_presets !== undefined
                                    ? variables.restock_presets
                                    : item.restock_presets,
                            updated_at: now,
                        };
                    }),
                };
            });
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(itemsQueryKey, context.previous);
        },
        onSuccess: () => {},
        onSettled: () => {},
    });
}

export function useDeleteShoppingItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { itemId: string }) => {
            const response = await deleteItemApi(data);
            if (response.data?.error) throw new Error(response.data.error);
            return data.itemId;
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: itemsQueryKey });
            const previous = queryClient.getQueryData<GetItemsResponse>(itemsQueryKey);
            queryClient.setQueryData<GetItemsResponse>(itemsQueryKey, (old) => {
                if (!old?.items) return old;
                return { items: old.items.filter((i) => i.id !== variables.itemId) };
            });
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(itemsQueryKey, context.previous);
        },
        onSuccess: () => {},
        onSettled: () => {},
    });
}

export function useRestockShoppingItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { itemId: string; amount: number }) => {
            const response = await restockItemApi(data);
            if (response.data?.error) throw new Error(response.data.error);
            return response.data?.item;
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: itemsQueryKey });
            const previous = queryClient.getQueryData<GetItemsResponse>(itemsQueryKey);
            queryClient.setQueryData<GetItemsResponse>(itemsQueryKey, (old) => {
                if (!old?.items) return old;
                const now = Date.now();
                return {
                    items: old.items.map((item) =>
                        item.id === variables.itemId
                            ? {
                                  ...item,
                                  quantity_left: Math.max(0, item.quantity_left) + variables.amount,
                                  updated_at: now,
                              }
                            : item
                    ),
                };
            });
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(itemsQueryKey, context.previous);
        },
        onSuccess: (_data, variables) => {
            // Restock history is server-derived (observedPerDay computed
            // from the freshly-appended event); invalidate so the detail
            // page picks up the new event + recomputed rate. Items cache
            // stays optimistic.
            queryClient.invalidateQueries({
                queryKey: restockHistoryQueryKey(variables.itemId),
            });
        },
        onSettled: () => {},
    });
}

export function useRestockHistory(itemId: string, options?: { enabled?: boolean }) {
    const queryDefaults = useQueryDefaults();
    return useQuery({
        queryKey: restockHistoryQueryKey(itemId),
        queryFn: async (): Promise<GetRestockHistoryResponse> => {
            const response = await getRestockHistory({ itemId });
            if (response.data?.error) throw new Error(response.data.error);
            return response.data;
        },
        enabled: (options?.enabled ?? true) && !!itemId,
        ...queryDefaults,
    });
}
