import { Pencil, RotateCcw, X } from 'lucide-react';
import {
    daysLeftDisplay,
    status,
    type SmartListItem,
} from '@/client/features';
import { RoundIconButton } from '@/client/components/project/list-ui';

type Props = {
    item: SmartListItem;
    onTap: (item: SmartListItem) => void;
    onRestock: (item: SmartListItem) => void;
    onEdit: (item: SmartListItem) => void;
    onDelete: (item: SmartListItem) => void;
};

export function ItemRow({ item, onTap, onRestock, onEdit, onDelete }: Props) {
    const display = daysLeftDisplay(item);
    const itemStatus = status(item);
    const isUrgent = itemStatus === 'BUY_SOON' || itemStatus === 'OUT';
    const daysColor = isUrgent ? 'text-destructive' : 'text-success';

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onTap(item)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onTap(item);
                }
            }}
            className="flex w-full cursor-pointer items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-muted/40 focus:outline-none focus-visible:bg-muted/60"
        >
            <div className="flex min-w-[44px] shrink-0 flex-col items-end">
                <span className={`font-mono text-[22px] font-medium leading-none ${daysColor}`}>
                    {display}
                </span>
                <span className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    {display === '∞' ? '' : 'days'}
                </span>
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 truncate text-base font-medium tracking-tight">
                    {item.emoji && (
                        <span aria-hidden className="shrink-0 text-lg leading-none">
                            {item.emoji}
                        </span>
                    )}
                    <span className="truncate">{item.name}</span>
                </div>
                <div className="mt-0.5 truncate text-[13px] text-muted-foreground">
                    {item.quantity_left} left · {item.consumption_per_day}/day
                </div>
            </div>

            <div
                className="flex shrink-0 items-center gap-1.5"
                onClick={(e) => e.stopPropagation()}
            >
                <RoundIconButton
                    aria-label="Restock"
                    title="Restock"
variant="success"
                    onClick={() => onRestock(item)}
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                </RoundIconButton>
                <RoundIconButton
                    aria-label="Edit"
                    title="Edit"
onClick={() => onEdit(item)}
                >
                    <Pencil className="h-3.5 w-3.5" />
                </RoundIconButton>
                <RoundIconButton
                    aria-label="Delete"
                    title="Delete"
variant="destructive"
                    onClick={() => onDelete(item)}
                >
                    <X className="h-3.5 w-3.5" />
                </RoundIconButton>
            </div>
        </div>
    );
}
