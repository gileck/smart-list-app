import { useState } from 'react';
import { Check, ChevronLeft, Pencil } from 'lucide-react';
import { Button } from '@/client/components/template/ui/button';
import { ConfirmDialog } from '@/client/components/template/ui/confirm-dialog';
import { toast } from '@/client/components/template/ui/toast';
import {
    choreStatus,
    daysUntilDue,
    formatChoreDaysLabel,
    nextDueAt,
    useChores,
    useDeleteChore,
    useMarkChoreDone,
    useRouter,
    type ChoreStatus,
} from '@/client/features';
import {
    NotFoundCard,
    RoundIconButton,
    StatRow,
    StatusBadge,
    type StatusTone,
} from '@/client/components/project/list-ui';

const STATUS_META: Record<
    ChoreStatus,
    { heroColor: string; tone: StatusTone; label: string }
> = {
    OVERDUE: { heroColor: 'text-destructive', tone: 'destructive', label: 'Overdue' },
    DUE_TODAY: { heroColor: 'text-destructive', tone: 'destructive', label: 'Due today' },
    DUE_SOON: { heroColor: 'text-warning', tone: 'warning', label: 'Due soon' },
    OK: { heroColor: 'text-success', tone: 'success', label: 'On track' },
};

function formatDate(ts: number | null): string {
    if (!ts) return 'Never';
    return new Date(ts).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function ChoreDetail() {
    const { navigate, routeParams } = useRouter();
    const choreId = routeParams.itemId;

    const { data: choresData, isLoading } = useChores();
    const markDoneMutation = useMarkChoreDone();
    const deleteMutation = useDeleteChore();

    const chore = choresData?.chores?.find((c) => c.id === choreId) ?? null;

    // eslint-disable-next-line state-management/prefer-state-architecture -- ephemeral confirm dialog
    const [confirmOpen, setConfirmOpen] = useState(false);

    if (!chore && !isLoading) {
        return (
            <NotFoundCard
                message="Chore not found."
                onBack={() => navigate('/')}
                backLabel="Back to list"
            />
        );
    }
    if (!chore) return null;

    const listPath = `/lists/${chore.listId}`;
    const days = daysUntilDue(chore);
    const meta = STATUS_META[choreStatus(chore)];

    const handleMarkDone = () => {
        markDoneMutation.mutate(
            { choreId: chore.id },
            {
                onSuccess: () => toast.success(`${chore.name} marked done`),
                onError: (err) =>
                    toast.error(err instanceof Error ? err.message : 'Failed to mark done'),
            }
        );
    };

    const handleDelete = () => {
        const name = chore.name;
        const id = chore.id;
        setConfirmOpen(false);
        deleteMutation.mutate(
            { choreId: id },
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
                    <h1 className="flex-1 truncate text-[17px] font-semibold tracking-tight">
                        {chore.name}
                    </h1>
                    <RoundIconButton
                        aria-label="Edit"
                        onClick={() => navigate(`${listPath}/items/${chore.id}/edit`)}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </RoundIconButton>
                </header>

                <section className="border-t border-border px-5 pt-8 pb-6">
                    <div
                        className={`font-mono text-[72px] font-medium leading-none tracking-tighter ${meta.heroColor}`}
                    >
                        {days}
                    </div>
                    <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        {days < 0 ? 'days overdue' : 'days until due'}
                    </div>
                    <div className="mt-3 text-[28px] font-semibold tracking-tight">
                        {chore.name}
                    </div>
                    <StatusBadge label={meta.label} tone={meta.tone} className="mt-3" />
                    <div className="mt-2 text-[13px] text-muted-foreground">
                        {formatChoreDaysLabel(days)}
                    </div>
                </section>

                <dl className="divide-y divide-border border-t border-border text-sm">
                    <StatRow
                        label="Repeat every"
                        value={`${chore.repeat_interval_days} day${chore.repeat_interval_days !== 1 ? 's' : ''}`}
                        valueClassName="text-sm"
                    />
                    <StatRow
                        label="Last completed"
                        value={formatDate(chore.last_completed_at)}
                        valueClassName="text-sm"
                    />
                    <StatRow
                        label="Next due"
                        value={formatDate(nextDueAt(chore))}
                        valueClassName="text-sm"
                    />
                </dl>

                <div className="flex flex-col gap-2.5 border-t border-border px-5 py-5">
                    <Button size="lg" onClick={handleMarkDone} className="w-full">
                        <Check className="mr-2 h-4 w-4" />
                        Mark done today
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => navigate(`${listPath}/items/${chore.id}/edit`)}
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
                        Delete chore
                    </Button>
                </div>
            </div>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title={`Delete "${chore.name}"?`}
                description="This chore and all its data will be permanently removed."
                confirmText="Delete"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </div>
    );
}
