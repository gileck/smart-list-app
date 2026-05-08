import { ObjectId } from 'mongodb';
import { toQueryId } from '@/server/template/utils';
import { notifications } from '@/server/database';
import {
    API_DELETE_NOTIFICATION,
    type ApiHandlerContext,
    type DeleteNotificationRequest,
    type DeleteNotificationResponse,
} from '..';

export const deleteNotification = async (
    request: DeleteNotificationRequest,
    context: ApiHandlerContext
): Promise<DeleteNotificationResponse> => {
    try {
        if (!context.userId) return { error: 'Not authenticated' };
        if (!request.notificationId) return { error: 'notificationId is required' };
        const userId = toQueryId(context.userId) as ObjectId;
        const ok = await notifications.remove(request.notificationId, userId);
        if (!ok) return { error: 'Notification not found' };
        return { success: true };
    } catch (error) {
        console.error('deleteNotification error', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to delete notification',
        };
    }
};

export { API_DELETE_NOTIFICATION };
