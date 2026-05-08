import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createChore as createChoreApi,
    deleteChore as deleteChoreApi,
    getChores,
    markChoreDone as markChoreDoneApi,
    updateChore as updateChoreApi,
} from '@/apis/project/chores/client';
import type { GetChoresResponse } from '@/apis/project/chores/types';
import { useQueryDefaults } from '@/client/query/defaults';
import { generateId } from '@/client/utils/id';
import type { Chore } from './types';
import { startOfDay, startOfToday } from './utils';

export const choresQueryKey = ['chores'] as const;

export function useChores(options?: { enabled?: boolean }) {
    const queryDefaults = useQueryDefaults();
    return useQuery({
        queryKey: choresQueryKey,
        queryFn: async (): Promise<GetChoresResponse> => {
            const response = await getChores({});
            if (response.data?.error) throw new Error(response.data.error);
            return response.data;
        },
        enabled: options?.enabled ?? true,
        ...queryDefaults,
    });
}

export type CreateChoreInput = {
    listId: string;
    name: string;
    repeat_interval_days: number;
    last_completed_at: number | null;
};

function clampLastCompleted(value: number | null): number | null {
    if (value == null) return null;
    const today = startOfToday();
    const day = startOfDay(value);
    return day > today ? today : day;
}

export function useCreateChore() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateChoreInput & { _id: string }) => {
            const response = await createChoreApi(data);
            if (response.data?.error) throw new Error(response.data.error);
            return response.data?.chore;
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: choresQueryKey });
            const previous = queryClient.getQueryData<GetChoresResponse>(choresQueryKey);
            const now = Date.now();
            const optimistic: Chore = {
                id: variables._id,
                listId: variables.listId,
                name: variables.name.trim(),
                repeat_interval_days: Math.max(1, variables.repeat_interval_days),
                last_completed_at: clampLastCompleted(variables.last_completed_at),
                created_at: now,
                updated_at: now,
            };
            queryClient.setQueryData<GetChoresResponse>(choresQueryKey, (old) => ({
                chores: [...(old?.chores ?? []), optimistic],
            }));
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(choresQueryKey, context.previous);
        },
        onSuccess: () => {},
        onSettled: () => {},
    });
}

type CreateChoreMutate = ReturnType<typeof useCreateChore>['mutate'];
type CreateChoreOptions = Parameters<CreateChoreMutate>[1];

export function useCreateChoreWithId() {
    const mutation = useCreateChore();
    return {
        ...mutation,
        mutate: (data: CreateChoreInput, options?: CreateChoreOptions) =>
            mutation.mutate({ ...data, _id: generateId() }, options),
        mutateAsync: (data: CreateChoreInput) =>
            mutation.mutateAsync({ ...data, _id: generateId() }),
    };
}

export type UpdateChoreInput = {
    choreId: string;
    name?: string;
    repeat_interval_days?: number;
    last_completed_at?: number | null;
};

export function useUpdateChore() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: UpdateChoreInput) => {
            const response = await updateChoreApi(data);
            if (response.data?.error) throw new Error(response.data.error);
            return response.data?.chore;
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: choresQueryKey });
            const previous = queryClient.getQueryData<GetChoresResponse>(choresQueryKey);
            queryClient.setQueryData<GetChoresResponse>(choresQueryKey, (old) => {
                if (!old?.chores) return old;
                const now = Date.now();
                return {
                    chores: old.chores.map((chore) => {
                        if (chore.id !== variables.choreId) return chore;
                        return {
                            ...chore,
                            name: variables.name?.trim() ?? chore.name,
                            repeat_interval_days:
                                variables.repeat_interval_days !== undefined
                                    ? Math.max(1, variables.repeat_interval_days)
                                    : chore.repeat_interval_days,
                            last_completed_at:
                                variables.last_completed_at !== undefined
                                    ? clampLastCompleted(variables.last_completed_at)
                                    : chore.last_completed_at,
                            updated_at: now,
                        };
                    }),
                };
            });
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(choresQueryKey, context.previous);
        },
        onSuccess: () => {},
        onSettled: () => {},
    });
}

export function useDeleteChore() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { choreId: string }) => {
            const response = await deleteChoreApi(data);
            if (response.data?.error) throw new Error(response.data.error);
            return data.choreId;
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: choresQueryKey });
            const previous = queryClient.getQueryData<GetChoresResponse>(choresQueryKey);
            queryClient.setQueryData<GetChoresResponse>(choresQueryKey, (old) => {
                if (!old?.chores) return old;
                return { chores: old.chores.filter((c) => c.id !== variables.choreId) };
            });
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(choresQueryKey, context.previous);
        },
        onSuccess: () => {},
        onSettled: () => {},
    });
}

export function useMarkChoreDone() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { choreId: string }) => {
            const response = await markChoreDoneApi(data);
            if (response.data?.error) throw new Error(response.data.error);
            return response.data?.chore;
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: choresQueryKey });
            const previous = queryClient.getQueryData<GetChoresResponse>(choresQueryKey);
            const today = startOfToday();
            queryClient.setQueryData<GetChoresResponse>(choresQueryKey, (old) => {
                if (!old?.chores) return old;
                return {
                    chores: old.chores.map((chore) =>
                        chore.id === variables.choreId
                            ? { ...chore, last_completed_at: today, updated_at: Date.now() }
                            : chore
                    ),
                };
            });
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(choresQueryKey, context.previous);
        },
        onSuccess: () => {},
        onSettled: () => {},
    });
}
