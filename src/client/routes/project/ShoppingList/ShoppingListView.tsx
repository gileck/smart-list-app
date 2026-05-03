import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Pencil } from 'lucide-react';
import {
    compareUrgency,
    status,
    useBootstrapLists,
    useListsStore,
    useRouter,
    useSmartListStore,
    type SmartListItem,
} from '@/client/features';
import { ConfirmDialog } from '@/client/components/template/ui/confirm-dialog';
import { toast } from '@/client/components/template/ui/toast';
import {
    EmptyCard,
    Fab,
    NotFoundCard,
    RoundIconButton,
    SectionHeader,
} from '@/client/components/project/list-ui';
import { ItemRow } from './components/ItemRow';
import { RestockDialog } from './components/RestockDialog';

export function ShoppingListView() {
    const { navigate, routeParams } = useRouter();
    const listId = routeParams.listId;

    useBootstrapLists();

    const list = useListsStore((s) => s.lists.find((l) => l.id === listId) ?? null);
    const items = useSmartListStore((s) => s.items);
    const restockBy = useSmartListStore((s) => s.restockBy);
    const deleteItem = useSmartListStore((s) => s.deleteItem);
    const runDailyConsumption = useSmartListStore((s) => s.runDailyConsumption);

    // eslint-disable-next-line state-management/prefer-state-architecture -- ephemeral confirm dialog target
    const [deleteTarget, setDeleteTarget] = useState<SmartListItem | null>(null);
    // eslint-disable-next-line state-management/prefer-state-architecture -- ephemeral dialog target
    const [restockTarget, setRestockTarget] = useState<SmartListItem | null>(null);

    useEffect(() => {
        runDailyConsumption();
    }, [runDailyConsumption]);

    const sortedAll = useMemo(
        () => items.filter((i) => i.listId === listId).sort(compareUrgency),
        [items, listId]
    );

    const buySoon = useMemo(
        () =>
            sortedAll.filter((i) => {
                const s = status(i);
                return s === 'BUY_SOON' || s === 'OUT';
            }),
        [sortedAll]
    );

    if (!list) {
        return <NotFoundCard message="List not found." onBack={() => navigate('/')} />;
    }

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
                            {sortedAll.length} item{sortedAll.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <RoundIconButton
                        aria-label="Edit list"
                        onClick={() => navigate(`/lists/${list.id}/edit`)}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </RoundIconButton>
                </header>

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
                        count={sortedAll.length}
                    />
                    {sortedAll.length === 0 ? (
                        <EmptyCard
                            title="No items yet"
                            hint="Tap + to add something you track daily."
                        />
                    ) : (
                        <ul className="divide-y divide-border">
                            {sortedAll.map((item) => (
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
