import { ObjectId } from 'mongodb';
import { toStringId } from '@/server/template/utils';
import { chores, shoppingItems, smartLists } from '@/server/database';
import { sendPushToUser } from '@/server/template/push';
import { sendTelegramNotificationToUser } from '@/server/template/telegram';
import type { ListDoc } from '@/server/database/collections/project/lists/types';
import type { ShoppingItemDoc } from '@/server/database/collections/project/shopping-items/types';
import type { ChoreDoc } from '@/server/database/collections/project/chores/types';
import type {
    NotificationChannel,
    NotificationConfigClient,
    NotificationConfigDoc,
} from '@/server/database/collections/project/notifications/types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): Date {
    const r = new Date(d);
    r.setHours(0, 0, 0, 0);
    return r;
}

function startOfToday(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

function shoppingDaysLeft(item: ShoppingItemDoc): number {
    if (item.consumptionPerDay <= 0) return Infinity;
    return item.quantityLeft / item.consumptionPerDay;
}

function choreDaysUntilDue(c: ChoreDoc): number {
    if (!c.lastCompletedAt) return 0;
    const next = startOfDay(c.lastCompletedAt).getTime() + c.repeatIntervalDays * MS_PER_DAY;
    return Math.round((next - startOfToday().getTime()) / MS_PER_DAY);
}

function formatNumber(n: number): string {
    if (Number.isInteger(n)) return String(n);
    return n.toFixed(1).replace(/\.0$/, '');
}

function formatChoreDays(d: number): string {
    if (d < 0) return `overdue ${-d}d`;
    if (d === 0) return 'today';
    return `${d}d`;
}

export interface BuiltMessage {
    title: string;
    body: string;
    isEmpty: boolean;
}

export async function buildMessage(
    config: NotificationConfigDoc | NotificationConfigClient,
    userIdObj: ObjectId
): Promise<BuiltMessage | { error: string }> {
    const listIdRaw = (config as NotificationConfigDoc).listId ?? (config as NotificationConfigClient).listId;
    const list: ListDoc | null = await smartLists.findListById(listIdRaw, userIdObj);
    if (!list) return { error: 'List not found' };

    const threshold = config.filter.daysThreshold;
    const title = list.name;

    if (config.filter.type === 'shopping_below_days' && list.type === 'shopping') {
        const items = await shoppingItems.findItemsByUserId(userIdObj);
        const own = items.filter((i) => toStringId(i.listId) === toStringId(list._id));
        const matches = own
            .filter((i) => i.consumptionPerDay > 0 && shoppingDaysLeft(i) <= threshold)
            .sort((a, b) => shoppingDaysLeft(a) - shoppingDaysLeft(b));
        if (matches.length === 0) {
            return { title, body: '', isEmpty: true };
        }
        const lines = matches.map((i) => {
            const days = Math.max(0, Math.ceil(shoppingDaysLeft(i)));
            const emoji = i.emoji ? `${i.emoji} ` : '';
            return `${emoji}${i.name} — ${formatNumber(i.quantityLeft)} left, ${days}d`;
        });
        return { title, body: lines.join('\n'), isEmpty: false };
    }

    if (config.filter.type === 'chore_due_within' && list.type === 'chore') {
        const list_chores = await chores.findChoresByUserId(userIdObj);
        const own = list_chores.filter((c) => toStringId(c.listId) === toStringId(list._id));
        const matches = own
            .map((c) => ({ chore: c, daysUntil: choreDaysUntilDue(c) }))
            .filter(({ daysUntil }) => daysUntil <= threshold)
            .sort((a, b) => a.daysUntil - b.daysUntil);
        if (matches.length === 0) {
            return { title, body: '', isEmpty: true };
        }
        const lines = matches.map(
            ({ chore, daysUntil }) => `• ${chore.name} — ${formatChoreDays(daysUntil)}`
        );
        return { title, body: lines.join('\n'), isEmpty: false };
    }

    return {
        error: `Filter ${config.filter.type} doesn't match list type ${list.type}`,
    };
}

export interface DispatchResult {
    sentChannels: NotificationChannel[];
    failures: Array<{ channel: NotificationChannel; error: string }>;
    isEmpty: boolean;
    message?: string;
    title?: string;
}

function getAppBaseUrl(): string {
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
        return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }
    return 'http://localhost:3000';
}

export async function dispatchNotification(
    config: NotificationConfigDoc | NotificationConfigClient,
    userIdObj: ObjectId,
    options: { allowEmpty?: boolean; testPrefix?: string } = {}
): Promise<DispatchResult | { error: string }> {
    const built = await buildMessage(config, userIdObj);
    if ('error' in built) return built;

    if (built.isEmpty && !options.allowEmpty) {
        return { sentChannels: [], failures: [], isEmpty: true };
    }

    const titlePrefix = options.testPrefix ?? '';
    const finalTitle = `${titlePrefix}${built.title}`.trim();
    const finalBody = built.isEmpty ? 'All caught up ✓' : built.body;
    const userIdStr = userIdObj.toString();

    const listIdStr = toStringId(
        (config as NotificationConfigDoc).listId ??
            (config as NotificationConfigClient).listId
    );
    const listPath = `/lists/${listIdStr}`;
    const fullUrl = `${getAppBaseUrl()}${listPath}`;

    const sentChannels: NotificationChannel[] = [];
    const failures: { channel: NotificationChannel; error: string }[] = [];

    for (const channel of config.channels) {
        if (channel === 'push') {
            try {
                const results = await sendPushToUser(userIdStr, {
                    title: finalTitle,
                    body: finalBody,
                    url: listPath,
                });
                if (results.length === 0) {
                    failures.push({ channel, error: 'No push subscriptions for user' });
                } else {
                    sentChannels.push(channel);
                }
            } catch (e) {
                failures.push({
                    channel,
                    error: e instanceof Error ? e.message : 'push failed',
                });
            }
        } else if (channel === 'telegram') {
            // Telegram doesn't surface a title separately, so include it
            // in the body. URL is appended as a tappable line.
            const telegramBody = `${finalTitle}\n\n${finalBody}\n\n👉 ${fullUrl}`;
            const result = await sendTelegramNotificationToUser(userIdStr, telegramBody);
            if (result.success) sentChannels.push(channel);
            else failures.push({ channel, error: result.error ?? 'telegram failed' });
        }
    }

    return {
        sentChannels,
        failures,
        isEmpty: built.isEmpty,
        message: finalBody,
        title: finalTitle,
    };
}

export function toClient(doc: NotificationConfigDoc): NotificationConfigClient {
    return {
        id: toStringId(doc._id),
        listId: toStringId(doc.listId),
        name: doc.name,
        schedule: doc.schedule,
        filter: doc.filter,
        channels: doc.channels,
        enabled: doc.enabled,
        last_sent_at: doc.lastSentAt ? doc.lastSentAt.getTime() : null,
        created_at: doc.createdAt?.getTime() ?? Date.now(),
        updated_at: doc.updatedAt?.getTime() ?? Date.now(),
    };
}
