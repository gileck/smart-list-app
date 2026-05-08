import { Collection, ObjectId } from 'mongodb';
import { getDb } from '../../../connection';
import { toQueryId } from '@/server/template/utils';
import type { RestockEventCreate, RestockEventDoc } from './types';

const getCollection = async (): Promise<Collection<RestockEventDoc>> => {
    const db = await getDb();
    return db.collection<RestockEventDoc>('restock_events');
};

export const findByItemId = async (
    itemId: ObjectId | string,
    userId: ObjectId | string,
    limit = 50
): Promise<RestockEventDoc[]> => {
    const collection = await getCollection();
    const itemIdQuery = typeof itemId === 'string' ? toQueryId(itemId) : itemId;
    const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
    return collection
        .find({ itemId: itemIdQuery, userId: userIdObj } as Parameters<
            typeof collection.find
        >[0])
        .sort({ restockedAt: -1 })
        .limit(limit)
        .toArray();
};

export const create = async (event: RestockEventCreate): Promise<RestockEventDoc> => {
    const collection = await getCollection();
    const doc = { ...event, _id: event._id ?? new ObjectId() } as RestockEventDoc;
    const result = await collection.insertOne(doc);
    if (!result.insertedId) {
        throw new Error('Failed to create restock event');
    }
    return doc;
};

export const deleteByItemId = async (
    itemId: ObjectId | string,
    userId: ObjectId | string
): Promise<number> => {
    const collection = await getCollection();
    const itemIdQuery = typeof itemId === 'string' ? toQueryId(itemId) : itemId;
    const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const result = await collection.deleteMany({
        itemId: itemIdQuery,
        userId: userIdObj,
    } as Parameters<typeof collection.deleteMany>[0]);
    return result.deletedCount;
};

export const deleteByListId = async (
    listId: ObjectId | string,
    userId: ObjectId | string
): Promise<number> => {
    const collection = await getCollection();
    const listIdQuery = typeof listId === 'string' ? toQueryId(listId) : listId;
    const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const result = await collection.deleteMany({
        listId: listIdQuery,
        userId: userIdObj,
    } as Parameters<typeof collection.deleteMany>[0]);
    return result.deletedCount;
};
