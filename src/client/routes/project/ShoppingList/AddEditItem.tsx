import { useMemo, useState } from 'react';
import { ChevronLeft, Plus, X } from 'lucide-react';
import { Button } from '@/client/components/template/ui/button';
import { toast } from '@/client/components/template/ui/toast';
import { useRouter, useSmartListStore } from '@/client/features';
import { NotFoundCard, RoundIconButton } from '@/client/components/project/list-ui';

type Props = {
    mode: 'add' | 'edit';
};

export function AddEditItem({ mode }: Props) {
    const { navigate, routeParams } = useRouter();
    const isEdit = mode === 'edit';
    const listId = routeParams.listId;
    const itemId = isEdit ? routeParams.itemId : null;

    const items = useSmartListStore((s) => s.items);
    const addItem = useSmartListStore((s) => s.addItem);
    const updateItem = useSmartListStore((s) => s.updateItem);

    const editItem = useMemo(
        () => (itemId ? items.find((i) => i.id === itemId) ?? null : null),
        [items, itemId]
    );

    // eslint-disable-next-line state-management/prefer-state-architecture -- text input
    const [name, setName] = useState(editItem?.name ?? '');
    // eslint-disable-next-line state-management/prefer-state-architecture -- text input
    const [emoji, setEmoji] = useState(editItem?.emoji ?? '');
    // eslint-disable-next-line state-management/prefer-state-architecture -- text input
    const [qtyLeft, setQtyLeft] = useState(editItem ? String(editItem.quantity_left) : '');
    // eslint-disable-next-line state-management/prefer-state-architecture -- text input
    const [perDay, setPerDay] = useState(editItem ? String(editItem.consumption_per_day) : '');
    // eslint-disable-next-line state-management/prefer-state-architecture -- form-local list mirrored to a single saved field on submit
    const [presets, setPresets] = useState<number[]>(editItem?.restock_presets ?? []);
    // eslint-disable-next-line state-management/prefer-state-architecture -- text input
    const [presetInput, setPresetInput] = useState('');

    const parsedPreset = parseFloat(presetInput);
    const canAddPreset =
        !Number.isNaN(parsedPreset) &&
        parsedPreset > 0 &&
        Number.isFinite(parsedPreset) &&
        !presets.includes(Math.floor(parsedPreset));

    const addPreset = () => {
        if (!canAddPreset) return;
        const next = Math.floor(parsedPreset);
        setPresets([...presets, next].sort((a, b) => a - b));
        setPresetInput('');
    };

    const removePreset = (value: number) => {
        setPresets(presets.filter((p) => p !== value));
    };

    const parsedLeft = parseFloat(qtyLeft);
    const parsedPerDay = parseFloat(perDay);

    const daysPreview =
        !Number.isNaN(parsedPerDay) &&
        parsedPerDay > 0 &&
        !Number.isNaN(parsedLeft) &&
        parsedLeft >= 0
            ? Math.max(0, Math.ceil(parsedLeft / parsedPerDay))
            : null;

    const canSave =
        name.trim().length > 0 &&
        !Number.isNaN(parsedLeft) &&
        parsedLeft >= 0 &&
        !Number.isNaN(parsedPerDay) &&
        parsedPerDay >= 0;

    const effectiveListId = listId ?? editItem?.listId;

    const goBack = () => {
        if (isEdit && itemId && effectiveListId) {
            navigate(`/lists/${effectiveListId}/items/${itemId}`);
        } else if (effectiveListId) {
            navigate(`/lists/${effectiveListId}`);
        } else {
            navigate('/');
        }
    };

    const handleSave = () => {
        if (!canSave || !effectiveListId) return;
        const trimmedName = name.trim();

        if (isEdit && editItem) {
            updateItem(editItem.id, {
                name: trimmedName,
                emoji,
                quantity_left: parsedLeft,
                consumption_per_day: parsedPerDay,
                restock_presets: presets,
            });
            toast.success(`${trimmedName} updated`);
            navigate(`/lists/${effectiveListId}/items/${editItem.id}`);
            return;
        }

        addItem({
            listId: effectiveListId,
            name: trimmedName,
            emoji,
            quantity_left: parsedLeft,
            consumption_per_day: parsedPerDay,
            restock_presets: presets,
        });
        toast.success(`${trimmedName} added`);
        navigate(`/lists/${effectiveListId}`);
    };

    if (isEdit && !editItem) {
        return (
            <NotFoundCard
                message="Item not found."
                onBack={() => navigate('/')}
                backLabel="Back to list"
            />
        );
    }

    return (
        <div className="mx-auto w-full max-w-md pb-24">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <header className="flex items-center gap-3 px-5 pt-5 pb-4">
                    <RoundIconButton aria-label="Back" onClick={goBack}>
                        <ChevronLeft className="h-4 w-4" />
                    </RoundIconButton>
                    <h1 className="flex-1 text-[17px] font-semibold tracking-tight">
                        {isEdit ? 'Edit Item' : 'Add Item'}
                    </h1>
                </header>

                <div className="border-t border-border pt-2 pb-6">
                <FormField label="Item name">
                    <div className="flex items-end gap-3">
                        <input
                            type="text"
                            value={emoji}
                            onChange={(e) => setEmoji(e.target.value)}
                            aria-label="Emoji"
                            placeholder="🥚"
                            maxLength={8}
                            className="h-12 w-14 shrink-0 rounded-lg border border-border bg-muted/40 text-center text-2xl outline-none transition-colors focus:border-foreground focus:bg-background"
                        />
                        <input
                            autoFocus={!isEdit}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Eggs"
                            className="min-w-0 flex-1 border-0 border-b-2 border-border bg-transparent py-2 text-[22px] font-normal outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground"
                        />
                    </div>
                </FormField>

                <div className="flex">
                    <div className="flex-1 border-r border-border">
                        <FormField label="Quantity Left">
                            <input
                                type="number"
                                inputMode="decimal"
                                min="0"
                                value={qtyLeft}
                                onChange={(e) => setQtyLeft(e.target.value)}
                                placeholder="3"
                                className="w-full border-0 border-b-2 border-border bg-transparent py-2 text-[22px] font-normal outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground"
                            />
                        </FormField>
                    </div>
                    <div className="flex-1">
                        <FormField label="Use per day">
                            <input
                                type="number"
                                inputMode="decimal"
                                min="0"
                                step="0.1"
                                value={perDay}
                                onChange={(e) => setPerDay(e.target.value)}
                                placeholder="0.2"
                                className="w-full border-0 border-b-2 border-border bg-transparent py-2 text-[22px] font-normal outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground"
                            />
                        </FormField>
                    </div>
                </div>

                <div className="px-5 pt-2">
                    <p
                        className={`text-xs h-4 transition-colors ${
                            daysPreview !== null
                                ? 'text-success font-medium'
                                : 'text-muted-foreground/70 italic'
                        }`}
                    >
                        {daysPreview !== null
                            ? `→ ~${daysPreview} day${daysPreview !== 1 ? 's' : ''} until empty`
                            : 'Fill in quantity and daily use to see estimate'}
                    </p>
                </div>

                <div className="mt-6 h-px bg-border" />

                <FormField label="Restock presets (optional)">
                    {presets.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {presets.map((p) => (
                                <span
                                    key={p}
                                    className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 py-1 pl-3 pr-1 text-sm font-medium tracking-tight"
                                >
                                    {p}
                                    <button
                                        type="button"
                                        aria-label={`Remove ${p}`}
                                        onClick={() => removePreset(p)}
                                        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="flex items-stretch gap-2 pt-1">
                        <input
                            type="number"
                            inputMode="numeric"
                            min="1"
                            value={presetInput}
                            onChange={(e) => setPresetInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && canAddPreset) {
                                    e.preventDefault();
                                    addPreset();
                                }
                            }}
                            placeholder="e.g. 12"
                            className="h-10 flex-1 min-w-0 rounded-lg border border-border bg-background px-3 text-base outline-none transition-colors focus:border-foreground"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addPreset}
                            disabled={!canAddPreset}
                        >
                            <Plus className="mr-1.5 h-4 w-4" />
                            Add
                        </Button>
                    </div>
                    <p className="text-xs italic text-muted-foreground/70">
                        Quick-pick amounts shown in the Restock dialog.
                    </p>
                </FormField>

                <div className="mt-6 h-px bg-border" />

                <div className="px-5 pt-6 flex flex-col gap-2.5">
                    <Button
                        size="lg"
                        onClick={handleSave}
                        disabled={!canSave}
                        className="w-full"
                    >
                        {isEdit ? 'Save Changes' : 'Add to List'}
                    </Button>
                    <Button variant="outline" size="lg" onClick={goBack} className="w-full">
                        Cancel
                    </Button>
                </div>
                </div>
            </div>
        </div>
    );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="px-5 pt-5 flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {label}
            </span>
            {children}
        </div>
    );
}
