import { ObjectId } from 'mongodb';
import { toQueryId, toStringId } from '@/server/template/utils';
import { restockEvents } from '@/server/database';
import {
    API_GET_RESTOCK_HISTORY,
    type ApiHandlerContext,
    type GetRestockHistoryRequest,
    type GetRestockHistoryResponse,
} from '..';
import type {
    RestockEventClient,
    RestockEventDoc,
} from '@/server/database/collections/project/restock-events/types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toClient(doc: RestockEventDoc): RestockEventClient {
    return {
        id: toStringId(doc._id),
        itemId: toStringId(doc.itemId),
        listId: toStringId(doc.listId),
        amount: doc.amount,
        quantity_left_before: doc.quantityLeftBefore,
        restocked_at: doc.restockedAt.getTime(),
    };
}

/**
 * Observed daily rate: total amount restocked between the *first* and
 * *last* event in the window, divided by the elapsed days. Each restock
 * roughly equals the amount consumed since the previous restock (assuming
 * the user restocks when low, which is the common case).
 *
 * Returns null when there are fewer than 2 events or the elapsed window
 * is too short (< 1 day) for a meaningful rate.
 */
function computeObservedPerDay(events: RestockEventDoc[]): number | null {
    if (events.length < 2) return null;
    // events are returned newest-first; sort ascending for the math.
    const sorted = [...events].sort(
        (a, b) => a.restockedAt.getTime() - b.restockedAt.getTime()
    );
    const first = sorted[0].restockedAt.getTime();
    const last = sorted[sorted.length - 1].restockedAt.getTime();
    const elapsedDays = (last - first) / MS_PER_DAY;
    if (elapsedDays < 1) return null;
    // Sum amounts of all events except the very first (those represent
    // refills consumed since the prior restock).
    const consumed = sorted.slice(1).reduce((sum, ev) => sum + ev.amount, 0);
    if (consumed <= 0) return null;
    return consumed / elapsedDays;
}

export const getRestockHistory = async (
    request: GetRestockHistoryRequest,
    context: ApiHandlerContext
): Promise<GetRestockHistoryResponse> => {
    try {
        if (!context.userId) return { error: 'Not authenticated' };
        if (!request.itemId) return { error: 'itemId is required' };
        const userId = toQueryId(context.userId) as ObjectId;
        const docs = await restockEvents.findByItemId(request.itemId, userId, 50);
        return {
            events: docs.map(toClient),
            observedPerDay: computeObservedPerDay(docs),
        };
    } catch (error) {
        console.error('getRestockHistory error', error);
        return {
            error:
                error instanceof Error ? error.message : 'Failed to load restock history',
        };
    }
};

export { API_GET_RESTOCK_HISTORY };
