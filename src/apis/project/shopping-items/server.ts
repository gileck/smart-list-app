export * from './index';

import {
    API_GET_ITEMS,
    API_CREATE_ITEM,
    API_UPDATE_ITEM,
    API_DELETE_ITEM,
    API_RESTOCK_ITEM,
} from './index';
import { getItems } from './handlers/getItems';
import { createItem } from './handlers/createItem';
import { updateItem } from './handlers/updateItem';
import { deleteItem } from './handlers/deleteItem';
import { restockItem } from './handlers/restockItem';

export const shoppingItemsApiHandlers = {
    [API_GET_ITEMS]: { process: getItems },
    [API_CREATE_ITEM]: { process: createItem },
    [API_UPDATE_ITEM]: { process: updateItem },
    [API_DELETE_ITEM]: { process: deleteItem },
    [API_RESTOCK_ITEM]: { process: restockItem },
};
