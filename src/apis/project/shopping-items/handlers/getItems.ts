import { ObjectId } from 'mongodb';
import { toQueryId } from '@/server/template/utils';
import { shoppingItems } from '@/server/database';
import {
    API_GET_ITEMS,
    type ApiHandlerContext,
    type GetItemsRequest,
    type GetItemsResponse,
} from '..';
import { MS_PER_DAY, startOfDay, startOfToday, toItemClient } from '../shared';

export const getItems = async (
    _request: GetItemsRequest,
    context: ApiHandlerContext
): Promise<GetItemsResponse> => {
    try {
        if (!context.userId) return { error: 'Not authenticated' };
        const userId = toQueryId(context.userId) as ObjectId;
        const docs = await shoppingItems.findItemsByUserId(userId);

        const today = startOfToday();
        const updates: Promise<unknown>[] = [];

        const settled = docs.map((doc) => {
            if (doc.consumptionPerDay <= 0) return doc;
            // Defensive: legacy docs may lack lastConsumptionAt; treat as "ticked today".
            const last = startOfDay(doc.lastConsumptionAt ?? today);
            const daysPassed = Math.floor((today.getTime() - last.getTime()) / MS_PER_DAY);
            if (daysPassed < 1) {
                if (!doc.lastConsumptionAt) {
                    updates.push(
                        shoppingItems.updateItem(doc._id, userId, {
                            lastConsumptionAt: today,
                            updatedAt: new Date(),
                        })
                    );
                    return { ...doc, lastConsumptionAt: today };
                }
                return doc;
            }

            const nextLeft = Math.max(0, doc.quantityLeft - doc.consumptionPerDay * daysPassed);
            const nextLastConsumption = new Date(last.getTime() + daysPassed * MS_PER_DAY);
            updates.push(
                shoppingItems.updateItem(doc._id, userId, {
                    quantityLeft: nextLeft,
                    lastConsumptionAt: nextLastConsumption,
                    updatedAt: new Date(),
                })
            );
            return {
                ...doc,
                quantityLeft: nextLeft,
                lastConsumptionAt: nextLastConsumption,
            };
        });

        if (updates.length > 0) await Promise.all(updates);

        return { items: settled.map(toItemClient) };
    } catch (error) {
        console.error('getItems error', error);
        return { error: error instanceof Error ? error.message : 'Failed to load items' };
    }
};

export { API_GET_ITEMS };
