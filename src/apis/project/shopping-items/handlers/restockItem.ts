import { ObjectId } from 'mongodb';
import { toQueryId } from '@/server/template/utils';
import { restockEvents, shoppingItems } from '@/server/database';
import {
    API_RESTOCK_ITEM,
    type ApiHandlerContext,
    type RestockItemRequest,
    type RestockItemResponse,
} from '..';
import { startOfToday, toItemClient } from '../shared';

export const restockItem = async (
    request: RestockItemRequest,
    context: ApiHandlerContext
): Promise<RestockItemResponse> => {
    try {
        if (!context.userId) return { error: 'Not authenticated' };
        if (!request.itemId) return { error: 'itemId is required' };
        if (!Number.isFinite(request.amount) || request.amount <= 0) {
            return { error: 'amount must be a positive number' };
        }
        const userId = toQueryId(context.userId) as ObjectId;

        const existing = await shoppingItems.findItemById(request.itemId, userId);
        if (!existing) return { error: 'Item not found' };

        const now = new Date();
        const quantityLeftBefore = Math.max(0, existing.quantityLeft);
        const updated = await shoppingItems.updateItem(request.itemId, userId, {
            quantityLeft: quantityLeftBefore + request.amount,
            lastConsumptionAt: startOfToday(),
            updatedAt: now,
        });
        if (!updated) return { error: 'Item not found' };

        // Record the event so the user can later see real-vs-expected usage.
        await restockEvents.create({
            userId,
            itemId: existing._id,
            listId: existing.listId,
            amount: request.amount,
            quantityLeftBefore,
            restockedAt: now,
        });

        return { item: toItemClient(updated) };
    } catch (error) {
        console.error('restockItem error', error);
        return { error: error instanceof Error ? error.message : 'Failed to restock item' };
    }
};

export { API_RESTOCK_ITEM };
