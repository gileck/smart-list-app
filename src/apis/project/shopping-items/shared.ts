import type { ShoppingItemClient, ShoppingItemDoc } from '@/server/database/collections/project/shopping-items/types';
import { toStringId } from '@/server/template/utils';

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function startOfToday(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

export function startOfDay(d: Date): Date {
    const r = new Date(d);
    r.setHours(0, 0, 0, 0);
    return r;
}

export function toItemClient(doc: ShoppingItemDoc): ShoppingItemClient {
    return {
        id: toStringId(doc._id),
        listId: toStringId(doc.listId),
        name: doc.name,
        emoji: doc.emoji,
        quantity_left: doc.quantityLeft ?? 0,
        consumption_per_day: doc.consumptionPerDay ?? 0,
        restock_presets: doc.restockPresets,
        created_at: doc.createdAt?.getTime() ?? Date.now(),
        updated_at: doc.updatedAt?.getTime() ?? Date.now(),
    };
}

export function normalizeEmoji(value: string | undefined): string | undefined {
    if (!value) return undefined;
    const trimmed = value.trim().slice(0, 8);
    return trimmed.length > 0 ? trimmed : undefined;
}

export function normalizePresets(presets: number[] | undefined): number[] | undefined {
    if (!presets) return undefined;
    const cleaned = Array.from(
        new Set(presets.map((n) => Math.floor(n)).filter((n) => Number.isFinite(n) && n > 0))
    ).sort((a, b) => a - b);
    return cleaned.length > 0 ? cleaned : undefined;
}
