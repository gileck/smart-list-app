type Props = {
    color: string;
    dotColor: string;
    label: string;
    count: number;
};

export function SectionHeader({ color, dotColor, label, count }: Props) {
    return (
        <div className="flex items-center gap-2 px-5 pt-3.5 pb-2">
            <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} aria-hidden />
            <span className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${color}`}>
                {label}
            </span>
            <span className="ml-auto text-[11px] text-muted-foreground/70">{count}</span>
        </div>
    );
}
