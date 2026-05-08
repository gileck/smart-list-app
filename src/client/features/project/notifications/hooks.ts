import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createNotification as createNotificationApi,
    deleteNotification as deleteNotificationApi,
    getAvailableChannels,
    getNotifications,
    sendNotificationNow as sendNotificationNowApi,
    updateNotification as updateNotificationApi,
} from '@/apis/project/notifications/client';
import type {
    CreateNotificationRequest,
    GetAvailableChannelsResponse,
    GetNotificationsResponse,
    UpdateNotificationRequest,
} from '@/apis/project/notifications/types';
import { useQueryDefaults } from '@/client/query/defaults';
import { generateId } from '@/client/utils/id';
import type { NotificationConfigClient } from '@/server/database/collections/project/notifications/types';

export const notificationsQueryKey = ['notifications'] as const;
export const channelsQueryKey = ['notifications', 'available-channels'] as const;

export function useNotifications(options?: { enabled?: boolean }) {
    const queryDefaults = useQueryDefaults();
    return useQuery({
        queryKey: notificationsQueryKey,
        queryFn: async (): Promise<GetNotificationsResponse> => {
            const response = await getNotifications({});
            if (response.data?.error) throw new Error(response.data.error);
            return response.data;
        },
        enabled: options?.enabled ?? true,
        ...queryDefaults,
    });
}

export function useAvailableChannels() {
    const queryDefaults = useQueryDefaults();
    return useQuery({
        queryKey: channelsQueryKey,
        queryFn: async (): Promise<GetAvailableChannelsResponse> => {
            const response = await getAvailableChannels({});
            if (response.data?.error) throw new Error(response.data.error);
            return response.data;
        },
        ...queryDefaults,
    });
}

export type CreateNotificationInput = Omit<CreateNotificationRequest, '_id'>;

export function useCreateNotification() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateNotificationInput & { _id: string }) => {
            const response = await createNotificationApi(data);
            if (response.data?.error) throw new Error(response.data.error);
            return response.data?.notification;
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: notificationsQueryKey });
            const previous = queryClient.getQueryData<GetNotificationsResponse>(
                notificationsQueryKey
            );
            const now = Date.now();
            const optimistic: NotificationConfigClient = {
                id: variables._id,
                listId: variables.listId,
                name: variables.name,
                schedule: variables.schedule,
                filter: variables.filter,
                channels: variables.channels,
                enabled: variables.enabled,
                last_sent_at: null,
                created_at: now,
                updated_at: now,
            };
            queryClient.setQueryData<GetNotificationsResponse>(
                notificationsQueryKey,
                (old) => ({
                    notifications: [...(old?.notifications ?? []), optimistic],
                })
            );
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous)
                queryClient.setQueryData(notificationsQueryKey, context.previous);
        },
        onSuccess: () => {},
        onSettled: () => {},
    });
}

type CreateMutate = ReturnType<typeof useCreateNotification>['mutate'];
type CreateOptions = Parameters<CreateMutate>[1];

export function useCreateNotificationWithId() {
    const mutation = useCreateNotification();
    return {
        ...mutation,
        mutate: (data: CreateNotificationInput, options?: CreateOptions) =>
            mutation.mutate({ ...data, _id: generateId() }, options),
        mutateAsync: (data: CreateNotificationInput) =>
            mutation.mutateAsync({ ...data, _id: generateId() }),
    };
}

export function useUpdateNotification() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: UpdateNotificationRequest) => {
            const response = await updateNotificationApi(data);
            if (response.data?.error) throw new Error(response.data.error);
            return response.data?.notification;
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: notificationsQueryKey });
            const previous = queryClient.getQueryData<GetNotificationsResponse>(
                notificationsQueryKey
            );
            queryClient.setQueryData<GetNotificationsResponse>(
                notificationsQueryKey,
                (old) => {
                    if (!old?.notifications) return old;
                    const now = Date.now();
                    return {
                        notifications: old.notifications.map((n) => {
                            if (n.id !== variables.notificationId) return n;
                            return {
                                ...n,
                                name: variables.name ?? n.name,
                                schedule: variables.schedule ?? n.schedule,
                                filter: variables.filter ?? n.filter,
                                channels: variables.channels ?? n.channels,
                                enabled:
                                    variables.enabled !== undefined
                                        ? variables.enabled
                                        : n.enabled,
                                updated_at: now,
                            };
                        }),
                    };
                }
            );
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous)
                queryClient.setQueryData(notificationsQueryKey, context.previous);
        },
        onSuccess: () => {},
        onSettled: () => {},
    });
}

export function useDeleteNotification() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { notificationId: string }) => {
            const response = await deleteNotificationApi(data);
            if (response.data?.error) throw new Error(response.data.error);
            return data.notificationId;
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: notificationsQueryKey });
            const previous = queryClient.getQueryData<GetNotificationsResponse>(
                notificationsQueryKey
            );
            queryClient.setQueryData<GetNotificationsResponse>(
                notificationsQueryKey,
                (old) => {
                    if (!old?.notifications) return old;
                    return {
                        notifications: old.notifications.filter(
                            (n) => n.id !== variables.notificationId
                        ),
                    };
                }
            );
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous)
                queryClient.setQueryData(notificationsQueryKey, context.previous);
        },
        onSuccess: () => {},
        onSettled: () => {},
    });
}

export function useSendNotificationNow() {
    return useMutation({
        mutationFn: async (data: { notificationId: string }) => {
            const response = await sendNotificationNowApi(data);
            if (response.data?.error) throw new Error(response.data.error);
            return response.data;
        },
    });
}
