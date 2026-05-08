import { ObjectId } from 'mongodb';
import { toQueryId } from '@/server/template/utils';
import { pushSubscriptions, users } from '@/server/database';
import {
    API_GET_AVAILABLE_CHANNELS,
    type ApiHandlerContext,
    type GetAvailableChannelsRequest,
    type GetAvailableChannelsResponse,
} from '..';

export const getAvailableChannels = async (
    _request: GetAvailableChannelsRequest,
    context: ApiHandlerContext
): Promise<GetAvailableChannelsResponse> => {
    try {
        if (!context.userId) return { error: 'Not authenticated' };
        const userIdObj = toQueryId(context.userId) as ObjectId;
        const [user, pushCount] = await Promise.all([
            users.findUserById(context.userId),
            pushSubscriptions.countSubscriptionsByUser(userIdObj),
        ]);
        return {
            push: pushCount > 0,
            telegram: !!user?.telegramChatId,
        };
    } catch (error) {
        console.error('getAvailableChannels error', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to load channels',
        };
    }
};

export { API_GET_AVAILABLE_CHANNELS };
