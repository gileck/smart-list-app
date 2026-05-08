import { Collection, ObjectId } from 'mongodb';
import { getDb } from '../../../connection';
import { toQueryId } from '@/server/template/utils';
import type { ListDoc, ListDocCreate, ListDocUpdate } from './types';

const getCollection = async (): Promise<Collection<ListDoc>> => {
    const db = await getDb();
    return db.collection<ListDoc>('smart_lists');
};

export const findListsByUserId = async (userId: ObjectId | string): Promise<ListDoc[]> => {
    const collection = await getCollection();
    const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
    return collection.find({ userId: userIdObj }).sort({ createdAt: 1 }).toArray();
};

export const findListById = async (
    listId: ObjectId | string,
    userId: ObjectId | string
): Promise<ListDoc | null> => {
    const collection = await getCollection();
    const listIdQuery = typeof listId === 'string' ? toQueryId(listId) : listId;
    const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
    return collection.findOne({ _id: listIdQuery, userId: userIdObj } as Parameters<
        typeof collection.findOne
    >[0]);
};

export const createList = async (list: ListDocCreate): Promise<ListDoc> => {
    const collection = await getCollection();
    const doc = { ...list, _id: list._id ?? new ObjectId() } as ListDoc;
    const result = await collection.insertOne(doc);
    if (!result.insertedId) {
        throw new Error('Failed to create list');
    }
    return doc;
};

export const updateList = async (
    listId: ObjectId | string,
    userId: ObjectId | string,
    update: ListDocUpdate
): Promise<ListDoc | null> => {
    const collection = await getCollection();
    const listIdQuery = typeof listId === 'string' ? toQueryId(listId) : listId;
    const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const result = await collection.findOneAndUpdate(
        { _id: listIdQuery, userId: userIdObj } as Parameters<typeof collection.findOneAndUpdate>[0],
        { $set: update },
        { returnDocument: 'after' }
    );
    return result || null;
};

export const deleteList = async (
    listId: ObjectId | string,
    userId: ObjectId | string
): Promise<boolean> => {
    const collection = await getCollection();
    const listIdQuery = typeof listId === 'string' ? toQueryId(listId) : listId;
    const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const result = await collection.deleteOne({
        _id: listIdQuery,
        userId: userIdObj,
    } as Parameters<typeof collection.deleteOne>[0]);
    return result.deletedCount === 1;
};
