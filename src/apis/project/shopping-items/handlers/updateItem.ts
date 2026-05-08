import { ObjectId } from 'mongodb';
import { toQueryId } from '@/server/template/utils';
import { shoppingItems } from '@/server/database';
import {
    API_UPDATE_ITEM,
    type ApiHandlerContext,
    type UpdateItemRequest,
    type UpdateItemResponse,
} from '..';
import {
    normalizeEmoji,
    normalizePresets,
    startOfToday,
    toItemClient,
} from '../shared';
import type { ShoppingItemDocUpdate } from '@/server/database/collections/project/shopping-items/types';

export const updateItem = async (
    request: UpdateItemRequest,
    context: ApiHandlerContext
): Promise<UpdateItemResponse> => {
    try {
        if (!context.userId) return { error: 'Not authenticated' };
        if (!request.itemId) return { error: 'itemId is required' };
        const userId = toQueryId(context.userId) as ObjectId;

        const update: ShoppingItemDocUpdate = { updatedAt: new Date() };
        if (request.name !== undefined) {
            const trimmed = request.name.trim();
            if (!trimmed) return { error: 'Name cannot be empty' };
            update.name = trimmed;
        }
        if (request.emoji !== undefined) {
            update.emoji = normalizeEmoji(request.emoji);
        }
        if (request.quantity_left !== undefined) {
            if (Number.isNaN(request.quantity_left) || request.quantity_left < 0) {
                return { error: 'quantity_left must be non-negative' };
            }
            update.quantityLeft = request.quantity_left;
            update.lastConsumptionAt = startOfToday();
        }
        if (request.consumption_per_day !== undefined) {
            update.consumptionPerDay = Math.max(0, request.consumption_per_day);
        }
        if (request.restock_presets !== undefined) {
            update.restockPresets = normalizePresets(request.restock_presets);
        }

        const updated = await shoppingItems.updateItem(request.itemId, userId, update);
        if (!updated) return { error: 'Item not found' };
        return { item: toItemClient(updated) };
    } catch (error) {
        console.error('updateItem error', error);
        return { error: error instanceof Error ? error.message : 'Failed to update item' };
    }
};

export { API_UPDATE_ITEM };
