import type { ShoppingItemClient } from '@/server/database/collections/project/shopping-items/types';
import type { RestockEventClient } from '@/server/database/collections/project/restock-events/types';

export interface GetItemsRequest {
    _?: never;
}
export interface GetItemsResponse {
    items?: ShoppingItemClient[];
    error?: string;
}

export interface CreateItemRequest {
    _id?: string;
    listId: string;
    name: string;
    emoji?: string;
    quantity_left: number;
    consumption_per_day: number;
    restock_presets?: number[];
}
export interface CreateItemResponse {
    item?: ShoppingItemClient;
    error?: string;
}

export interface UpdateItemRequest {
    itemId: string;
    name?: string;
    emoji?: string;
    quantity_left?: number;
    consumption_per_day?: number;
    restock_presets?: number[];
}
export interface UpdateItemResponse {
    item?: ShoppingItemClient;
    error?: string;
}

export interface DeleteItemRequest {
    itemId: string;
}
export interface DeleteItemResponse {
    success?: boolean;
    error?: string;
}

export interface RestockItemRequest {
    itemId: string;
    amount: number;
}
export interface RestockItemResponse {
    item?: ShoppingItemClient;
    error?: string;
}

export interface GetRestockHistoryRequest {
    itemId: string;
}
export interface GetRestockHistoryResponse {
    events?: RestockEventClient[];
    /** Observed daily-use rate from the gap between consecutive restocks. */
    observedPerDay?: number | null;
    error?: string;
}

export interface ApiHandlerContext {
    userId?: string;
}
