import type { ObjectId } from 'mongodb';

export interface ShoppingItemDoc {
    _id: ObjectId | string;
    userId: ObjectId;
    listId: ObjectId | string;
    name: string;
    emoji?: string;
    quantityLeft: number;
    consumptionPerDay: number;
    restockPresets?: number[];
    /** Start-of-day timestamp of the last consumption tick. */
    lastConsumptionAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type ShoppingItemDocCreate = Omit<ShoppingItemDoc, '_id'> & {
    _id?: ObjectId | string;
};

export type ShoppingItemDocUpdate = Partial<
    Omit<ShoppingItemDoc, '_id' | 'userId' | 'listId' | 'createdAt'>
> & {
    updatedAt: Date;
};

export interface ShoppingItemClient {
    id: string;
    listId: string;
    name: string;
    emoji?: string;
    quantity_left: number;
    consumption_per_day: number;
    restock_presets?: number[];
    created_at: number;
    updated_at: number;
}
