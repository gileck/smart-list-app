import type { ItemStatus, SmartListItem } from './types';

export function genId(): string {
    return 'item_' + Math.random().toString(36).slice(2, 10);
}

export function daysLeft(item: SmartListItem): number {
    if (item.consumption_per_day <= 0) return Infinity;
    return item.quantity_left / item.consumption_per_day;
}

export function daysLeftDisplay(item: SmartListItem): number | '∞' {
    if (item.consumption_per_day <= 0) return '∞';
    return Math.max(0, Math.ceil(daysLeft(item)));
}

export function status(item: SmartListItem): ItemStatus {
    if (item.consumption_per_day <= 0) return 'OK';
    if (item.quantity_left <= 0) return 'OUT';
    return daysLeft(item) <= 2 ? 'BUY_SOON' : 'OK';
}

export function compareUrgency(a: SmartListItem, b: SmartListItem): number {
    return daysLeft(a) - daysLeft(b);
}

export function makeSampleItems(listId: string): SmartListItem[] {
    const now = Date.now();
    const base = (overrides: Partial<SmartListItem>): SmartListItem => ({
        id: genId(),
        listId,
        name: '',
        quantity_total: 0,
        quantity_left: 0,
        consumption_per_day: 0,
        restock_amount: 0,
        created_at: now,
        updated_at: now,
        ...overrides,
    });
    return [
        base({ name: 'Eggs', quantity_total: 24, quantity_left: 6, consumption_per_day: 3, restock_amount: 24 }),
        base({ name: 'Oranges', quantity_total: 6, quantity_left: 1, consumption_per_day: 1, restock_amount: 6 }),
        base({ name: 'Coffee', quantity_total: 250, quantity_left: 210, consumption_per_day: 14, restock_amount: 250 }),
        base({ name: 'Rice', quantity_total: 1000, quantity_left: 600, consumption_per_day: 60, restock_amount: 1000 }),
        base({ name: 'Olive Oil', quantity_total: 500, quantity_left: 480, consumption_per_day: 15, restock_amount: 500 }),
    ];
}
