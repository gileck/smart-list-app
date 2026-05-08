import { ObjectId } from 'mongodb';
import { toQueryId } from '@/server/template/utils';
import { restockEvents, shoppingItems } from '@/server/database';
import {
    API_DELETE_ITEM,
    type ApiHandlerContext,
    type DeleteItemRequest,
    type DeleteItemResponse,
} from '..';

export const deleteItem = async (
    request: DeleteItemRequest,
    context: ApiHandlerContext
): Promise<DeleteItemResponse> => {
    try {
        if (!context.userId) return { error: 'Not authenticated' };
        if (!request.itemId) return { error: 'itemId is required' };
        const userId = toQueryId(context.userId) as ObjectId;
        const ok = await shoppingItems.deleteItem(request.itemId, userId);
        if (!ok) return { error: 'Item not found' };
        await restockEvents.deleteByItemId(request.itemId, userId);
        return { success: true };
    } catch (error) {
        console.error('deleteItem error', error);
        return { error: error instanceof Error ? error.message : 'Failed to delete item' };
    }
};

export { API_DELETE_ITEM };
