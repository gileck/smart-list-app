import { Collection, ObjectId } from 'mongodb';
import { getDb } from '../../../connection';
import { toQueryId } from '@/server/template/utils';
import type { ChoreDoc, ChoreDocCreate, ChoreDocUpdate } from './types';

const getCollection = async (): Promise<Collection<ChoreDoc>> => {
    const db = await getDb();
    return db.collection<ChoreDoc>('chores');
};

export const findChoresByUserId = async (
    userId: ObjectId | string
): Promise<ChoreDoc[]> => {
    const collection = await getCollection();
    const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
    return collection.find({ userId: userIdObj }).toArray();
};

export const findChoreById = async (
    choreId: ObjectId | string,
    userId: ObjectId | string
): Promise<ChoreDoc | null> => {
    const collection = await getCollection();
    const idQuery = typeof choreId === 'string' ? toQueryId(choreId) : choreId;
    const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
    return collection.findOne({ _id: idQuery, userId: userIdObj } as Parameters<
        typeof collection.findOne
    >[0]);
};

export const createChore = async (chore: ChoreDocCreate): Promise<ChoreDoc> => {
    const collection = await getCollection();
    const doc = { ...chore, _id: chore._id ?? new ObjectId() } as ChoreDoc;
    const result = await collection.insertOne(doc);
    if (!result.insertedId) {
        throw new Error('Failed to create chore');
    }
    return doc;
};

export const updateChore = async (
    choreId: ObjectId | string,
    userId: ObjectId | string,
    update: ChoreDocUpdate
): Promise<ChoreDoc | null> => {
    const collection = await getCollection();
    const idQuery = typeof choreId === 'string' ? toQueryId(choreId) : choreId;
    const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const result = await collection.findOneAndUpdate(
        { _id: idQuery, userId: userIdObj } as Parameters<typeof collection.findOneAndUpdate>[0],
        { $set: update },
        { returnDocument: 'after' }
    );
    return result || null;
};

export const deleteChore = async (
    choreId: ObjectId | string,
    userId: ObjectId | string
): Promise<boolean> => {
    const collection = await getCollection();
    const idQuery = typeof choreId === 'string' ? toQueryId(choreId) : choreId;
    const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const result = await collection.deleteOne({
        _id: idQuery,
        userId: userIdObj,
    } as Parameters<typeof collection.deleteOne>[0]);
    return result.deletedCount === 1;
};

export const deleteChoresByListId = async (
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
