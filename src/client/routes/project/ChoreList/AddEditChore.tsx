import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/client/components/template/ui/button';
import { toast } from '@/client/components/template/ui/toast';
import {
    startOfDay,
    startOfToday,
    useChores,
    useCreateChoreWithId,
    useRouter,
    useUpdateChore,
} from '@/client/features';
import { NotFoundCard, RoundIconButton } from '@/client/components/project/list-ui';

type Props = {
    mode: 'add' | 'edit';
};

function toDateInputValue(ts: number | null): string {
    if (!ts) return '';
    const d = new Date(ts);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function fromDateInputValue(value: string): number | null {
    if (!value) return null;
    const [y, m, d] = value.split('-').map((n) => parseInt(n, 10));
    if (!y || !m || !d) return null;
    const date = new Date(y, m - 1, d);
    return startOfDay(date.getTime());
}

function todayInputValue(): string {
    return toDateInputValue(startOfToday());
}

export function AddEditChore({ mode }: Props) {
    const { navigate, routeParams } = useRouter();
    const isEdit = mode === 'edit';
    const listId = routeParams.listId;
    const choreId = isEdit ? routeParams.itemId : null;

    const { data: choresData, isLoading } = useChores();
    const createMutation = useCreateChoreWithId();
    const updateMutation = useUpdateChore();

    const editChore = choreId
        ? choresData?.chores?.find((c) => c.id === choreId) ?? null
        : null;

    // eslint-disable-next-line state-management/prefer-state-architecture -- text input
    const [name, setName] = useState(editChore?.name ?? '');
    // eslint-disable-next-line state-management/prefer-state-architecture -- text input
    const [interval, setInterval] = useState(
        editChore ? String(editChore.repeat_interval_days) : ''
    );
    // eslint-disable-next-line state-management/prefer-state-architecture -- text input
    const [lastDone, setLastDone] = useState(
        editChore ? toDateInputValue(editChore.last_completed_at) : ''
    );

    const parsedInterval = parseFloat(interval);
    const parsedLast = fromDateInputValue(lastDone);
    const todayValue = todayInputValue();
    const inFuture = !!parsedLast && parsedLast > startOfToday();

    const canSave =
        name.trim().length > 0 &&
        !Number.isNaN(parsedInterval) &&
        parsedInterval > 0 &&
        !inFuture;

    const effectiveListId = listId ?? editChore?.listId;

    const goBack = () => {
        if (isEdit && choreId && effectiveListId) {
            navigate(`/lists/${effectiveListId}/items/${choreId}`);
        } else if (effectiveListId) {
            navigate(`/lists/${effectiveListId}`);
        } else {
            navigate('/');
        }
    };

    const handleSave = () => {
        if (!canSave || !effectiveListId) return;
        const trimmed = name.trim();

        if (isEdit && editChore) {
            updateMutation.mutate(
                {
                    choreId: editChore.id,
                    name: trimmed,
                    repeat_interval_days: parsedInterval,
                    last_completed_at: parsedLast,
                },
                {
                    onSuccess: () => {
                        toast.success(`${trimmed} updated`);
                        navigate(`/lists/${effectiveListId}/items/${editChore.id}`);
                    },
                    onError: (err) =>
                        toast.error(err instanceof Error ? err.message : 'Failed to update chore'),
                }
            );
            return;
        }

        createMutation.mutate(
            {
                listId: effectiveListId,
                name: trimmed,
                repeat_interval_days: parsedInterval,
                last_completed_at: parsedLast,
            },
            {
                onSuccess: () => {
                    toast.success(`${trimmed} added`);
                    navigate(`/lists/${effectiveListId}`);
                },
                onError: (err) =>
                    toast.error(err instanceof Error ? err.message : 'Failed to add chore'),
            }
        );
    };

    if (isEdit && !editChore && !isLoading) {
        return <NotFoundCard message="Chore not found." onBack={() => navigate('/')} />;
    }

    return (
        <div className="mx-auto w-full max-w-md pb-24">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <header className="flex items-center gap-3 px-5 pt-5 pb-4">
                    <RoundIconButton aria-label="Back" onClick={goBack}>
                        <ChevronLeft className="h-4 w-4" />
                    </RoundIconButton>
                    <h1 className="flex-1 text-[17px] font-semibold tracking-tight">
                        {isEdit ? 'Edit Chore' : 'Add Chore'}
                    </h1>
                </header>

                <div className="border-t border-border pt-2 pb-6">
                    <FormField label="Chore name">
                        <input
                            autoFocus={!isEdit}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Bathroom"
                            className="w-full bg-transparent border-0 border-b-2 border-border focus:border-foreground outline-none py-2 text-[22px] font-normal placeholder:text-muted-foreground/60 transition-colors"
                        />
                    </FormField>

                    <FormField label="Repeat every (days)">
                        <input
                            type="number"
                            inputMode="numeric"
                            min="1"
                            value={interval}
                            onChange={(e) => setInterval(e.target.value)}
                            placeholder="7"
                            className="w-full bg-transparent border-0 border-b-2 border-border focus:border-foreground outline-none py-2 text-[22px] font-normal placeholder:text-muted-foreground/60 transition-colors"
                        />
                    </FormField>

                    <FormField label="Last completed (optional)">
                        <input
                            type="date"
                            max={todayValue}
                            value={lastDone}
                            onChange={(e) => setLastDone(e.target.value)}
                            className="w-full bg-transparent border-0 border-b-2 border-border focus:border-foreground outline-none py-2 text-[18px] font-normal placeholder:text-muted-foreground/60 transition-colors"
                        />
                        <p className="mt-1 text-xs italic text-muted-foreground/70">
                            {inFuture
                                ? 'Date cannot be in the future'
                                : lastDone
                                ? `Next due ${parsedInterval > 0 ? `in ${parsedInterval} day${parsedInterval !== 1 ? 's' : ''}` : ''}`
                                : 'Leave blank to mark this chore as due today'}
                        </p>
                    </FormField>

                    <div className="mt-6 h-px bg-border" />

                    <div className="flex flex-col gap-2.5 px-5 pt-6">
                        <Button
                            size="lg"
                            onClick={handleSave}
                            disabled={!canSave}
                            className="w-full"
                        >
                            {isEdit ? 'Save Changes' : 'Add Chore'}
                        </Button>
                        <Button variant="outline" size="lg" onClick={goBack} className="w-full">
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5 px-5 pt-5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {label}
            </span>
            {children}
        </div>
    );
}
