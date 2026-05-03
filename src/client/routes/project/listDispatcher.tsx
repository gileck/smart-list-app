import { useBootstrapLists, useChoresStore, useListsStore, useRouter, useSmartListStore } from '@/client/features';
import { NotFoundCard } from '@/client/components/project/list-ui';
import { assertNever } from '@/client/features/project/_shared/assertNever';
import {
    ShoppingListView,
    ItemDetail as ShoppingItemDetail,
    AddItemRoute as ShoppingAddItemRoute,
    EditItemRoute as ShoppingEditItemRoute,
} from './ShoppingList';
import {
    ChoreListView,
    ChoreDetail,
    AddChoreRoute,
    EditChoreRoute,
} from './ChoreList';

function NotFound({ message }: { message: string }) {
    const { navigate } = useRouter();
    return <NotFoundCard message={message} onBack={() => navigate('/')} />;
}

export function ListView() {
    useBootstrapLists();
    const { routeParams } = useRouter();
    const list = useListsStore((s) => s.lists.find((l) => l.id === routeParams.listId) ?? null);

    if (!list) return <NotFound message="List not found." />;
    switch (list.type) {
        case 'shopping':
            return <ShoppingListView />;
        case 'chore':
            return <ChoreListView />;
        default:
            return assertNever(list.type);
    }
}

export function AddItemView() {
    const { routeParams } = useRouter();
    const list = useListsStore((s) => s.lists.find((l) => l.id === routeParams.listId) ?? null);

    if (!list) return <NotFound message="List not found." />;
    switch (list.type) {
        case 'shopping':
            return <ShoppingAddItemRoute />;
        case 'chore':
            return <AddChoreRoute />;
        default:
            return assertNever(list.type);
    }
}

export function ItemDetailView() {
    const { routeParams } = useRouter();
    const itemId = routeParams.itemId;
    const isChore = useChoresStore((s) => s.chores.some((c) => c.id === itemId));
    const isShopping = useSmartListStore((s) => s.items.some((i) => i.id === itemId));

    if (isChore) return <ChoreDetail />;
    if (isShopping) return <ShoppingItemDetail />;
    return <NotFound message="Item not found." />;
}

export function EditItemView() {
    const { routeParams } = useRouter();
    const itemId = routeParams.itemId;
    const isChore = useChoresStore((s) => s.chores.some((c) => c.id === itemId));
    const isShopping = useSmartListStore((s) => s.items.some((i) => i.id === itemId));

    if (isChore) return <EditChoreRoute />;
    if (isShopping) return <ShoppingEditItemRoute />;
    return <NotFound message="Item not found." />;
}
