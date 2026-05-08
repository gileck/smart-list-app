import type {
    NotificationChannel,
    NotificationConfigClient,
    NotificationFilter,
    NotificationSchedule,
} from '@/server/database/collections/project/notifications/types';

export interface GetNotificationsRequest {
    _?: never;
}
export interface GetNotificationsResponse {
    notifications?: NotificationConfigClient[];
    error?: string;
}

export interface CreateNotificationRequest {
    _id?: string;
    listId: string;
    name?: string;
    schedule: NotificationSchedule;
    filter: NotificationFilter;
    channels: NotificationChannel[];
    enabled: boolean;
}
export interface CreateNotificationResponse {
    notification?: NotificationConfigClient;
    error?: string;
}

export interface UpdateNotificationRequest {
    notificationId: string;
    name?: string;
    schedule?: NotificationSchedule;
    filter?: NotificationFilter;
    channels?: NotificationChannel[];
    enabled?: boolean;
}
export interface UpdateNotificationResponse {
    notification?: NotificationConfigClient;
    error?: string;
}

export interface DeleteNotificationRequest {
    notificationId: string;
}
export interface DeleteNotificationResponse {
    success?: boolean;
    error?: string;
}

export interface SendNotificationNowRequest {
    notificationId: string;
}
export interface SendNotificationNowResponse {
    sent?: boolean;
    /** Preview of the body that was (or would be) sent. */
    message?: string;
    /** Channels actually attempted. */
    channels?: NotificationChannel[];
    error?: string;
}

/** Send a test using inline (unsaved) form values — no persistence. */
export interface SendNotificationTestRequest {
    listId: string;
    filter: NotificationFilter;
    channels: NotificationChannel[];
}
export interface SendNotificationTestResponse {
    sent?: boolean;
    message?: string;
    channels?: NotificationChannel[];
    error?: string;
}

export interface GetAvailableChannelsRequest {
    _?: never;
}
export interface GetAvailableChannelsResponse {
    push?: boolean;
    telegram?: boolean;
    error?: string;
}

export interface ApiHandlerContext {
    userId?: string;
}
