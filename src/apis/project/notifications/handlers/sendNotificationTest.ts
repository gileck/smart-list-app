import { ObjectId } from 'mongodb';
import { toQueryId } from '@/server/template/utils';
import { smartLists } from '@/server/database';
import {
    API_SEND_NOTIFICATION_TEST,
    type ApiHandlerContext,
    type SendNotificationTestRequest,
    type SendNotificationTestResponse,
} from '..';
import { dispatchNotification } from '../shared';

export const sendNotificationTest = async (
    request: SendNotificationTestRequest,
    context: ApiHandlerContext
): Promise<SendNotificationTestResponse> => {
    try {
        if (!context.userId) return { error: 'Not authenticated' };
        if (!request.listId) return { error: 'listId is required' };
        if (!request.filter) return { error: 'filter is required' };
        if (!request.channels || request.channels.length === 0) {
            return { error: 'At least one channel is required' };
        }
        if (
            !Number.isFinite(request.filter.daysThreshold) ||
            request.filter.daysThreshold < 0
        ) {
            return { error: 'daysThreshold must be >= 0' };
        }
        const userId = toQueryId(context.userId) as ObjectId;

        const list = await smartLists.findListById(request.listId, userId);
        if (!list) return { error: 'List not found' };

        // Build an ephemeral config — never persisted.
        const ephemeralConfig = {
            listId: request.listId,
            filter: request.filter,
            channels: request.channels,
        };

        const result = await dispatchNotification(
            // dispatchNotification accepts the doc/client union; we provide
            // only the fields it reads.
            ephemeralConfig as Parameters<typeof dispatchNotification>[0],
            userId,
            { allowEmpty: true, testPrefix: '[Test] ' }
        );
        if ('error' in result) return { error: result.error };

        return {
            sent: result.sentChannels.length > 0,
            message: result.message,
            channels: result.sentChannels,
        };
    } catch (error) {
        console.error('sendNotificationTest error', error);
        return {
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to send test notification',
        };
    }
};

export { API_SEND_NOTIFICATION_TEST };
