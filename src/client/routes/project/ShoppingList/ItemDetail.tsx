import { useState } from 'react';
import { ChevronLeft, Pencil, RotateCcw } from 'lucide-react';
import { Button } from '@/client/components/template/ui/button';
import { ConfirmDialog } from '@/client/components/template/ui/confirm-dialog';
import { toast } from '@/client/components/template/ui/toast';
import {
    daysLeftDisplay,
    status,
    useDeleteShoppingItem,
    useRestockShoppingItem,
    useRouter,
    useShoppingItems,
    type ItemStatus,
} from '@/client/features';
import {
    NotFoundCard,
    RoundIconButton,
    StatRow,
    StatusBadge,
    type StatusTone,
} from '@/client/components/project/list-ui';
import { RestockDialog } from './components/RestockDialog';

const STATUS_META: Record<
    ItemStatus | 'INFINITE',
    { heroColor: string; tone: StatusTone; label: string }
> = {
    OUT: { heroColor: 'text-destructive', tone: 'destructive', label: 'Out' },
    BUY_SOON: { heroColor: 'text-destructive', tone: 'destructive', label: 'Buy soon' },
    OK: { heroColor: 'text-success', tone: 'success', label: 'Stocked' },
    INFINITE: { heroColor: 'text-muted-foreground', tone: 'muted', label: 'Stocked' },
};

export function ItemDetail() {
    const { navigate, routeParams } = useRouter();
    const itemId = routeParams.itemId;
    const listId = routeParams.listId;

    const { data: itemsData, isLoading } = useShoppingItems();
    const restockMutation = useRestockShoppingItem();
    const deleteMutation = useDeleteShoppingItem();

    const item = itemsData?.items?.find((i) => i.id === itemId) ?? null;

    // eslint-disable-next-line state-management/prefer-state-architecture -- ephemeral confirm dialog
    const [confirmOpen, setConfirmOpen] = useState(false);
    // eslint-disable-next-line state-management/prefer-state-architecture -- ephemeral dialog
    const [restockOpen, setRestockOpen] = useState(false);

    if (!item && !isLoading) {
        return (
            <NotFoundCard
                message="Item not found."
                onBack={() => navigate(listId ? `/lists/${listId}` : '/')}
                backLabel="Back to list"
            />
        );
    }
    if (!item) return null;

    const listPath = `/lists/${item.listId}`;
    const isInfinite = item.consumption_per_day <= 0;
    const itemStatus = status(item);
    const meta = STATUS_META[isInfinite ? 'INFINITE' : itemStatus];
    const display = daysLeftDisplay(item);

    const handleRestockSubmit = (amount: number) => {
        restockMutation.mutate(
            { itemId: item.id, amount },
            {
                onSuccess: () => toast.success(`${item.name} restocked (${amount})`),
                onError: (err) =>
                    toast.error(err instanceof Error ? err.message : 'Failed to restock'),
            }
        );
    };

    const handleDelete = () => {
        const name = item.name;
        const id = item.id;
        setConfirmOpen(false);
        deleteMutation.mutate(
            { itemId: id },
            {
                onSuccess: () => {
                    toast.success(`${name} deleted`);
                    navigate(listPath);
                },
                onError: (err) =>
                    toast.error(err instanceof Error ? err.message : 'Failed to delete'),
            }
        );
    };

    return (
        <div className="mx-auto w-full max-w-md pb-24">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <header className="flex items-center gap-3 px-5 pt-5 pb-4">
                    <RoundIconButton aria-label="Back" onClick={() => navigate(listPath)}>
                        <ChevronLeft className="h-4 w-4" />
                    </RoundIconButton>
                    <h1 className="flex flex-1 items-center gap-1.5 truncate text-[17px] font-semibold tracking-tight">
                        {item.emoji && (
                            <span aria-hidden className="shrink-0 leading-none">
                                {item.emoji}
                            </span>
                        )}
                        <span className="truncate">{item.name}</span>
                    </h1>
                    <RoundIconButton
                        aria-label="Edit"
                        onClick={() => navigate(`${listPath}/items/${item.id}/edit`)}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </RoundIconButton>
                </header>

                <section className="border-t border-border px-5 pt-8 pb-6">
                    <div
                        className={`font-mono text-[72px] font-medium leading-none tracking-tighter ${meta.heroColor}`}
                    >
                        {display}
                    </div>
                    <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        days remaining
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[28px] font-semibold tracking-tight">
                        {item.emoji && (
                            <span aria-hidden className="leading-none">
                                {item.emoji}
                            </span>
                        )}
                        <span>{item.name}</span>
                    </div>
                    <StatusBadge label={meta.label} tone={meta.tone} className="mt-3" />
                </section>

                <dl className="divide-y divide-border border-t border-border text-sm">
                    <StatRow label="Quantity left" value={String(item.quantity_left)} />
                    <StatRow
                        label="Daily use"
                        value={isInfinite ? '—' : `${item.consumption_per_day} / day`}
                    />
                </dl>

                <div className="flex flex-col gap-2.5 border-t border-border px-5 py-5">
                    <Button size="lg" onClick={() => setRestockOpen(true)} className="w-full">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Restock
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => navigate(`${listPath}/items/${item.id}/edit`)}
                        className="w-full"
                    >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setConfirmOpen(true)}
                        className="w-full border-destructive/30 bg-destructive/5 text-destructive hover:border-destructive hover:bg-destructive/10"
                    >
                        Delete item
                    </Button>
                </div>
            </div>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title={`Delete "${item.name}"?`}
                description="This item and all its data will be permanently removed."
                confirmText="Delete"
                variant="destructive"
                onConfirm={handleDelete}
            />

            <RestockDialog
                open={restockOpen}
                onOpenChange={setRestockOpen}
                item={item}
                onRestock={handleRestockSubmit}
            />
        </div>
    );
}
