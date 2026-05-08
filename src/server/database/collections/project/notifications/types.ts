import type { ObjectId } from 'mongodb';

export type NotificationFrequency = 'daily' | 'weekly';

export type NotificationFilterType = 'shopping_below_days' | 'chore_due_within';

export type NotificationChannel = 'push' | 'telegram';

export interface NotificationSchedule {
    frequency: NotificationFrequency;
    /** Whole hour 0..23 in the user's timezone. */
    hourOfDay: number;
    /** IANA tz, e.g. 'Europe/Jerusalem'. */
    timezone: string;
    /** Required for weekly; 0 = Sunday … 6 = Saturday. */
    daysOfWeek?: number[];
}

export interface NotificationFilter {
    type: NotificationFilterType;
    daysThreshold: number;
}

export interface NotificationConfigDoc {
    _id: ObjectId | string;
    userId: ObjectId;
    listId: ObjectId | string;
    name?: string;
    schedule: NotificationSchedule;
    filter: NotificationFilter;
    channels: NotificationChannel[];
    enabled: boolean;
    lastSentAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export type NotificationConfigCreate = Omit<NotificationConfigDoc, '_id'> & {
    _id?: ObjectId | string;
};

export type NotificationConfigUpdate = Partial<
    Omit<NotificationConfigDoc, '_id' | 'userId' | 'listId' | 'createdAt'>
> & {
    updatedAt: Date;
};

export interface NotificationConfigClient {
    id: string;
    listId: string;
    name?: string;
    schedule: NotificationSchedule;
    filter: NotificationFilter;
    channels: NotificationChannel[];
    enabled: boolean;
    last_sent_at: number | null;
    created_at: number;
    updated_at: number;
}
