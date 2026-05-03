import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/client/components/template/ui/dialog';
import { Button } from '@/client/components/template/ui/button';
import type { SmartListItem } from '@/client/features';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: SmartListItem | null;
    onRestock: (amount: number) => void;
};

export function RestockDialog({ open, onOpenChange, item, onRestock }: Props) {
    const defaultAmount = item?.restock_amount ?? 0;

    // eslint-disable-next-line state-management/prefer-state-architecture -- text input
    const [customAmount, setCustomAmount] = useState(String(defaultAmount));

    useEffect(() => {
        if (open) {
            setCustomAmount(String(defaultAmount));
        }
    }, [open, defaultAmount]);

    if (!item) return null;

    const parsed = parseFloat(customAmount);
    const canSubmitCustom = !Number.isNaN(parsed) && parsed > 0;

    const submit = (amount: number) => {
        onRestock(amount);
        onOpenChange(false);
    };

    const currentLeft = Math.max(0, item.quantity_left);
    const previewTotal = canSubmitCustom ? currentLeft + parsed : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Restock {item.name}</DialogTitle>
                    <DialogDescription>
                        Currently {currentLeft} left. Add what you bought.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    {defaultAmount > 0 && (
                        <Button
                            size="lg"
                            onClick={() => submit(defaultAmount)}
                            className="w-full"
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Add default (+{defaultAmount}) → {currentLeft + defaultAmount}
                        </Button>
                    )}

                    <div className="flex flex-col gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                            Custom amount
                        </span>
                        <div className="flex items-stretch gap-2">
                            <input
                                type="number"
                                inputMode="decimal"
                                min="0"
                                value={customAmount}
                                onChange={(e) => setCustomAmount(e.target.value)}
                                aria-label="Custom restock amount"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && canSubmitCustom) {
                                        e.preventDefault();
                                        submit(parsed);
                                    }
                                }}
                                className="h-11 flex-1 min-w-0 rounded-xl border border-border bg-background px-4 text-base font-medium tracking-tight outline-none transition-colors focus:border-foreground"
                            />
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => canSubmitCustom && submit(parsed)}
                                disabled={!canSubmitCustom}
                                className="shrink-0"
                            >
                                Add
                            </Button>
                        </div>
                        <p className="text-xs italic text-muted-foreground/70">
                            {previewTotal !== null
                                ? `${currentLeft} + ${parsed} = ${previewTotal}`
                                : 'Enter a quantity to add'}
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
