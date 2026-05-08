import { ObjectId } from 'mongodb';
import { toQueryId } from '@/server/template/utils';
import { notifications } from '@/server/database';
import {
    API_UPDATE_NOTIFICATION,
    type ApiHandlerContext,
    type UpdateNotificationRequest,
    type UpdateNotificationResponse,
} from '..';
import { toClient } from '../shared';
import type { NotificationConfigUpdate } from '@/server/database/collections/project/notifications/types';

export const updateNotification = async (
    request: UpdateNotificationRequest,
    context: ApiHandlerContext
): Promise<UpdateNotificationResponse> => {
    try {
        if (!context.userId) return { error: 'Not authenticated' };
        if (!request.notificationId) return { error: 'notificationId is required' };
        const userId = toQueryId(context.userId) as ObjectId;

        const update: NotificationConfigUpdate = { updatedAt: new Date() };
        if (request.name !== undefined) update.name = request.name.trim() || undefined;
        if (request.schedule !== undefined) {
            const s = request.schedule;
            if (
                !Number.isInteger(s.hourOfDay) ||
                s.hourOfDay < 0 ||
                s.hourOfDay > 23 ||
                !s.timezone ||
                (s.frequency === 'weekly' && (!s.daysOfWeek || s.daysOfWeek.length === 0))
            ) {
                return { error: 'Invalid schedule' };
            }
            update.schedule = s;
        }
        if (request.filter !== undefined) {
            if (
                !Number.isFinite(request.filter.daysThreshold) ||
                request.filter.daysThreshold < 0
            ) {
                return { error: 'Invalid filter' };
            }
            update.filter = request.filter;
        }
        if (request.channels !== undefined) {
            if (request.channels.length === 0) {
                return { error: 'At least one channel is required' };
            }
            update.channels = request.channels.filter(
                (c) => c === 'push' || c === 'telegram'
            );
        }
        if (request.enabled !== undefined) update.enabled = request.enabled;

        const updated = await notifications.update(request.notificationId, userId, update);
        if (!updated) return { error: 'Notification not found' };
        return { notification: toClient(updated) };
    } catch (error) {
        console.error('updateNotification error', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to update notification',
        };
    }
};

export { API_UPDATE_NOTIFICATION };
