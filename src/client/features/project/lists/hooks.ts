import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createList as createListApi,
    deleteList as deleteListApi,
    getLists,
    updateList as updateListApi,
} from '@/apis/project/lists/client';
import type {
    CreateListRequest,
    GetListsResponse,
} from '@/apis/project/lists/types';
import type { GetChoresResponse } from '@/apis/project/chores/types';
import type { GetItemsResponse } from '@/apis/project/shopping-items/types';
import { useQueryDefaults } from '@/client/query/defaults';
import { generateId } from '@/client/utils/id';
import { itemsQueryKey } from '../smart-list/hooks';
import { choresQueryKey } from '../chores/hooks';
import type { List } from './types';

export const listsQueryKey = ['lists'] as const;

export function useLists(options?: { enabled?: boolean }) {
    const queryDefaults = useQueryDefaults();
    return useQuery({
        queryKey: listsQueryKey,
        queryFn: async (): Promise<GetListsResponse> => {
            const response = await getLists({});
            if (response.data?.error) throw new Error(response.data.error);
            return response.data;
        },
        enabled: options?.enabled ?? true,
        ...queryDefaults,
    });
}

export type CreateListInput = {
    name: string;
    type: CreateListRequest['type'];
};

export function useCreateList() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateListInput & { _id: string }) => {
            const response = await createListApi(data);
            if (response.data?.error) throw new Error(response.data.error);
            return response.data?.list;
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: listsQueryKey });
            const previous = queryClient.getQueryData<GetListsResponse>(listsQueryKey);
            const now = Date.now();
            const optimistic: List = {
                id: variables._id,
                name: variables.name.trim(),
                type: variables.type,
                created_at: now,
                updated_at: now,
            };
            queryClient.setQueryData<GetListsResponse>(listsQueryKey, (old) => ({
                lists: [...(old?.lists ?? []), optimistic],
            }));
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(listsQueryKey, context.previous);
        },
        onSuccess: () => {},
        onSettled: () => {},
    });
}

type CreateListMutate = ReturnType<typeof useCreateList>['mutate'];
type CreateListOptions = Parameters<CreateListMutate>[1];

export function useCreateListWithId() {
    const mutation = useCreateList();
    return {
        ...mutation,
        mutate: (data: CreateListInput, options?: CreateListOptions) =>
            mutation.mutate({ ...data, _id: generateId() }, options),
        mutateAsync: (data: CreateListInput) =>
            mutation.mutateAsync({ ...data, _id: generateId() }),
    };
}

export function useUpdateList() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { listId: string; name: string }) => {
            const response = await updateListApi(data);
            if (response.data?.error) throw new Error(response.data.error);
            return response.data?.list;
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: listsQueryKey });
            const previous = queryClient.getQueryData<GetListsResponse>(listsQueryKey);
            queryClient.setQueryData<GetListsResponse>(listsQueryKey, (old) => {
                if (!old?.lists) return old;
                return {
                    lists: old.lists.map((l) =>
                        l.id === variables.listId
                            ? { ...l, name: variables.name.trim(), updated_at: Date.now() }
                            : l
                    ),
                };
            });
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(listsQueryKey, context.previous);
        },
        onSuccess: () => {},
        onSettled: () => {},
    });
}

export function useDeleteList() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { listId: string }) => {
            const response = await deleteListApi(data);
            if (response.data?.error) throw new Error(response.data.error);
            return data.listId;
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: listsQueryKey });
            await queryClient.cancelQueries({ queryKey: itemsQueryKey });
            await queryClient.cancelQueries({ queryKey: choresQueryKey });

            const previousLists = queryClient.getQueryData<GetListsResponse>(listsQueryKey);
            const previousItems = queryClient.getQueryData(itemsQueryKey);
            const previousChores = queryClient.getQueryData(choresQueryKey);

            queryClient.setQueryData<GetListsResponse>(listsQueryKey, (old) => {
                if (!old?.lists) return old;
                return { lists: old.lists.filter((l) => l.id !== variables.listId) };
            });
            queryClient.setQueryData<GetItemsResponse>(itemsQueryKey, (old) => {
                if (!old?.items) return old;
                return {
                    ...old,
                    items: old.items.filter((i) => i.listId !== variables.listId),
                };
            });
            queryClient.setQueryData<GetChoresResponse>(choresQueryKey, (old) => {
                if (!old?.chores) return old;
                return {
                    ...old,
                    chores: old.chores.filter((c) => c.listId !== variables.listId),
                };
            });

            return { previousLists, previousItems, previousChores };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousLists)
                queryClient.setQueryData(listsQueryKey, context.previousLists);
            if (context?.previousItems)
                queryClient.setQueryData(itemsQueryKey, context.previousItems);
            if (context?.previousChores)
                queryClient.setQueryData(choresQueryKey, context.previousChores);
        },
        onSuccess: () => {},
        onSettled: () => {},
    });
}
