import { Collection, ObjectId } from 'mongodb';
import { getDb } from '../../../connection';
import { toQueryId } from '@/server/template/utils';
import type {
    NotificationConfigCreate,
    NotificationConfigDoc,
    NotificationConfigUpdate,
} from './types';

const getCollection = async (): Promise<Collection<NotificationConfigDoc>> => {
    const db = await getDb();
    return db.collection<NotificationConfigDoc>('notification_configs');
};

export const findByUserId = async (
    userId: ObjectId | string
): Promise<NotificationConfigDoc[]> => {
    const collection = await getCollection();
    const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
    return collection.find({ userId: userIdObj }).sort({ createdAt: 1 }).toArray();
};

export const findById = async (
    id: ObjectId | string,
    userId: ObjectId | string
): Promise<NotificationConfigDoc | null> => {
    const collection = await getCollection();
    const idQuery = typeof id === 'string' ? toQueryId(id) : id;
    const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
    return collection.findOne({ _id: idQuery, userId: userIdObj } as Parameters<
        typeof collection.findOne
    >[0]);
};

export const findEnabled = async (): Promise<NotificationConfigDoc[]> => {
    const collection = await getCollection();
    return collection.find({ enabled: true }).toArray();
};

export const create = async (
    config: NotificationConfigCreate
): Promise<NotificationConfigDoc> => {
    const collection = await getCollection();
    const doc = { ...config, _id: config._id ?? new ObjectId() } as NotificationConfigDoc;
    const result = await collection.insertOne(doc);
    if (!result.insertedId) {
        throw new Error('Failed to create notification config');
    }
    return doc;
};

export const update = async (
    id: ObjectId | string,
    userId: ObjectId | string,
    updates: NotificationConfigUpdate
): Promise<NotificationConfigDoc | null> => {
    const collection = await getCollection();
    const idQuery = typeof id === 'string' ? toQueryId(id) : id;
    const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const result = await collection.findOneAndUpdate(
        { _id: idQuery, userId: userIdObj } as Parameters<typeof collection.findOneAndUpdate>[0],
        { $set: updates },
        { returnDocument: 'after' }
    );
    return result || null;
};

export const updateLastSent = async (
    id: ObjectId | string,
    sentAt: Date
): Promise<void> => {
    const collection = await getCollection();
    const idQuery = typeof id === 'string' ? toQueryId(id) : id;
    await collection.updateOne(
        { _id: idQuery } as Parameters<typeof collection.updateOne>[0],
        { $set: { lastSentAt: sentAt, updatedAt: new Date() } }
    );
};

export const remove = async (
    id: ObjectId | string,
    userId: ObjectId | string
): Promise<boolean> => {
    const collection = await getCollection();
    const idQuery = typeof id === 'string' ? toQueryId(id) : id;
    const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const result = await collection.deleteOne({
        _id: idQuery,
        userId: userIdObj,
    } as Parameters<typeof collection.deleteOne>[0]);
    return result.deletedCount === 1;
};

export const removeByListId = async (
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
