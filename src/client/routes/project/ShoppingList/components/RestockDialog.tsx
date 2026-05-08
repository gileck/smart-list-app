import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/client/components/template/ui/dialog';
import { Button } from '@/client/components/template/ui/button';
import { RoundIconButton } from '@/client/components/project/list-ui';
import type { SmartListItem } from '@/client/features';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: SmartListItem | null;
    onRestock: (amount: number) => void;
};

const CUSTOM_INITIAL = 1;

export function RestockDialog({ open, onOpenChange, item, onRestock }: Props) {
    // eslint-disable-next-line state-management/prefer-state-architecture -- text input
    const [customAmount, setCustomAmount] = useState(String(CUSTOM_INITIAL));

    useEffect(() => {
        if (open) {
            setCustomAmount(String(CUSTOM_INITIAL));
        }
    }, [open]);

    if (!item) return null;

    const presetButtons =
        item.restock_presets && item.restock_presets.length > 0
            ? item.restock_presets
            : [1];

    const parsed = parseFloat(customAmount);
    const canSubmitCustom = !Number.isNaN(parsed) && parsed > 0;

    const submit = (amount: number) => {
        onRestock(amount);
        onOpenChange(false);
    };

    const step = (delta: number) => {
        const base = Number.isNaN(parsed) ? 0 : parsed;
        const next = Math.max(1, base + delta);
        setCustomAmount(String(next));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Restock {item.emoji ? `${item.emoji} ` : ''}
                        {item.name}
                    </DialogTitle>
                    <DialogDescription>
                        Currently {Math.max(0, item.quantity_left)} left. Add what you bought.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-5">
                    {presetButtons.length > 0 && (
                        <div className="flex flex-col gap-2">
                            {presetButtons.map((amount) => (
                                <Button
                                    key={amount}
                                    size="lg"
                                    onClick={() => submit(amount)}
                                    className="w-full"
                                >
                                    Add {amount}
                                </Button>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                            Custom amount
                        </span>
                        <div className="flex items-center justify-center gap-3">
                            <RoundIconButton
                                aria-label="Decrease amount"
                                onClick={() => step(-1)}
                                disabled={canSubmitCustom && parsed <= 1}
                            >
                                <Minus className="h-4 w-4" />
                            </RoundIconButton>
                            <input
                                type="number"
                                inputMode="decimal"
                                min="1"
                                value={customAmount}
                                onChange={(e) => setCustomAmount(e.target.value)}
                                aria-label="Custom restock amount"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && canSubmitCustom) {
                                        e.preventDefault();
                                        submit(parsed);
                                    }
                                }}
                                className="h-11 w-24 rounded-xl border border-border bg-background px-3 text-center font-mono text-lg font-medium tracking-tight outline-none transition-colors focus:border-foreground"
                            />
                            <RoundIconButton
                                aria-label="Increase amount"
                                onClick={() => step(1)}
                            >
                                <Plus className="h-4 w-4" />
                            </RoundIconButton>
                        </div>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => canSubmitCustom && submit(parsed)}
                            disabled={!canSubmitCustom}
                            className="w-full"
                        >
                            Add {canSubmitCustom ? parsed : ''}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
