import { cn } from '@/client/lib/utils';

type Props = {
    label: string;
    value: string;
    valueClassName?: string;
};

export function StatRow({ label, value, valueClassName }: Props) {
    return (
        <div className="flex items-center justify-between px-5 py-4">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className={cn('font-mono text-base font-medium', valueClassName)}>{value}</dd>
        </div>
    );
}
