/* eslint-disable restrict-api-routes/no-direct-api-routes */
/**
 * Vercel Cron handler — fires every hour at :00 (configured in vercel.json).
 * For each enabled notification config, decides whether it's due now (based
 * on the user's tz + hourOfDay + frequency, and lastSentAt), then dispatches
 * via the configured channels.
 *
 * Auth: Vercel sends `Authorization: Bearer ${CRON_SECRET}` automatically when
 * CRON_SECRET is set as a project env var.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { notifications } from '@/server/database';
import { dispatchNotification } from '@/apis/project/notifications/shared';
import type { NotificationConfigDoc } from '@/server/database/collections/project/notifications/types';

function getHourInTimezone(date: Date, timezone: string): number {
    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour12: false,
            hour: 'numeric',
        });
        const part = formatter.formatToParts(date).find((p) => p.type === 'hour');
        return part ? parseInt(part.value, 10) % 24 : 0;
    } catch {
        return date.getUTCHours();
    }
}

function getDayOfWeekInTimezone(date: Date, timezone: string): number {
    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            weekday: 'short',
        });
        const part = formatter.formatToParts(date).find((p) => p.type === 'weekday');
        const map: Record<string, number> = {
            Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
        };
        return part ? map[part.value] ?? 0 : 0;
    } catch {
        return date.getUTCDay();
    }
}

function getDateInTimezone(date: Date, timezone: string): string {
    try {
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
        return formatter.format(date);
    } catch {
        return date.toISOString().slice(0, 10);
    }
}

function isDue(config: NotificationConfigDoc, now: Date): boolean {
    if (!config.enabled) return false;
    const tz = config.schedule.timezone;
    const currentHour = getHourInTimezone(now, tz);
    if (currentHour < config.schedule.hourOfDay) return false;
    if (config.schedule.frequency === 'weekly') {
        const today = getDayOfWeekInTimezone(now, tz);
        if (!config.schedule.daysOfWeek?.includes(today)) return false;
    }
    if (config.lastSentAt) {
        const lastDay = getDateInTimezone(config.lastSentAt, tz);
        const todayDay = getDateInTimezone(now, tz);
        if (lastDay === todayDay) return false;
    }
    return true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const secret = process.env.CRON_SECRET;
    if (secret) {
        const auth = req.headers.authorization;
        if (auth !== `Bearer ${secret}`) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    const now = new Date();
    let processed = 0;
    let sent = 0;
    let skipped = 0;
    const errors: Array<{ id: string; error: string }> = [];

    try {
        const all = await notifications.findEnabled();
        for (const config of all) {
            processed++;
            if (!isDue(config, now)) {
                skipped++;
                continue;
            }
            try {
                const userIdObj =
                    typeof config.userId === 'string'
                        ? new ObjectId(config.userId)
                        : config.userId;
                const result = await dispatchNotification(config, userIdObj);
                if ('error' in result) {
                    errors.push({ id: String(config._id), error: result.error });
                    continue;
                }
                if (result.sentChannels.length > 0 || result.isEmpty) {
                    await notifications.updateLastSent(config._id, now);
                    if (result.sentChannels.length > 0) sent++;
                }
                if (result.failures.length > 0) {
                    errors.push({
                        id: String(config._id),
                        error: result.failures.map((f) => `${f.channel}:${f.error}`).join(', '),
                    });
                }
            } catch (e) {
                errors.push({
                    id: String(config._id),
                    error: e instanceof Error ? e.message : String(e),
                });
            }
        }
        return res.status(200).json({ ok: true, processed, sent, skipped, errors });
    } catch (e) {
        console.error('cron error', e);
        return res
            .status(500)
            .json({ error: e instanceof Error ? e.message : 'cron failed' });
    }
}
