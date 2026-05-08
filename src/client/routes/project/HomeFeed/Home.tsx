import { useMemo } from 'react';
import { ListChecks, Plus } from 'lucide-react';
import { useChores, useLists, useRouter, useShoppingItems, type List } from '@/client/features';
import { Button } from '@/client/components/template/ui/button';
import { assertNever } from '@/client/features/project/_shared/assertNever';
import { ShoppingListBlock } from './components/ShoppingListBlock';
import { ChoreListBlock } from './components/ChoreListBlock';

function renderListBlock(list: List) {
    switch (list.type) {
        case 'shopping':
            return <ShoppingListBlock key={list.id} list={list} />;
        case 'chore':
            return <ChoreListBlock key={list.id} list={list} />;
        default:
            return assertNever(list.type);
    }
}

export function Home() {
    const { navigate } = useRouter();

    const { data: listsData, isLoading } = useLists();
    // Prefetch items + chores so the inline blocks render with data on first mount.
    useShoppingItems();
    useChores();

    const lists = listsData?.lists ?? [];

    const sortedLists = useMemo(
        () => [...lists].sort((a, b) => a.created_at - b.created_at),
        [lists]
    );

    return (
        <div className="mx-auto w-full max-w-md pb-24">
            <header className="mb-4 flex items-center gap-3 px-1 pt-1">
                <h1 className="flex-1 text-[22px] font-semibold tracking-tight">Home</h1>
                <Button variant="outline" size="sm" onClick={() => navigate('/lists')}>
                    <ListChecks className="mr-2 h-4 w-4" />
                    Manage lists
                </Button>
            </header>

            {isLoading && lists.length === 0 ? (
                <div className="overflow-hidden rounded-2xl border border-border bg-card px-5 py-12 text-center text-sm text-muted-foreground/70 shadow-sm">
                    Loading…
                </div>
            ) : sortedLists.length === 0 ? (
                <div className="overflow-hidden rounded-2xl border border-border bg-card px-5 py-12 text-center text-muted-foreground/70 shadow-sm">
                    <div className="mb-3 text-3xl opacity-40">◎</div>
                    <div className="mb-1.5 text-base font-medium text-muted-foreground">
                        No lists yet
                    </div>
                    <div className="mb-5 text-sm leading-relaxed">
                        Create your first list to get started.
                    </div>
                    <Button onClick={() => navigate('/lists/new')}>
                        <Plus className="mr-2 h-4 w-4" />
                        New list
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col gap-4">{sortedLists.map(renderListBlock)}</div>
            )}
        </div>
    );
}
