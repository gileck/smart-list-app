import { ChevronRight } from 'lucide-react';

type Props = {
    title: string;
    subtitle: string;
    onOpen: () => void;
};

export function BlockHeader({ title, subtitle, onOpen }: Props) {
    return (
        <button
            type="button"
            onClick={onOpen}
            className="flex w-full items-center gap-3 px-5 pt-5 pb-4 text-left transition-colors hover:bg-muted/30"
        >
            <div className="min-w-0 flex-1">
                <h2 className="truncate text-[19px] font-semibold tracking-tight">{title}</h2>
                <p className="text-[12px] text-muted-foreground">{subtitle}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" aria-hidden />
        </button>
    );
}
