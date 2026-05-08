import { ObjectId } from 'mongodb';
import { toQueryId, toStringId } from '@/server/template/utils';
import { smartLists, shoppingItems } from '@/server/database';
import { API_GET_LISTS, type ApiHandlerContext, type GetListsRequest, type GetListsResponse } from '..';

function startOfToday(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

const SAMPLE_ITEMS: Array<{
    name: string;
    emoji?: string;
    quantity_left: number;
    consumption_per_day: number;
    restock_presets?: number[];
}> = [
    { name: 'Eggs', emoji: '🥚', quantity_left: 6, consumption_per_day: 3, restock_presets: [12, 24, 30] },
    { name: 'Oranges', emoji: '🍊', quantity_left: 1, consumption_per_day: 1, restock_presets: [6] },
    { name: 'Coffee', emoji: '☕', quantity_left: 210, consumption_per_day: 14, restock_presets: [250, 500] },
    { name: 'Rice', emoji: '🍚', quantity_left: 3, consumption_per_day: 0.2, restock_presets: [1, 2] },
    { name: 'Olive Oil', emoji: '🫒', quantity_left: 480, consumption_per_day: 15, restock_presets: [500, 1000] },
];

export const getLists = async (
    _request: GetListsRequest,
    context: ApiHandlerContext
): Promise<GetListsResponse> => {
    try {
        if (!context.userId) {
            return { error: 'Not authenticated' };
        }
        const userId = toQueryId(context.userId) as ObjectId;
        const existing = await smartLists.findListsByUserId(userId);

        if (existing.length === 0) {
            const now = new Date();
            const seeded = await smartLists.createList({
                userId,
                name: 'Shopping List',
                type: 'shopping',
                createdAt: now,
                updatedAt: now,
            });

            const today = startOfToday();
            await Promise.all(
                SAMPLE_ITEMS.map((sample) =>
                    shoppingItems.createItem({
                        userId,
                        listId: seeded._id,
                        name: sample.name,
                        emoji: sample.emoji,
                        quantityLeft: sample.quantity_left,
                        consumptionPerDay: sample.consumption_per_day,
                        restockPresets: sample.restock_presets,
                        lastConsumptionAt: today,
                        createdAt: now,
                        updatedAt: now,
                    })
                )
            );

            return {
                lists: [
                    {
                        id: toStringId(seeded._id),
                        name: seeded.name,
                        type: seeded.type,
                        created_at: seeded.createdAt.getTime(),
                        updated_at: seeded.updatedAt.getTime(),
                    },
                ],
            };
        }

        return {
            lists: existing.map((l) => ({
                id: toStringId(l._id),
                name: l.name,
                type: l.type,
                created_at: l.createdAt.getTime(),
                updated_at: l.updatedAt.getTime(),
            })),
        };
    } catch (error) {
        console.error('getLists error', error);
        return { error: error instanceof Error ? error.message : 'Failed to load lists' };
    }
};

export { API_GET_LISTS };
