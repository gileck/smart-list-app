import { ObjectId } from 'mongodb';
import { toQueryId } from '@/server/template/utils';
import { chores } from '@/server/database';
import {
    API_MARK_CHORE_DONE,
    type ApiHandlerContext,
    type MarkChoreDoneRequest,
    type MarkChoreDoneResponse,
} from '..';
import { startOfToday, toChoreClient } from '../shared';

export const markChoreDone = async (
    request: MarkChoreDoneRequest,
    context: ApiHandlerContext
): Promise<MarkChoreDoneResponse> => {
    try {
        if (!context.userId) return { error: 'Not authenticated' };
        if (!request.choreId) return { error: 'choreId is required' };
        const userId = toQueryId(context.userId) as ObjectId;
        const updated = await chores.updateChore(request.choreId, userId, {
            lastCompletedAt: startOfToday(),
            updatedAt: new Date(),
        });
        if (!updated) return { error: 'Chore not found' };
        return { chore: toChoreClient(updated) };
    } catch (error) {
        console.error('markChoreDone error', error);
        return { error: error instanceof Error ? error.message : 'Failed to mark chore done' };
    }
};

export { API_MARK_CHORE_DONE };
