import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import {
    useDeleteShoppingItem,
    useRestockShoppingItem,
    useRouter,
    useShoppingItems,
    type List,
    type SmartListItem,
} from '@/client/features';
import { ConfirmDialog } from '@/client/components/template/ui/confirm-dialog';
import { toast } from '@/client/components/template/ui/toast';
import { BlockHeader } from '@/client/components/project/list-ui';
import { ShoppingItemSections } from '@/client/routes/project/ShoppingList/components/ShoppingItemSections';
import { RestockDialog } from '@/client/routes/project/ShoppingList/components/RestockDialog';

type Props = { list: List };

export function ShoppingListBlock({ list }: Props) {
    const { navigate } = useRouter();
    const { data: itemsData } = useShoppingItems();
    const restockMutation = useRestockShoppingItem();
    const deleteMutation = useDeleteShoppingItem();
    const items = itemsData?.items ?? [];

    // eslint-disable-next-line state-management/prefer-state-architecture -- ephemeral confirm dialog target
    const [deleteTarget, setDeleteTarget] = useState<SmartListItem | null>(null);
    // eslint-disable-next-line state-management/prefer-state-architecture -- ephemeral dialog target
    const [restockTarget, setRestockTarget] = useState<SmartListItem | null>(null);

    const totalCount = useMemo(
        () => items.filter((i) => i.listId === list.id).length,
        [items, list.id]
    );

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
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <BlockHeader
                title={list.name}
                subtitle={`${totalCount} item${totalCount !== 1 ? 's' : ''}`}
                onOpen={() => navigate(`/lists/${list.id}`)}
            />

            <ShoppingItemSections
                items={items}
                isLoaded={!!itemsData}
                listId={list.id}
                emptyState={
                    <div className="px-5 pb-4 text-[13px] italic text-muted-foreground/70">
                        No items yet.
                    </div>
                }
                onTap={(i) => navigate(itemPath(i))}
                onRestock={setRestockTarget}
                onEdit={(i) => navigate(`${itemPath(i)}/edit`)}
                onDelete={setDeleteTarget}
            />

            <button
                type="button"
                onClick={() => navigate(`/lists/${list.id}/items/new`)}
                className="flex w-full items-center gap-2 border-t border-border px-5 py-3.5 text-left text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            >
                <Plus className="h-4 w-4" />
                Add item
            </button>

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
