import apiClient from '@/client/utils/apiClient';
import { CacheResult } from '@/common/cache/types';
import {
    API_GET_ITEMS,
    API_CREATE_ITEM,
    API_UPDATE_ITEM,
    API_DELETE_ITEM,
    API_RESTOCK_ITEM,
    API_GET_RESTOCK_HISTORY,
} from './index';
import {
    GetItemsRequest,
    GetItemsResponse,
    CreateItemRequest,
    CreateItemResponse,
    UpdateItemRequest,
    UpdateItemResponse,
    DeleteItemRequest,
    DeleteItemResponse,
    RestockItemRequest,
    RestockItemResponse,
    GetRestockHistoryRequest,
    GetRestockHistoryResponse,
} from './types';

export const getItems = async (
    params: GetItemsRequest = {}
): Promise<CacheResult<GetItemsResponse>> => apiClient.call(API_GET_ITEMS, params);

export const createItem = async (
    params: CreateItemRequest
): Promise<CacheResult<CreateItemResponse>> => apiClient.post(API_CREATE_ITEM, params);

export const updateItem = async (
    params: UpdateItemRequest
): Promise<CacheResult<UpdateItemResponse>> => apiClient.post(API_UPDATE_ITEM, params);

export const deleteItem = async (
    params: DeleteItemRequest
): Promise<CacheResult<DeleteItemResponse>> => apiClient.post(API_DELETE_ITEM, params);

export const restockItem = async (
    params: RestockItemRequest
): Promise<CacheResult<RestockItemResponse>> => apiClient.post(API_RESTOCK_ITEM, params);

export const getRestockHistory = async (
    params: GetRestockHistoryRequest
): Promise<CacheResult<GetRestockHistoryResponse>> =>
    apiClient.call(API_GET_RESTOCK_HISTORY, params);
