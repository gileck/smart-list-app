import type { ItemStatus, SmartListItem } from './types';

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
