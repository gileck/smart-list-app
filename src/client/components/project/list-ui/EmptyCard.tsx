type Props = {
    title: string;
    hint: string;
};

export function EmptyCard({ title, hint }: Props) {
    return (
        <div className="px-5 py-12 text-center text-muted-foreground/70">
            <div className="mb-3 text-3xl opacity-40">◎</div>
            <div className="mb-1.5 text-base font-medium text-muted-foreground">{title}</div>
            <div className="text-sm leading-relaxed">{hint}</div>
        </div>
    );
}
