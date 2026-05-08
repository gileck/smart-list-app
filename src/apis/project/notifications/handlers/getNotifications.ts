import { ObjectId } from 'mongodb';
import { toQueryId } from '@/server/template/utils';
import { notifications } from '@/server/database';
import {
    API_GET_NOTIFICATIONS,
    type ApiHandlerContext,
    type GetNotificationsRequest,
    type GetNotificationsResponse,
} from '..';
import { toClient } from '../shared';

export const getNotifications = async (
    _request: GetNotificationsRequest,
    context: ApiHandlerContext
): Promise<GetNotificationsResponse> => {
    try {
        if (!context.userId) return { error: 'Not authenticated' };
        const userId = toQueryId(context.userId) as ObjectId;
        const docs = await notifications.findByUserId(userId);
        return { notifications: docs.map(toClient) };
    } catch (error) {
        console.error('getNotifications error', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to load notifications',
        };
    }
};

export { API_GET_NOTIFICATIONS };
