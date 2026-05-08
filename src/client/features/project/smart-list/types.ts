export type SmartListItem = {
    id: string;
    listId: string;
    name: string;
    /** Optional emoji shown alongside the name. Empty/undefined = no emoji. */
    emoji?: string;
    quantity_left: number;
    consumption_per_day: number;
    /** Optional quick-pick amounts shown in the Restock dialog. */
    restock_presets?: number[];
    created_at: number;
    updated_at: number;
};

export type ItemStatus = 'OUT' | 'BUY_SOON' | 'OK';
