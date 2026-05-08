import { ObjectId } from 'mongodb';
import { toDocumentId, toQueryId, toStringId } from '@/server/template/utils';
import { smartLists } from '@/server/database';
import {
    API_CREATE_LIST,
    type ApiHandlerContext,
    type CreateListRequest,
    type CreateListResponse,
} from '..';

export const createList = async (
    request: CreateListRequest,
    context: ApiHandlerContext
): Promise<CreateListResponse> => {
    try {
        if (!context.userId) return { error: 'Not authenticated' };
        const name = request.name?.trim();
        if (!name) return { error: 'Name is required' };
        if (request.type !== 'shopping' && request.type !== 'chore') {
            return { error: 'Invalid list type' };
        }
        const userId = toQueryId(context.userId) as ObjectId;

        if (request._id) {
            const existing = await smartLists.findListById(request._id, userId);
            if (existing) {
                return {
                    list: {
                        id: toStringId(existing._id),
                        name: existing.name,
                        type: existing.type,
                        created_at: existing.createdAt.getTime(),
                        updated_at: existing.updatedAt.getTime(),
                    },
                };
            }
        }

        const now = new Date();
        const created = await smartLists.createList({
            _id: request._id ? toDocumentId(request._id) : new ObjectId(),
            userId,
            name,
            type: request.type,
            createdAt: now,
            updatedAt: now,
        });
        return {
            list: {
                id: toStringId(created._id),
                name: created.name,
                type: created.type,
                created_at: created.createdAt.getTime(),
                updated_at: created.updatedAt.getTime(),
            },
        };
    } catch (error) {
        console.error('createList error', error);
        return { error: error instanceof Error ? error.message : 'Failed to create list' };
    }
};

export { API_CREATE_LIST };
