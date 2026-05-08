import type { ChoreClient } from '@/server/database/collections/project/chores/types';

export interface GetChoresRequest {
    _?: never;
}
export interface GetChoresResponse {
    chores?: ChoreClient[];
    error?: string;
}

export interface CreateChoreRequest {
    _id?: string;
    listId: string;
    name: string;
    repeat_interval_days: number;
    last_completed_at: number | null;
}
export interface CreateChoreResponse {
    chore?: ChoreClient;
    error?: string;
}

export interface UpdateChoreRequest {
    choreId: string;
    name?: string;
    repeat_interval_days?: number;
    last_completed_at?: number | null;
}
export interface UpdateChoreResponse {
    chore?: ChoreClient;
    error?: string;
}

export interface DeleteChoreRequest {
    choreId: string;
}
export interface DeleteChoreResponse {
    success?: boolean;
    error?: string;
}

export interface MarkChoreDoneRequest {
    choreId: string;
}
export interface MarkChoreDoneResponse {
    chore?: ChoreClient;
    error?: string;
}

export interface ApiHandlerContext {
    userId?: string;
}
