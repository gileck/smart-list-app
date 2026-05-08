import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/client/components/template/ui/button';
import { ConfirmDialog } from '@/client/components/template/ui/confirm-dialog';
import { toast } from '@/client/components/template/ui/toast';
import {
    LIST_TYPE_OPTIONS,
    useCreateListWithId,
    useDeleteList,
    useLists,
    useRouter,
    useUpdateList,
    type ListTypeId,
} from '@/client/features';
import { NotFoundCard, RoundIconButton } from '@/client/components/project/list-ui';

type Props = {
    mode: 'add' | 'edit';
};

export function AddEditList({ mode }: Props) {
    const { navigate, routeParams } = useRouter();
    const isEdit = mode === 'edit';
    const listId = isEdit ? routeParams.listId : null;

    const { data: listsData, isLoading } = useLists();
    const createListMutation = useCreateListWithId();
    const updateListMutation = useUpdateList();
    const deleteListMutation = useDeleteList();

    const editList = listId ? listsData?.lists?.find((l) => l.id === listId) ?? null : null;

    // eslint-disable-next-line state-management/prefer-state-architecture -- text input
    const [name, setName] = useState(editList?.name ?? '');
    // eslint-disable-next-line state-management/prefer-state-architecture -- single-select form input
    const [type, setType] = useState<ListTypeId>(editList?.type ?? 'shopping');
    // eslint-disable-next-line state-management/prefer-state-architecture -- ephemeral confirm dialog
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

    const canSave = name.trim().length > 0;

    const goBack = () => {
        if (isEdit && editList) {
            navigate(`/lists/${editList.id}`);
        } else {
            navigate('/');
        }
    };

    const handleSave = () => {
        if (!canSave) return;
        const trimmed = name.trim();

        if (isEdit && editList) {
            updateListMutation.mutate(
                { listId: editList.id, name: trimmed },
                {
                    onSuccess: () => {
                        toast.success(`${trimmed} updated`);
                        navigate(`/lists/${editList.id}`);
                    },
                    onError: (err) =>
                        toast.error(err instanceof Error ? err.message : 'Failed to update list'),
                }
            );
            return;
        }

        createListMutation.mutate(
            { name: trimmed, type },
            {
                onSuccess: (created) => {
                    toast.success(`${trimmed} created`);
                    if (created?.id) navigate(`/lists/${created.id}`);
                    else navigate('/lists');
                },
                onError: (err) =>
                    toast.error(err instanceof Error ? err.message : 'Failed to create list'),
            }
        );
    };

    const handleDelete = () => {
        if (!editList) return;
        const target = editList;
        setConfirmDeleteOpen(false);
        deleteListMutation.mutate(
            { listId: target.id },
            {
                onSuccess: () => {
                    toast.success(`${target.name} deleted`);
                    navigate('/');
                },
                onError: (err) =>
                    toast.error(err instanceof Error ? err.message : 'Failed to delete list'),
            }
        );
    };

    if (isEdit && !editList && !isLoading) {
        return <NotFoundCard message="List not found." onBack={() => navigate('/')} />;
    }

    return (
        <div className="mx-auto w-full max-w-md pb-24">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <header className="flex items-center gap-3 px-5 pt-5 pb-4">
                    <RoundIconButton aria-label="Back" onClick={goBack}>
                        <ChevronLeft className="h-4 w-4" />
                    </RoundIconButton>
                    <h1 className="flex-1 text-[17px] font-semibold tracking-tight">
                        {isEdit ? 'Edit List' : 'New List'}
                    </h1>
                </header>

                <div className="border-t border-border pt-2 pb-6">
                    <div className="flex flex-col gap-1.5 px-5 pt-5">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                            List name
                        </span>
                        <input
                            autoFocus={!isEdit}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Kitchen"
                            className="w-full bg-transparent border-0 border-b-2 border-border focus:border-foreground outline-none py-2 text-[22px] font-normal placeholder:text-muted-foreground/60 transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-2 px-5 pt-6">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                            List type
                        </span>
                        {isEdit ? (
                            <p className="text-[13px] text-muted-foreground">
                                Type cannot be changed after creation.
                            </p>
                        ) : null}
                        <div className="flex flex-col gap-2">
                            {LIST_TYPE_OPTIONS.map((opt) => {
                                const Icon = opt.icon;
                                const selected = type === opt.id;
                                const disabled = isEdit;
                                return (
                                    <button
                                        type="button"
                                        key={opt.id}
                                        onClick={() => !disabled && setType(opt.id)}
                                        disabled={disabled && !selected}
                                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                                            selected
                                                ? 'border-foreground bg-muted/60'
                                                : 'border-border hover:bg-muted/40'
                                        } ${disabled && !selected ? 'opacity-40 cursor-not-allowed' : ''}`}
                                    >
                                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                            <Icon className="h-4 w-4" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-[15px] font-medium tracking-tight">
                                                {opt.label}
                                            </span>
                                            <span className="block truncate text-[12px] text-muted-foreground">
                                                {opt.description}
                                            </span>
                                        </span>
                                        <span
                                            className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                                selected
                                                    ? 'border-foreground bg-foreground'
                                                    : 'border-border'
                                            }`}
                                        >
                                            {selected && (
                                                <span className="h-1.5 w-1.5 rounded-full bg-background" />
                                            )}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="h-px bg-border mt-6" />

                    <div className="flex flex-col gap-2.5 px-5 pt-6">
                        <Button
                            size="lg"
                            onClick={handleSave}
                            disabled={!canSave}
                            className="w-full"
                        >
                            {isEdit ? 'Save Changes' : 'Create List'}
                        </Button>
                        <Button variant="outline" size="lg" onClick={goBack} className="w-full">
                            Cancel
                        </Button>
                        {isEdit && editList && (
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => setConfirmDeleteOpen(true)}
                                className="w-full border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:border-destructive"
                            >
                                Delete list
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={confirmDeleteOpen}
                onOpenChange={setConfirmDeleteOpen}
                title={editList ? `Delete "${editList.name}"?` : ''}
                description="The list and all its items will be permanently removed."
                confirmText="Delete"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </div>
    );
}
