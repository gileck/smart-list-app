export type SmartListItem = {
    id: string;
    listId: string;
    name: string;
    quantity_total: number;
    quantity_left: number;
    consumption_per_day: number;
    restock_amount: number;
    created_at: number;
    updated_at: number;
};

export type ItemStatus = 'OUT' | 'BUY_SOON' | 'OK';
