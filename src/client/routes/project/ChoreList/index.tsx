import { AddEditChore } from './AddEditChore';

export { ChoreListView } from './ChoreListView';
export { ChoreDetail } from './ChoreDetail';
export const AddChoreRoute = () => <AddEditChore mode="add" />;
export const EditChoreRoute = () => <AddEditChore mode="edit" />;
