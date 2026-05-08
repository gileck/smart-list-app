import type { ListClient, ListTypeId } from '@/server/database/collections/project/lists/types';

export interface GetListsRequest {
    _?: never;
}
export interface GetListsResponse {
    lists?: ListClient[];
    error?: string;
}

export interface CreateListRequest {
    _id?: string;
    name: string;
    type: ListTypeId;
}
export interface CreateListResponse {
    list?: ListClient;
    error?: string;
}

export interface UpdateListRequest {
    listId: string;
    name?: string;
}
export interface UpdateListResponse {
    list?: ListClient;
    error?: string;
}

export interface DeleteListRequest {
    listId: string;
}
export interface DeleteListResponse {
    success?: boolean;
    error?: string;
}

export interface ApiHandlerContext {
    userId?: string;
}
