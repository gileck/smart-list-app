import type { ObjectId } from 'mongodb';

export type ListTypeId = 'shopping' | 'chore';

export interface ListDoc {
    _id: ObjectId | string;
    userId: ObjectId;
    name: string;
    type: ListTypeId;
    createdAt: Date;
    updatedAt: Date;
}

export type ListDocCreate = Omit<ListDoc, '_id'> & { _id?: ObjectId | string };

export type ListDocUpdate = Partial<Omit<ListDoc, '_id' | 'userId' | 'type' | 'createdAt'>> & {
    updatedAt: Date;
};

export interface ListClient {
    id: string;
    name: string;
    type: ListTypeId;
    created_at: number;
    updated_at: number;
}
