import { ObjectId } from 'mongodb';
import { toQueryId } from '@/server/template/utils';
import { chores } from '@/server/database';
import {
    API_DELETE_CHORE,
    type ApiHandlerContext,
    type DeleteChoreRequest,
    type DeleteChoreResponse,
} from '..';

export const deleteChore = async (
    request: DeleteChoreRequest,
    context: ApiHandlerContext
): Promise<DeleteChoreResponse> => {
    try {
        if (!context.userId) return { error: 'Not authenticated' };
        if (!request.choreId) return { error: 'choreId is required' };
        const userId = toQueryId(context.userId) as ObjectId;
        const ok = await chores.deleteChore(request.choreId, userId);
        if (!ok) return { error: 'Chore not found' };
        return { success: true };
    } catch (error) {
        console.error('deleteChore error', error);
        return { error: error instanceof Error ? error.message : 'Failed to delete chore' };
    }
};

export { API_DELETE_CHORE };
