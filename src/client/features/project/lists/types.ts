export type ListTypeId = 'shopping' | 'chore';

export type List = {
    id: string;
    name: string;
    type: ListTypeId;
    created_at: number;
    updated_at: number;
};
