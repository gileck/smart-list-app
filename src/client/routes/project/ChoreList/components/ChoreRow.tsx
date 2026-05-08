import { Check, Pencil, X } from 'lucide-react';
import {
    choreStatus,
    daysUntilDue,
    formatChoreDaysLabel,
    type Chore,
} from '@/client/features';
import { RoundIconButton } from '@/client/components/project/list-ui';

type Props = {
    chore: Chore;
    onTap: (chore: Chore) => void;
    onMarkDone: (chore: Chore) => void;
    onEdit: (chore: Chore) => void;
    onDelete: (chore: Chore) => void;
};

export function ChoreRow({ chore, onTap, onMarkDone, onEdit, onDelete }: Props) {
    const s = choreStatus(chore);
    const d = daysUntilDue(chore);

    const heroText = d === 0 ? 'Today' : `${d}d`;
    const heroColor =
        s === 'OVERDUE' || s === 'DUE_TODAY'
            ? 'text-destructive'
            : s === 'DUE_SOON'
            ? 'text-warning'
            : 'text-success';
    const unitLabel = d === 0 ? 'today' : d < 0 ? 'overdue' : 'until due';

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onTap(chore)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onTap(chore);
                }
            }}
            className="flex w-full cursor-pointer items-center gap-2.5 pl-3 pr-4 py-3.5 text-left transition-colors hover:bg-muted/40 focus:outline-none focus-visible:bg-muted/60"
        >
            <div className="flex min-w-[44px] shrink-0 flex-col items-end">
                <span className={`font-mono text-[18px] font-medium leading-none ${heroColor}`}>
                    {heroText}
                </span>
                <span className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    {unitLabel}
                </span>
            </div>

            <div className="min-w-0 flex-1 pl-2">
                <div className="truncate text-base font-medium tracking-tight">{chore.name}</div>
                <div className="mt-0.5 truncate text-[13px] text-muted-foreground">
                    Every {chore.repeat_interval_days} day
                    {chore.repeat_interval_days !== 1 ? 's' : ''} · {formatChoreDaysLabel(d)}
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <RoundIconButton
                    aria-label="Mark done"
                    title="Mark done"
variant="success"
                    onClick={() => onMarkDone(chore)}
                >
                    <Check className="h-3.5 w-3.5" />
                </RoundIconButton>
                <RoundIconButton
                    aria-label="Edit"
                    title="Edit"
onClick={() => onEdit(chore)}
                >
                    <Pencil className="h-3.5 w-3.5" />
                </RoundIconButton>
                <RoundIconButton
                    aria-label="Delete"
                    title="Delete"
variant="destructive"
                    onClick={() => onDelete(chore)}
                >
                    <X className="h-3.5 w-3.5" />
                </RoundIconButton>
            </div>
        </div>
    );
}
