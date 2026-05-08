export * from './index';

import {
    API_CREATE_NOTIFICATION,
    API_DELETE_NOTIFICATION,
    API_GET_AVAILABLE_CHANNELS,
    API_GET_NOTIFICATIONS,
    API_SEND_NOTIFICATION_NOW,
    API_SEND_NOTIFICATION_TEST,
    API_UPDATE_NOTIFICATION,
} from './index';
import { getNotifications } from './handlers/getNotifications';
import { createNotification } from './handlers/createNotification';
import { updateNotification } from './handlers/updateNotification';
import { deleteNotification } from './handlers/deleteNotification';
import { sendNotificationNow } from './handlers/sendNotificationNow';
import { sendNotificationTest } from './handlers/sendNotificationTest';
import { getAvailableChannels } from './handlers/getAvailableChannels';

export const notificationsApiHandlers = {
    [API_GET_NOTIFICATIONS]: { process: getNotifications },
    [API_CREATE_NOTIFICATION]: { process: createNotification },
    [API_UPDATE_NOTIFICATION]: { process: updateNotification },
    [API_DELETE_NOTIFICATION]: { process: deleteNotification },
    [API_SEND_NOTIFICATION_NOW]: { process: sendNotificationNow },
    [API_SEND_NOTIFICATION_TEST]: { process: sendNotificationTest },
    [API_GET_AVAILABLE_CHANNELS]: { process: getAvailableChannels },
};
