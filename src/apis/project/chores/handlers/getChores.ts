import { ObjectId } from 'mongodb';
import { toQueryId } from '@/server/template/utils';
import { chores } from '@/server/database';
import {
    API_GET_CHORES,
    type ApiHandlerContext,
    type GetChoresRequest,
    type GetChoresResponse,
} from '..';
import { toChoreClient } from '../shared';

export const getChores = async (
    _request: GetChoresRequest,
    context: ApiHandlerContext
): Promise<GetChoresResponse> => {
    try {
        if (!context.userId) return { error: 'Not authenticated' };
        const userId = toQueryId(context.userId) as ObjectId;
        const docs = await chores.findChoresByUserId(userId);
        return { chores: docs.map(toChoreClient) };
    } catch (error) {
        console.error('getChores error', error);
        return { error: error instanceof Error ? error.message : 'Failed to load chores' };
    }
};

export { API_GET_CHORES };
