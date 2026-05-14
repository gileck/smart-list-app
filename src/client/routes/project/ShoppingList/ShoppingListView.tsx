import { useMemo, useState } from 'react';
import { ChevronLeft, Pencil } from 'lucide-react';
import {
    useDeleteShoppingItem,
    useLists,
    useRestockShoppingItem,
    useRouter,
    useShoppingItems,
    type SmartListItem,
} from '@/client/features';
import { ConfirmDialog } from '@/client/components/template/ui/confirm-dialog';
import { toast } from '@/client/components/template/ui/toast';
import {
    EmptyCard,
    Fab,
    NotFoundCard,
    RoundIconButton,
} from '@/client/components/project/list-ui';
import { ShoppingItemSections } from './components/ShoppingItemSections';
import { RestockDialog } from './components/RestockDialog';

export function ShoppingListView() {
    const { navigate, routeParams } = useRouter();
    const listId = routeParams.listId;

    const { data: listsData } = useLists();
    const { data: itemsData, isLoading } = useShoppingItems();
    const restockMutation = useRestockShoppingItem();
    const deleteMutation = useDeleteShoppingItem();

    const list = listsData?.lists?.find((l) => l.id === listId) ?? null;
    const items = itemsData?.items ?? [];

    // eslint-disable-next-line state-management/prefer-state-architecture -- ephemeral confirm dialog target
    const [deleteTarget, setDeleteTarget] = useState<SmartListItem | null>(null);
    // eslint-disable-next-line state-management/prefer-state-architecture -- ephemeral dialog target
    const [restockTarget, setRestockTarget] = useState<SmartListItem | null>(null);

    const totalCount = useMemo(
        () => items.filter((i) => i.listId === listId).length,
        [items, listId]
    );

    if (!list && !isLoading) {
        return <NotFoundCard message="List not found." onBack={() => navigate('/')} />;
    }
    if (!list) return null;

    const handleRestockSubmit = (amount: number) => {
        if (!restockTarget) return;
        const target = restockTarget;
        restockMutation.mutate(
            { itemId: target.id, amount },
            {
                onSuccess: () => toast.success(`${target.name} restocked (${amount})`),
                onError: (err) =>
                    toast.error(err instanceof Error ? err.message : 'Failed to restock'),
            }
        );
    };

    const handleDeleteConfirm = () => {
        if (!deleteTarget) return;
        const target = deleteTarget;
        setDeleteTarget(null);
        deleteMutation.mutate(
            { itemId: target.id },
            {
                onSuccess: () => toast.success(`${target.name} deleted`),
                onError: (err) =>
                    toast.error(err instanceof Error ? err.message : 'Failed to delete'),
            }
        );
    };

    const itemPath = (i: SmartListItem) => `/lists/${list.id}/items/${i.id}`;

    return (
        <div className="mx-auto w-full max-w-md pb-24">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <header className="flex items-center gap-3 px-5 pt-5 pb-4">
                    <RoundIconButton aria-label="Back to lists" onClick={() => navigate('/')}>
                        <ChevronLeft className="h-4 w-4" />
                    </RoundIconButton>
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-[19px] font-semibold tracking-tight">
                            {list.name}
                        </h1>
                        <p className="text-[12px] text-muted-foreground">
                            {totalCount} item{totalCount !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <RoundIconButton
                        aria-label="Edit list"
                        onClick={() => navigate(`/lists/${list.id}/edit`)}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </RoundIconButton>
                </header>

                <ShoppingItemSections
                    items={items}
                    isLoaded={!!itemsData}
                    listId={listId}
                    emptyState={
                        <EmptyCard
                            title="No items yet"
                            hint="Tap + to add something you track daily."
                        />
                    }
                    onTap={(i) => navigate(itemPath(i))}
                    onRestock={setRestockTarget}
                    onEdit={(i) => navigate(`${itemPath(i)}/edit`)}
                    onDelete={setDeleteTarget}
                />
            </div>

            <Fab
                aria-label="Add item"
                onClick={() => navigate(`/lists/${list.id}/items/new`)}
            />

            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title={deleteTarget ? `Delete "${deleteTarget.name}"?` : ''}
                description="This item and all its data will be permanently removed."
                confirmText="Delete"
                variant="destructive"
                onConfirm={handleDeleteConfirm}
            />

            <RestockDialog
                open={!!restockTarget}
                onOpenChange={(open) => !open && setRestockTarget(null)}
                item={restockTarget}
                onRestock={handleRestockSubmit}
            />
        </div>
    );
}
