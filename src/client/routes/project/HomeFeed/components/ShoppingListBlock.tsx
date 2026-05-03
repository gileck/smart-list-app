import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import {
    compareUrgency,
    status,
    useRouter,
    useSmartListStore,
    type List,
    type SmartListItem,
} from '@/client/features';
import { ConfirmDialog } from '@/client/components/template/ui/confirm-dialog';
import { toast } from '@/client/components/template/ui/toast';
import { BlockHeader, SectionHeader } from '@/client/components/project/list-ui';
import { ItemRow } from '@/client/routes/project/ShoppingList/components/ItemRow';
import { RestockDialog } from '@/client/routes/project/ShoppingList/components/RestockDialog';

type Props = { list: List };

export function ShoppingListBlock({ list }: Props) {
    const { navigate } = useRouter();
    const items = useSmartListStore((s) => s.items);
    const restockBy = useSmartListStore((s) => s.restockBy);
    const deleteItem = useSmartListStore((s) => s.deleteItem);

    // eslint-disable-next-line state-management/prefer-state-architecture -- ephemeral confirm dialog target
    const [deleteTarget, setDeleteTarget] = useState<SmartListItem | null>(null);
    // eslint-disable-next-line state-management/prefer-state-architecture -- ephemeral dialog target
    const [restockTarget, setRestockTarget] = useState<SmartListItem | null>(null);

    const sortedItems = useMemo(
        () => items.filter((i) => i.listId === list.id).sort(compareUrgency),
        [items, list.id]
    );

    const buySoon = useMemo(
        () =>
            sortedItems.filter((i) => {
                const s = status(i);
                return s === 'BUY_SOON' || s === 'OUT';
            }),
        [sortedItems]
    );

    const handleRestockSubmit = (amount: number) => {
        if (!restockTarget) return;
        restockBy(restockTarget.id, amount);
        toast.success(`${restockTarget.name} restocked (${amount})`);
    };

    const handleDeleteConfirm = () => {
        if (!deleteTarget) return;
        const name = deleteTarget.name;
        deleteItem(deleteTarget.id);
        setDeleteTarget(null);
        toast.success(`${name} deleted`);
    };

    const itemPath = (i: SmartListItem) => `/lists/${list.id}/items/${i.id}`;

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <BlockHeader
                title={list.name}
                subtitle={`${sortedItems.length} item${sortedItems.length !== 1 ? 's' : ''}`}
                onOpen={() => navigate(`/lists/${list.id}`)}
            />

            {buySoon.length > 0 && (
                <section className="border-t border-border bg-destructive/5">
                    <SectionHeader
                        color="text-destructive"
                        dotColor="bg-destructive"
                        label="Buy Soon"
                        count={buySoon.length}
                    />
                    <ul className="divide-y divide-destructive/15">
                        {buySoon.map((item) => (
                            <li key={item.id}>
                                <ItemRow
                                    item={item}
                                    onTap={(i) => navigate(itemPath(i))}
                                    onRestock={setRestockTarget}
                                    onEdit={(i) => navigate(`${itemPath(i)}/edit`)}
                                    onDelete={setDeleteTarget}
                                />
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <section className="border-t border-border">
                <SectionHeader
                    color="text-success"
                    dotColor="bg-success"
                    label="All Items"
                    count={sortedItems.length}
                />
                {sortedItems.length === 0 ? (
                    <div className="px-5 pb-4 text-[13px] italic text-muted-foreground/70">
                        No items yet.
                    </div>
                ) : (
                    <ul className="divide-y divide-border">
                        {sortedItems.map((item) => (
                            <li key={item.id}>
                                <ItemRow
                                    item={item}
                                    onTap={(i) => navigate(itemPath(i))}
                                    onRestock={setRestockTarget}
                                    onEdit={(i) => navigate(`${itemPath(i)}/edit`)}
                                    onDelete={setDeleteTarget}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </section>

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

