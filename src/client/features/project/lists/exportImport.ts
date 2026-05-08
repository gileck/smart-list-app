import type { QueryClient } from '@tanstack/react-query';
import type { GetChoresResponse } from '@/apis/project/chores/types';
import type { GetListsResponse } from '@/apis/project/lists/types';
import type { GetItemsResponse } from '@/apis/project/shopping-items/types';
import { choresQueryKey } from '../chores/hooks';
import { itemsQueryKey } from '../smart-list/hooks';
import { listsQueryKey } from './hooks';
import type { Chore } from '../chores/types';
import type { SmartListItem } from '../smart-list/types';
import type { List } from './types';

export const EXPORT_VERSION = 2;

export type SmartListExport = {
    version: number;
    exported_at: number;
    lists: List[];
    items: SmartListItem[];
    chores: Chore[];
};

export function buildExport(queryClient: QueryClient): SmartListExport {
    const lists = queryClient.getQueryData<GetListsResponse>(listsQueryKey)?.lists ?? [];
    const items = queryClient.getQueryData<GetItemsResponse>(itemsQueryKey)?.items ?? [];
    const chores = queryClient.getQueryData<GetChoresResponse>(choresQueryKey)?.chores ?? [];
    return {
        version: EXPORT_VERSION,
        exported_at: Date.now(),
        lists,
        items,
        chores,
    };
}

export function exportToJsonFile(queryClient: QueryClient) {
    const data = buildExport(queryClient);
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const date = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const filename = `smart-list-export-${date}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return {
        filename,
        counts: { lists: data.lists.length, items: data.items.length, chores: data.chores.length },
    };
}
