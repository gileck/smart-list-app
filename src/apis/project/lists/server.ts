export * from './index';

import { API_GET_LISTS, API_CREATE_LIST, API_UPDATE_LIST, API_DELETE_LIST } from './index';
import { getLists } from './handlers/getLists';
import { createList } from './handlers/createList';
import { updateList } from './handlers/updateList';
import { deleteList } from './handlers/deleteList';

export const listsApiHandlers = {
    [API_GET_LISTS]: { process: getLists },
    [API_CREATE_LIST]: { process: createList },
    [API_UPDATE_LIST]: { process: updateList },
    [API_DELETE_LIST]: { process: deleteList },
};
