import { MS_PER_DAY, startOfDay, startOfToday } from '../_shared/date';
import type { Chore, ChoreStatus } from './types';

export { MS_PER_DAY, startOfDay, startOfToday };
export const DUE_SOON_THRESHOLD_DAYS = 2;

export function genId(): string {
    return 'chore_' + Math.random().toString(36).slice(2, 10);
}

export function nextDueAt(chore: Chore): number {
    const base = chore.last_completed_at
        ? startOfDay(chore.last_completed_at)
        : startOfToday();
    return base + chore.repeat_interval_days * MS_PER_DAY;
}

export function daysUntilDue(chore: Chore): number {
    if (!chore.last_completed_at) return 0; // never done → due today
    return Math.round((nextDueAt(chore) - startOfToday()) / MS_PER_DAY);
}

export function status(chore: Chore): ChoreStatus {
    const d = daysUntilDue(chore);
    if (d < 0) return 'OVERDUE';
    if (d === 0) return 'DUE_TODAY';
    if (d <= DUE_SOON_THRESHOLD_DAYS) return 'DUE_SOON';
    return 'OK';
}

/**
 * Lower tuple sorts first.
 * 1. Overdue first (most overdue → smallest daysUntil)
 * 2. Due today
 * 3. Due soon (closest first)
 * 4. OK (furthest first)
 */
export function urgencySortKey(chore: Chore): [number, number] {
    const d = daysUntilDue(chore);
    if (d < 0) return [0, d];
    if (d === 0) return [1, 0];
    if (d <= DUE_SOON_THRESHOLD_DAYS) return [2, d];
    return [3, -d];
}

export function compareUrgency(a: Chore, b: Chore): number {
    const ka = urgencySortKey(a);
    const kb = urgencySortKey(b);
    return ka[0] - kb[0] || ka[1] - kb[1];
}

export function isAttention(s: ChoreStatus): boolean {
    return s !== 'OK';
}

export function formatDaysLabel(daysUntil: number): string {
    if (daysUntil < 0) {
        const n = -daysUntil;
        return `Overdue by ${n} day${n !== 1 ? 's' : ''}`;
    }
    if (daysUntil === 0) return 'Due today';
    return `Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
}
