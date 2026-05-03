export type Chore = {
    id: string;
    listId: string;
    name: string;
    repeat_interval_days: number;
    /** Start-of-day timestamp (ms) of last completion. null = never completed yet. */
    last_completed_at: number | null;
    created_at: number;
    updated_at: number;
};

export type ChoreStatus = 'OVERDUE' | 'DUE_TODAY' | 'DUE_SOON' | 'OK';
