import { ObjectId } from 'mongodb';
import { toDocumentId, toQueryId } from '@/server/template/utils';
import { notifications, smartLists } from '@/server/database';
import {
    API_CREATE_NOTIFICATION,
    type ApiHandlerContext,
    type CreateNotificationRequest,
    type CreateNotificationResponse,
} from '..';
import { toClient } from '../shared';
import type { NotificationChannel } from '@/server/database/collections/project/notifications/types';

const VALID_FILTER_BY_LIST_TYPE: Record<'shopping' | 'chore', string> = {
    shopping: 'shopping_below_days',
    chore: 'chore_due_within',
};

function validateRequest(request: CreateNotificationRequest): string | null {
    if (!request.listId) return 'listId is required';
    const { schedule, filter } = request;
    if (!schedule) return 'schedule is required';
    if (schedule.frequency !== 'daily' && schedule.frequency !== 'weekly') {
        return 'Invalid frequency';
    }
    if (
        !Number.isInteger(schedule.hourOfDay) ||
        schedule.hourOfDay < 0 ||
        schedule.hourOfDay > 23
    ) {
        return 'hourOfDay must be 0..23';
    }
    if (!schedule.timezone) return 'timezone is required';
    if (
        schedule.frequency === 'weekly' &&
        (!schedule.daysOfWeek || schedule.daysOfWeek.length === 0)
    ) {
        return 'daysOfWeek required for weekly';
    }
    if (!filter) return 'filter is required';
    if (!Number.isFinite(filter.daysThreshold) || filter.daysThreshold < 0) {
        return 'daysThreshold must be >= 0';
    }
    if (!request.channels || request.channels.length === 0) {
        return 'At least one channel is required';
    }
    return null;
}

export const createNotification = async (
    request: CreateNotificationRequest,
    context: ApiHandlerContext
): Promise<CreateNotificationResponse> => {
    try {
        if (!context.userId) return { error: 'Not authenticated' };
        const validationError = validateRequest(request);
        if (validationError) return { error: validationError };

        const userId = toQueryId(context.userId) as ObjectId;
        const list = await smartLists.findListById(request.listId, userId);
        if (!list) return { error: 'List not found' };

        const expectedFilter = VALID_FILTER_BY_LIST_TYPE[list.type];
        if (request.filter.type !== expectedFilter) {
            return { error: `Filter ${request.filter.type} not valid for ${list.type} list` };
        }

        if (request._id) {
            const existing = await notifications.findById(request._id, userId);
            if (existing) return { notification: toClient(existing) };
        }

        const channels: NotificationChannel[] = request.channels.filter(
            (c) => c === 'push' || c === 'telegram'
        );

        const now = new Date();
        const created = await notifications.create({
            _id: request._id ? toDocumentId(request._id) : new ObjectId(),
            userId,
            listId: list._id,
            name: request.name?.trim(),
            schedule: request.schedule,
            filter: request.filter,
            channels,
            enabled: request.enabled,
            lastSentAt: null,
            createdAt: now,
            updatedAt: now,
        });
        return { notification: toClient(created) };
    } catch (error) {
        console.error('createNotification error', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to create notification',
        };
    }
};

export { API_CREATE_NOTIFICATION };
