import apiClient from '@/client/utils/apiClient';
import { CacheResult } from '@/common/cache/types';
import {
    API_GET_CHORES,
    API_CREATE_CHORE,
    API_UPDATE_CHORE,
    API_DELETE_CHORE,
    API_MARK_CHORE_DONE,
} from './index';
import {
    GetChoresRequest,
    GetChoresResponse,
    CreateChoreRequest,
    CreateChoreResponse,
    UpdateChoreRequest,
    UpdateChoreResponse,
    DeleteChoreRequest,
    DeleteChoreResponse,
    MarkChoreDoneRequest,
    MarkChoreDoneResponse,
} from './types';

export const getChores = async (
    params: GetChoresRequest = {}
): Promise<CacheResult<GetChoresResponse>> => apiClient.call(API_GET_CHORES, params);

export const createChore = async (
    params: CreateChoreRequest
): Promise<CacheResult<CreateChoreResponse>> => apiClient.post(API_CREATE_CHORE, params);

export const updateChore = async (
    params: UpdateChoreRequest
): Promise<CacheResult<UpdateChoreResponse>> => apiClient.post(API_UPDATE_CHORE, params);

export const deleteChore = async (
    params: DeleteChoreRequest
): Promise<CacheResult<DeleteChoreResponse>> => apiClient.post(API_DELETE_CHORE, params);

export const markChoreDone = async (
    params: MarkChoreDoneRequest
): Promise<CacheResult<MarkChoreDoneResponse>> => apiClient.post(API_MARK_CHORE_DONE, params);
