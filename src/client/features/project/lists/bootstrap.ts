import { useEffect } from 'react';
import { useSmartListStore } from '../smart-list/store';
import { DEFAULT_LIST_ID, getDefaultList, useListsStore } from './store';

export function bootstrapLists() {
    const listsState = useListsStore.getState();
    const itemsState = useSmartListStore.getState();

    const hasLists = listsState.lists.length > 0;
    const hasOrphans = itemsState.items.some((item) => !item.listId);

    if (hasLists && !hasOrphans) return;

    const defaultListId = listsState.lists[0]?.id ?? DEFAULT_LIST_ID;
    if (!hasLists) {
        listsState.upsertSeed(getDefaultList());
    }

    if (hasOrphans) {
        itemsState.reassignOrphansToList(defaultListId);
    }

    if (!hasLists && itemsState.items.length === 0) {
        itemsState.seedSampleItemsForList(DEFAULT_LIST_ID);
    }
}

export function useBootstrapLists() {
    useEffect(() => {
        bootstrapLists();
    }, []);
}
