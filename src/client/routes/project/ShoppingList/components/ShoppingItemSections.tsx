import { useMemo } from 'react';
import { compareUrgency, status, type SmartListItem } from '@/client/features';
import { SectionHeader } from '@/client/components/project/list-ui';
import { ItemRow } from './ItemRow';

type Props = {
    items: SmartListItem[];
    isLoaded: boolean;
    listId: string;
    emptyState: React.ReactNode;
    onTap: (item: SmartListItem) => void;
    onRestock: (item: SmartListItem) => void;
    onEdit: (item: SmartListItem) => void;
    onDelete: (item: SmartListItem) => void;
};

export function ShoppingItemSections({
    items,
    isLoaded,
    listId,
    emptyState,
    onTap,
    onRestock,
    onEdit,
    onDelete,
}: Props) {
    const sortedAll = useMemo(
        () => items.filter((i) => i.listId === listId).sort(compareUrgency),
        [items, listId]
    );

    const buySoon = useMemo(
        () => sortedAll.filter((i) => { const s = status(i); return s === 'BUY_SOON' || s === 'OUT'; }),
        [sortedAll]
    );

    const buySoonIds = useMemo(() => new Set(buySoon.map((i) => i.id)), [buySoon]);

    const remaining = useMemo(
        () => sortedAll.filter((i) => !buySoonIds.has(i.id)),
        [sortedAll, buySoonIds]
    );

    if (!isLoaded) {
        return (
            <section className="border-t border-border">
                <div className="px-5 pb-4 text-[13px] italic text-muted-foreground/70">Loading…</div>
            </section>
        );
    }

    if (sortedAll.length === 0) {
        return <section className="border-t border-border">{emptyState}</section>;
    }

    return (
        <>
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
                                    onTap={onTap}
                                    onRestock={onRestock}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {remaining.length > 0 && (
                <section className="border-t border-border">
                    <SectionHeader
                        color="text-success"
                        dotColor="bg-success"
                        label="All Items"
                        count={remaining.length}
                    />
                    <ul className="divide-y divide-border">
                        {remaining.map((item) => (
                            <li key={item.id}>
                                <ItemRow
                                    item={item}
                                    onTap={onTap}
                                    onRestock={onRestock}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </>
    );
}
