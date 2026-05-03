import { Plus } from 'lucide-react';

type Props = {
    onClick: () => void;
    'aria-label': string;
};

export function Fab({ onClick, 'aria-label': ariaLabel }: Props) {
    return (
        <button
            type="button"
            aria-label={ariaLabel}
            onClick={onClick}
            className="fixed z-30 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform hover:scale-105 active:scale-95"
            style={{
                bottom: 'calc(env(safe-area-inset-bottom) + 88px)',
                right: 'max(20px, calc((100vw - 448px) / 2 + 16px))',
            }}
        >
            <Plus className="h-6 w-6" strokeWidth={2.4} />
        </button>
    );
}
