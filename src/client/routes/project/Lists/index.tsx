import { AddEditList } from './AddEditList';

export { Lists } from './Lists';
export const AddListRoute = () => <AddEditList mode="add" />;
export const EditListRoute = () => <AddEditList mode="edit" />;
