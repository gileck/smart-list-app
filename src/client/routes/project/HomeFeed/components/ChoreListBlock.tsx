import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import {
    choreStatus,
    compareChoresUrgency,
    isChoreAttention,
    useChoresStore,
    useRouter,
    type Chore,
    type List,
} from '@/client/features';
import { ConfirmDialog } from '@/client/components/template/ui/confirm-dialog';
import { toast } from '@/client/components/template/ui/toast';
import { BlockHeader, SectionHeader } from '@/client/components/project/list-ui';
import { ChoreRow } from '@/client/routes/project/ChoreList/components/ChoreRow';

type Props = { list: List };

export function ChoreListBlock({ list }: Props) {
    const { navigate } = useRouter();
    const chores = useChoresStore((s) => s.chores);
    const markDone = useChoresStore((s) => s.markDone);
    const deleteChore = useChoresStore((s) => s.deleteChore);

    // eslint-disable-next-line state-management/prefer-state-architecture -- ephemeral confirm dialog target
    const [deleteTarget, setDeleteTarget] = useState<Chore | null>(null);

    const listChores = useMemo(
        () => chores.filter((c) => c.listId === list.id).sort(compareChoresUrgency),
        [chores, list.id]
    );

    const attention = useMemo(
        () => listChores.filter((c) => isChoreAttention(choreStatus(c))),
        [listChores]
    );

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
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <BlockHeader
                title={list.name}
                subtitle={`${listChores.length} chore${listChores.length !== 1 ? 's' : ''}`}
                onOpen={() => navigate(`/lists/${list.id}`)}
            />

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
                    <div className="px-5 pb-4 text-[13px] italic text-muted-foreground/70">
                        No chores yet.
                    </div>
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

            <button
                type="button"
                onClick={() => navigate(`/lists/${list.id}/items/new`)}
                className="flex w-full items-center gap-2 border-t border-border px-5 py-3.5 text-left text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            >
                <Plus className="h-4 w-4" />
                Add chore
            </button>

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
