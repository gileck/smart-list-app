import { cn } from '@/client/lib/utils';

type Tone = 'destructive' | 'warning' | 'success' | 'muted';

const TONE_CLASS: Record<Tone, string> = {
    destructive: 'bg-destructive/10 text-destructive border-destructive/30',
    warning: 'bg-warning/10 text-warning border-warning/30',
    success: 'bg-success/10 text-success border-success/30',
    muted: 'bg-muted text-muted-foreground border-border',
};

export function StatusBadge({
    label,
    tone,
    className,
}: {
    label: string;
    tone: Tone;
    className?: string;
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]',
                TONE_CLASS[tone],
                className
            )}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
            {label}
        </span>
    );
}

export type StatusTone = Tone;
