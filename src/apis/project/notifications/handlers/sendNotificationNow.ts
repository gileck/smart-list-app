import { ObjectId } from 'mongodb';
import { toQueryId } from '@/server/template/utils';
import { notifications } from '@/server/database';
import {
    API_SEND_NOTIFICATION_NOW,
    type ApiHandlerContext,
    type SendNotificationNowRequest,
    type SendNotificationNowResponse,
} from '..';
import { dispatchNotification } from '../shared';

export const sendNotificationNow = async (
    request: SendNotificationNowRequest,
    context: ApiHandlerContext
): Promise<SendNotificationNowResponse> => {
    try {
        if (!context.userId) return { error: 'Not authenticated' };
        if (!request.notificationId) return { error: 'notificationId is required' };
        const userId = toQueryId(context.userId) as ObjectId;

        const config = await notifications.findById(request.notificationId, userId);
        if (!config) return { error: 'Notification not found' };

        const result = await dispatchNotification(config, userId, {
            allowEmpty: true,
            testPrefix: '(Test) ',
        });
        if ('error' in result) return { error: result.error };

        return {
            sent: result.sentChannels.length > 0,
            message: result.message,
            channels: result.sentChannels,
        };
    } catch (error) {
        console.error('sendNotificationNow error', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to send notification',
        };
    }
};

export { API_SEND_NOTIFICATION_NOW };
