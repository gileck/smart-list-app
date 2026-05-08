import { ObjectId } from 'mongodb';
import { toQueryId } from '@/server/template/utils';
import { smartLists, shoppingItems, chores } from '@/server/database';
import {
    API_DELETE_LIST,
    type ApiHandlerContext,
    type DeleteListRequest,
    type DeleteListResponse,
} from '..';

export const deleteList = async (
    request: DeleteListRequest,
    context: ApiHandlerContext
): Promise<DeleteListResponse> => {
    try {
        if (!context.userId) return { error: 'Not authenticated' };
        if (!request.listId) return { error: 'listId is required' };
        const userId = toQueryId(context.userId) as ObjectId;

        await Promise.all([
            shoppingItems.deleteItemsByListId(request.listId, userId),
            chores.deleteChoresByListId(request.listId, userId),
        ]);
        const ok = await smartLists.deleteList(request.listId, userId);
        if (!ok) return { error: 'List not found' };
        return { success: true };
    } catch (error) {
        console.error('deleteList error', error);
        return { error: error instanceof Error ? error.message : 'Failed to delete list' };
    }
};

export { API_DELETE_LIST };
