export * from './index';

import {
    API_GET_CHORES,
    API_CREATE_CHORE,
    API_UPDATE_CHORE,
    API_DELETE_CHORE,
    API_MARK_CHORE_DONE,
} from './index';
import { getChores } from './handlers/getChores';
import { createChore } from './handlers/createChore';
import { updateChore } from './handlers/updateChore';
import { deleteChore } from './handlers/deleteChore';
import { markChoreDone } from './handlers/markChoreDone';

export const choresApiHandlers = {
    [API_GET_CHORES]: { process: getChores },
    [API_CREATE_CHORE]: { process: createChore },
    [API_UPDATE_CHORE]: { process: updateChore },
    [API_DELETE_CHORE]: { process: deleteChore },
    [API_MARK_CHORE_DONE]: { process: markChoreDone },
};
