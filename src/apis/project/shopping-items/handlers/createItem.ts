import { ObjectId } from 'mongodb';
import { toDocumentId, toQueryId } from '@/server/template/utils';
import { shoppingItems, smartLists } from '@/server/database';
import {
    API_CREATE_ITEM,
    type ApiHandlerContext,
    type CreateItemRequest,
    type CreateItemResponse,
} from '..';
import { normalizeEmoji, normalizePresets, startOfToday, toItemClient } from '../shared';

export const createItem = async (
    request: CreateItemRequest,
    context: ApiHandlerContext
): Promise<CreateItemResponse> => {
    try {
        if (!context.userId) return { error: 'Not authenticated' };
        if (!request.listId) return { error: 'listId is required' };
        const name = request.name?.trim();
        if (!name) return { error: 'Name is required' };
        const userId = toQueryId(context.userId) as ObjectId;

        const list = await smartLists.findListById(request.listId, userId);
        if (!list) return { error: 'List not found' };

        if (request._id) {
            const existing = await shoppingItems.findItemById(request._id, userId);
            if (existing) {
                return { item: toItemClient(existing) };
            }
        }

        const now = new Date();
        const created = await shoppingItems.createItem({
            _id: request._id ? toDocumentId(request._id) : new ObjectId(),
            userId,
            listId: list._id,
            name,
            emoji: normalizeEmoji(request.emoji),
            quantityLeft: Math.max(0, request.quantity_left),
            consumptionPerDay: Math.max(0, request.consumption_per_day),
            restockPresets: normalizePresets(request.restock_presets),
            lastConsumptionAt: startOfToday(),
            createdAt: now,
            updatedAt: now,
        });
        return { item: toItemClient(created) };
    } catch (error) {
        console.error('createItem error', error);
        return { error: error instanceof Error ? error.message : 'Failed to create item' };
    }
};

export { API_CREATE_ITEM };
