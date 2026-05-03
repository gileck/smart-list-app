import { AddEditItem } from './AddEditItem';

export { ShoppingListView } from './ShoppingListView';
export { ItemDetail } from './ItemDetail';
export const AddItemRoute = () => <AddEditItem mode="add" />;
export const EditItemRoute = () => <AddEditItem mode="edit" />;
