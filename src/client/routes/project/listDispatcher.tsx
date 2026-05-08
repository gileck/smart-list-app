import { useChores, useLists, useRouter, useShoppingItems } from '@/client/features';
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
    const { routeParams } = useRouter();
    const { data: listsData, isLoading } = useLists();
    if (isLoading && !listsData) return null;
    const list = listsData?.lists?.find((l) => l.id === routeParams.listId);

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
    const { data: listsData, isLoading } = useLists();
    if (isLoading && !listsData) return null;
    const list = listsData?.lists?.find((l) => l.id === routeParams.listId);

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
    const { data: itemsData } = useShoppingItems();
    const { data: choresData } = useChores();

    const isShopping = itemsData?.items?.some((i) => i.id === itemId);
    const isChore = choresData?.chores?.some((c) => c.id === itemId);

    if (isChore) return <ChoreDetail />;
    if (isShopping) return <ShoppingItemDetail />;
    if (!itemsData || !choresData) return null;
    return <NotFound message="Item not found." />;
}

export function EditItemView() {
    const { routeParams } = useRouter();
    const itemId = routeParams.itemId;
    const { data: itemsData } = useShoppingItems();
    const { data: choresData } = useChores();

    const isShopping = itemsData?.items?.some((i) => i.id === itemId);
    const isChore = choresData?.chores?.some((c) => c.id === itemId);

    if (isChore) return <EditChoreRoute />;
    if (isShopping) return <ShoppingEditItemRoute />;
    if (!itemsData || !choresData) return null;
    return <NotFound message="Item not found." />;
}
