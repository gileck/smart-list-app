import type { ObjectId } from 'mongodb';

export interface ChoreDoc {
    _id: ObjectId | string;
    userId: ObjectId;
    listId: ObjectId | string;
    name: string;
    repeatIntervalDays: number;
    /** Start-of-day timestamp; null = never completed. */
    lastCompletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export type ChoreDocCreate = Omit<ChoreDoc, '_id'> & {
    _id?: ObjectId | string;
};

export type ChoreDocUpdate = Partial<
    Omit<ChoreDoc, '_id' | 'userId' | 'listId' | 'createdAt'>
> & {
    updatedAt: Date;
};

export interface ChoreClient {
    id: string;
    listId: string;
    name: string;
    repeat_interval_days: number;
    last_completed_at: number | null;
    created_at: number;
    updated_at: number;
}
