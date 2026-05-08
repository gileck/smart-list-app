import { toQueryId, toStringId } from '@/server/template/utils';
import { ObjectId } from 'mongodb';
import { smartLists } from '@/server/database';
import {
    API_UPDATE_LIST,
    type ApiHandlerContext,
    type UpdateListRequest,
    type UpdateListResponse,
} from '..';

export const updateList = async (
    request: UpdateListRequest,
    context: ApiHandlerContext
): Promise<UpdateListResponse> => {
    try {
        if (!context.userId) return { error: 'Not authenticated' };
        if (!request.listId) return { error: 'listId is required' };
        const name = request.name?.trim();
        if (!name) return { error: 'Name is required' };
        const userId = toQueryId(context.userId) as ObjectId;

        const updated = await smartLists.updateList(request.listId, userId, {
            name,
            updatedAt: new Date(),
        });
        if (!updated) return { error: 'List not found' };
        return {
            list: {
                id: toStringId(updated._id),
                name: updated.name,
                type: updated.type,
                created_at: updated.createdAt.getTime(),
                updated_at: updated.updatedAt.getTime(),
            },
        };
    } catch (error) {
        console.error('updateList error', error);
        return { error: error instanceof Error ? error.message : 'Failed to update list' };
    }
};

export { API_UPDATE_LIST };
