import { useMemo, useState } from 'react';
import { ChevronLeft, Pencil } from 'lucide-react';
import {
    choreStatus,
    compareChoresUrgency,
    isChoreAttention,
    useBootstrapLists,
    useChoresStore,
    useListsStore,
    useRouter,
    type Chore,
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
import { ChoreRow } from './components/ChoreRow';

export function ChoreListView() {
    const { navigate, routeParams } = useRouter();
    const listId = routeParams.listId;

    useBootstrapLists();

    const list = useListsStore((s) => s.lists.find((l) => l.id === listId) ?? null);
    const chores = useChoresStore((s) => s.chores);
    const markDone = useChoresStore((s) => s.markDone);
    const deleteChore = useChoresStore((s) => s.deleteChore);

    // eslint-disable-next-line state-management/prefer-state-architecture -- ephemeral confirm dialog target
    const [deleteTarget, setDeleteTarget] = useState<Chore | null>(null);

    const listChores = useMemo(
        () => chores.filter((c) => c.listId === listId).sort(compareChoresUrgency),
        [chores, listId]
    );

    const attention = useMemo(
        () => listChores.filter((c) => isChoreAttention(choreStatus(c))),
        [listChores]
    );

    if (!list) {
        return <NotFoundCard message="List not found." onBack={() => navigate('/')} />;
    }

    const handleMarkDone = (chore: Chore) => {
        markDone(chore.id);
        toast.success(`${chore.name} marked done`);
    };

    const handleDeleteConfirm = () => {
        if (!deleteTarget) return;
        const name = deleteTarget.name;
        deleteChore(deleteTarget.id);
        setDeleteTarget(null);
        toast.success(`${name} deleted`);
    };

    const itemPath = (c: Chore) => `/lists/${list.id}/items/${c.id}`;

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
                            {listChores.length} chore{listChores.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <RoundIconButton
                        aria-label="Edit list"
                        onClick={() => navigate(`/lists/${list.id}/edit`)}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </RoundIconButton>
                </header>

                {attention.length > 0 && (
                    <section className="border-t border-border bg-destructive/5">
                        <SectionHeader
                            color="text-destructive"
                            dotColor="bg-destructive"
                            label="Needs Attention"
                            count={attention.length}
                        />
                        <ul className="divide-y divide-destructive/15">
                            {attention.map((chore) => (
                                <li key={chore.id}>
                                    <ChoreRow
                                        chore={chore}
                                        onTap={(c) => navigate(itemPath(c))}
                                        onMarkDone={handleMarkDone}
                                        onEdit={(c) => navigate(`${itemPath(c)}/edit`)}
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
                        label="All Chores"
                        count={listChores.length}
                    />
                    {listChores.length === 0 ? (
                        <EmptyCard
                            title="No chores yet"
                            hint="Tap + to add a recurring task."
                        />
                    ) : (
                        <ul className="divide-y divide-border">
                            {listChores.map((chore) => (
                                <li key={chore.id}>
                                    <ChoreRow
                                        chore={chore}
                                        onTap={(c) => navigate(itemPath(c))}
                                        onMarkDone={handleMarkDone}
                                        onEdit={(c) => navigate(`${itemPath(c)}/edit`)}
                                        onDelete={setDeleteTarget}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>

            <Fab
                aria-label="Add chore"
                onClick={() => navigate(`/lists/${list.id}/items/new`)}
            />

            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title={deleteTarget ? `Delete "${deleteTarget.name}"?` : ''}
                description="This chore and all its data will be permanently removed."
                confirmText="Delete"
                variant="destructive"
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
}
