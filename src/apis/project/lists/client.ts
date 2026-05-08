import apiClient from '@/client/utils/apiClient';
import { CacheResult } from '@/common/cache/types';
import { API_GET_LISTS, API_CREATE_LIST, API_UPDATE_LIST, API_DELETE_LIST } from './index';
import {
    GetListsRequest,
    GetListsResponse,
    CreateListRequest,
    CreateListResponse,
    UpdateListRequest,
    UpdateListResponse,
    DeleteListRequest,
    DeleteListResponse,
} from './types';

export const getLists = async (
    params: GetListsRequest = {}
): Promise<CacheResult<GetListsResponse>> => apiClient.call(API_GET_LISTS, params);

export const createList = async (
    params: CreateListRequest
): Promise<CacheResult<CreateListResponse>> => apiClient.post(API_CREATE_LIST, params);

export const updateList = async (
    params: UpdateListRequest
): Promise<CacheResult<UpdateListResponse>> => apiClient.post(API_UPDATE_LIST, params);

export const deleteList = async (
    params: DeleteListRequest
): Promise<CacheResult<DeleteListResponse>> => apiClient.post(API_DELETE_LIST, params);
