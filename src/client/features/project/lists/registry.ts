import { ShoppingCart, Brush, type LucideIcon } from 'lucide-react';
import type { ListTypeId } from './types';

export type ListTypeDef = {
    id: ListTypeId;
    label: string;
    description: string;
    icon: LucideIcon;
};

export const LIST_TYPES: Record<ListTypeId, ListTypeDef> = {
    shopping: {
        id: 'shopping',
        label: 'Shopping List',
        description: 'Track items, daily usage, and restocks',
        icon: ShoppingCart,
    },
    chore: {
        id: 'chore',
        label: 'Chore List',
        description: 'Recurring tasks with due-date tracking',
        icon: Brush,
    },
};

export const LIST_TYPE_OPTIONS: ListTypeDef[] = Object.values(LIST_TYPES);

export function getListType(id: ListTypeId): ListTypeDef {
    return LIST_TYPES[id];
}
