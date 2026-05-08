import { ObjectId } from 'mongodb';
import { toQueryId } from '@/server/template/utils';
import { chores } from '@/server/database';
import {
    API_UPDATE_CHORE,
    type ApiHandlerContext,
    type UpdateChoreRequest,
    type UpdateChoreResponse,
} from '..';
import { clampLastCompleted, toChoreClient } from '../shared';
import type { ChoreDocUpdate } from '@/server/database/collections/project/chores/types';

export const updateChore = async (
    request: UpdateChoreRequest,
    context: ApiHandlerContext
): Promise<UpdateChoreResponse> => {
    try {
        if (!context.userId) return { error: 'Not authenticated' };
        if (!request.choreId) return { error: 'choreId is required' };
        const userId = toQueryId(context.userId) as ObjectId;

        const update: ChoreDocUpdate = { updatedAt: new Date() };
        if (request.name !== undefined) {
            const trimmed = request.name.trim();
            if (!trimmed) return { error: 'Name cannot be empty' };
            update.name = trimmed;
        }
        if (request.repeat_interval_days !== undefined) {
            update.repeatIntervalDays = Math.max(1, request.repeat_interval_days);
        }
        if (request.last_completed_at !== undefined) {
            update.lastCompletedAt = clampLastCompleted(request.last_completed_at);
        }

        const updated = await chores.updateChore(request.choreId, userId, update);
        if (!updated) return { error: 'Chore not found' };
        return { chore: toChoreClient(updated) };
    } catch (error) {
        console.error('updateChore error', error);
        return { error: error instanceof Error ? error.message : 'Failed to update chore' };
    }
};

export { API_UPDATE_CHORE };
