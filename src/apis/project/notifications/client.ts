import apiClient from '@/client/utils/apiClient';
import { CacheResult } from '@/common/cache/types';
import {
    API_CREATE_NOTIFICATION,
    API_DELETE_NOTIFICATION,
    API_GET_AVAILABLE_CHANNELS,
    API_GET_NOTIFICATIONS,
    API_SEND_NOTIFICATION_NOW,
    API_SEND_NOTIFICATION_TEST,
    API_UPDATE_NOTIFICATION,
} from './index';
import {
    CreateNotificationRequest,
    CreateNotificationResponse,
    DeleteNotificationRequest,
    DeleteNotificationResponse,
    GetAvailableChannelsRequest,
    GetAvailableChannelsResponse,
    GetNotificationsRequest,
    GetNotificationsResponse,
    SendNotificationNowRequest,
    SendNotificationNowResponse,
    SendNotificationTestRequest,
    SendNotificationTestResponse,
    UpdateNotificationRequest,
    UpdateNotificationResponse,
} from './types';

export const getNotifications = async (
    params: GetNotificationsRequest = {}
): Promise<CacheResult<GetNotificationsResponse>> =>
    apiClient.call(API_GET_NOTIFICATIONS, params);

export const createNotification = async (
    params: CreateNotificationRequest
): Promise<CacheResult<CreateNotificationResponse>> =>
    apiClient.post(API_CREATE_NOTIFICATION, params);

export const updateNotification = async (
    params: UpdateNotificationRequest
): Promise<CacheResult<UpdateNotificationResponse>> =>
    apiClient.post(API_UPDATE_NOTIFICATION, params);

export const deleteNotification = async (
    params: DeleteNotificationRequest
): Promise<CacheResult<DeleteNotificationResponse>> =>
    apiClient.post(API_DELETE_NOTIFICATION, params);

export const sendNotificationNow = async (
    params: SendNotificationNowRequest
): Promise<CacheResult<SendNotificationNowResponse>> =>
    apiClient.post(API_SEND_NOTIFICATION_NOW, params);

export const sendNotificationTest = async (
    params: SendNotificationTestRequest
): Promise<CacheResult<SendNotificationTestResponse>> =>
    apiClient.post(API_SEND_NOTIFICATION_TEST, params);

export const getAvailableChannels = async (
    params: GetAvailableChannelsRequest = {}
): Promise<CacheResult<GetAvailableChannelsResponse>> =>
    apiClient.call(API_GET_AVAILABLE_CHANNELS, params);
