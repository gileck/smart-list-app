import type { ObjectId } from 'mongodb';

export interface RestockEventDoc {
    _id: ObjectId | string;
    userId: ObjectId;
    itemId: ObjectId | string;
    listId: ObjectId | string;
    amount: number;
    /** Quantity-left at the moment of restock, before the amount was added.
     *  Useful to compute "what was left when you restocked". */
    quantityLeftBefore?: number;
    restockedAt: Date;
}

export type RestockEventCreate = Omit<RestockEventDoc, '_id'> & {
    _id?: ObjectId | string;
};

export interface RestockEventClient {
    id: string;
    itemId: string;
    listId: string;
    amount: number;
    quantity_left_before?: number;
    restocked_at: number;
}
