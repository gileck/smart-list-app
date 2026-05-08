import { useMemo, useState } from 'react';
import { Download, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
    choreStatus,
    exportToJsonFile,
    getListType,
    isChoreAttention,
    status,
    useChores,
    useDeleteList,
    useLists,
    useRouter,
    useShoppingItems,
    type List,
} from '@/client/features';
import { ConfirmDialog } from '@/client/components/template/ui/confirm-dialog';
import { toast } from '@/client/components/template/ui/toast';
import { EmptyCard, Fab, RoundIconButton } from '@/client/components/project/list-ui';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/client/components/template/ui/dropdown-menu';
import { assertNever } from '@/client/features/project/_shared/assertNever';

export function Lists() {
    const { navigate } = useRouter();
    const queryClient = useQueryClient();

    const { data: listsData, isLoading } = useLists();
    const { data: itemsData } = useShoppingItems();
    const { data: choresData } = useChores();
    const deleteListMutation = useDeleteList();

    const lists = listsData?.lists ?? [];
    const items = itemsData?.items ?? [];
    const chores = choresData?.chores ?? [];

    // eslint-disable-next-line state-management/prefer-state-architecture -- ephemeral confirm dialog target
    const [deleteTarget, setDeleteTarget] = useState<List | null>(null);

    const sortedLists = useMemo(
        () => [...lists].sort((a, b) => a.created_at - b.created_at),
        [lists]
    );

    const handleDelete = () => {
        if (!deleteTarget) return;
        const target = deleteTarget;
        setDeleteTarget(null);
        deleteListMutation.mutate(
            { listId: target.id },
            {
                onSuccess: () => toast.success(`${target.name} deleted`),
                onError: (err) =>
                    toast.error(err instanceof Error ? err.message : 'Failed to delete list'),
            }
        );
    };

    const handleExport = () => {
        const { filename, counts } = exportToJsonFile(queryClient);
        toast.success(
            `Exported ${counts.lists} list${counts.lists !== 1 ? 's' : ''} to ${filename}`
        );
    };

    const summaryFor = (
        list: List
    ): { itemCount: number; attentionCount: number; attentionLabel: string } => {
        switch (list.type) {
            case 'shopping': {
                const own = items.filter((i) => i.listId === list.id);
                const attention = own.filter((i) => {
                    const s = status(i);
                    return s === 'BUY_SOON' || s === 'OUT';
                });
                return {
                    itemCount: own.length,
                    attentionCount: attention.length,
                    attentionLabel: 'buy soon',
                };
            }
            case 'chore': {
                const own = chores.filter((c) => c.listId === list.id);
                const attention = own.filter((c) => isChoreAttention(choreStatus(c)));
                return {
                    itemCount: own.length,
                    attentionCount: attention.length,
                    attentionLabel: 'due',
                };
            }
            default:
                return assertNever(list.type);
        }
    };

    return (
        <div className="mx-auto w-full max-w-md pb-24">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <header className="flex items-center gap-2 px-5 pt-5 pb-4">
                    <h1 className="flex-1 text-[22px] font-semibold tracking-tight">My Lists</h1>
                    <RoundIconButton
                        aria-label="Export lists to JSON"
                        title="Export lists to JSON"
                        onClick={handleExport}
                    >
                        <Download className="h-4 w-4" />
                    </RoundIconButton>
                    <span className="text-[13px] text-muted-foreground">
                        {lists.length} list{lists.length !== 1 ? 's' : ''}
                    </span>
                </header>

                {isLoading && lists.length === 0 ? (
                    <div className="border-t border-border px-5 py-12 text-center text-sm text-muted-foreground/70">
                        Loading…
                    </div>
                ) : sortedLists.length === 0 ? (
                    <div className="border-t border-border">
                        <EmptyCard
                            title="No lists yet"
                            hint="Tap + to create your first list."
                        />
                    </div>
                ) : (
                    <ul className="divide-y divide-border border-t border-border">
                        {sortedLists.map((list) => {
                            const summary = summaryFor(list);
                            return (
                                <li key={list.id}>
                                    <ListCard
                                        list={list}
                                        itemCount={summary.itemCount}
                                        attentionCount={summary.attentionCount}
                                        attentionLabel={summary.attentionLabel}
                                        onOpen={() => navigate(`/lists/${list.id}`)}
                                        onEdit={() => navigate(`/lists/${list.id}/edit`)}
                                        onDelete={() => setDeleteTarget(list)}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <Fab aria-label="Add list" onClick={() => navigate('/lists/new')} />

            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title={deleteTarget ? `Delete "${deleteTarget.name}"?` : ''}
                description="The list and all its items will be permanently removed."
                confirmText="Delete"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </div>
    );
}

function ListCard({
    list,
    itemCount,
    attentionCount,
    attentionLabel,
    onOpen,
    onEdit,
    onDelete,
}: {
    list: List;
    itemCount: number;
    attentionCount: number;
    attentionLabel: string;
    onOpen: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const def = getListType(list.type);
    const Icon = def.icon;
    const itemNoun = list.type === 'chore' ? 'chore' : 'item';

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onOpen}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpen();
                }
            }}
            className="flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40 focus:outline-none focus-visible:bg-muted/60"
        >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Icon className="h-5 w-5" />
            </span>

            <div className="min-w-0 flex-1">
                <div className="truncate text-base font-medium tracking-tight">
                    {list.name}
                </div>
                <div className="mt-0.5 truncate text-[13px] text-muted-foreground">
                    {def.label} · {itemCount} {itemNoun}
                    {itemCount !== 1 ? 's' : ''}
                    {attentionCount > 0 && (
                        <>
                            {' · '}
                            <span className="font-medium text-destructive">
                                {attentionCount} {attentionLabel}
                            </span>
                        </>
                    )}
                </div>
            </div>

            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <RoundIconButton aria-label={`Actions for ${list.name}`}>
                            <MoreVertical className="h-4 w-4" />
                        </RoundIconButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onSelect={onEdit}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit list
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onSelect={onDelete}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete list
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
