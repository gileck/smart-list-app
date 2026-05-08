import type { ChoreClient, ChoreDoc } from '@/server/database/collections/project/chores/types';
import { toStringId } from '@/server/template/utils';

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

export function clampLastCompleted(value: number | null): Date | null {
    if (value == null) return null;
    const today = startOfToday();
    const day = startOfDay(new Date(value));
    return day.getTime() > today.getTime() ? today : day;
}

export function toChoreClient(doc: ChoreDoc): ChoreClient {
    return {
        id: toStringId(doc._id),
        listId: toStringId(doc.listId),
        name: doc.name,
        repeat_interval_days: doc.repeatIntervalDays ?? 1,
        last_completed_at: doc.lastCompletedAt ? doc.lastCompletedAt.getTime() : null,
        created_at: doc.createdAt?.getTime() ?? Date.now(),
        updated_at: doc.updatedAt?.getTime() ?? Date.now(),
    };
}
