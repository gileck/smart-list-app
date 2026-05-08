import { Collection, ObjectId } from 'mongodb';
import { getDb } from '../../../connection';
import { toQueryId } from '@/server/template/utils';
import type {
    ShoppingItemDoc,
    ShoppingItemDocCreate,
    ShoppingItemDocUpdate,
} from './types';

const getCollection = async (): Promise<Collection<ShoppingItemDoc>> => {
    const db = await getDb();
    return db.collection<ShoppingItemDoc>('shopping_items');
};

export const findItemsByUserId = async (
    userId: ObjectId | string
): Promise<ShoppingItemDoc[]> => {
    const collection = await getCollection();
    const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
    return collection.find({ userId: userIdObj }).toArray();
};

export const findItemById = async (
    itemId: ObjectId | string,
    userId: ObjectId | string
): Promise<ShoppingItemDoc | null> => {
    const collection = await getCollection();
    const idQuery = typeof itemId === 'string' ? toQueryId(itemId) : itemId;
    const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
    return collection.findOne({ _id: idQuery, userId: userIdObj } as Parameters<
        typeof collection.findOne
    >[0]);
};

export const createItem = async (
    item: ShoppingItemDocCreate
): Promise<ShoppingItemDoc> => {
    const collection = await getCollection();
    const doc = { ...item, _id: item._id ?? new ObjectId() } as ShoppingItemDoc;
    const result = await collection.insertOne(doc);
    if (!result.insertedId) {
        throw new Error('Failed to create shopping item');
    }
    return doc;
};

export const updateItem = async (
    itemId: ObjectId | string,
    userId: ObjectId | string,
    update: ShoppingItemDocUpdate
): Promise<ShoppingItemDoc | null> => {
    const collection = await getCollection();
    const idQuery = typeof itemId === 'string' ? toQueryId(itemId) : itemId;
    const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const result = await collection.findOneAndUpdate(
        { _id: idQuery, userId: userIdObj } as Parameters<typeof collection.findOneAndUpdate>[0],
        { $set: update },
        { returnDocument: 'after' }
    );
    return result || null;
};

export const deleteItem = async (
    itemId: ObjectId | string,
    userId: ObjectId | string
): Promise<boolean> => {
    const collection = await getCollection();
    const idQuery = typeof itemId === 'string' ? toQueryId(itemId) : itemId;
    const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const result = await collection.deleteOne({
        _id: idQuery,
        userId: userIdObj,
    } as Parameters<typeof collection.deleteOne>[0]);
    return result.deletedCount === 1;
};

export const deleteItemsByListId = async (
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
