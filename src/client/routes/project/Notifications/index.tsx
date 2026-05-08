import { AddEditNotification } from './AddEditNotification';

export { Notifications } from './Notifications';
export const AddNotificationRoute = () => <AddEditNotification mode="add" />;
export const EditNotificationRoute = () => <AddEditNotification mode="edit" />;
