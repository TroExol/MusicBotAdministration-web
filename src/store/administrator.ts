export interface IAdministrator {
    id?: number;
    fio: string;
    login: string;
}

// *** ACTION TYPES ***
type ADD_ADMINISTRATOR = 'ADD_ADMINISTRATOR';
type DELETE_ADMINISTRATOR = 'DELETE_ADMINISTRATOR';

// *** ACTION INTERFACES ***
interface IAddAdministratorAction {
    type: ADD_ADMINISTRATOR;
    administrator: IAdministrator;
}

interface IDeleteAdministratorAction {
    type: DELETE_ADMINISTRATOR;
}

type ActionTypes = IAddAdministratorAction | IDeleteAdministratorAction;

// *** ACTIONS ***
// Add Administrator
export type addAdministratorActionType = ({
    administrator,
}: {
    administrator: IAdministrator;
}) => IAddAdministratorAction;

export const addAdministratorAction: addAdministratorActionType = ({ administrator }) => {
    return {
        type: 'ADD_ADMINISTRATOR',
        administrator,
    };
};

// Delete Administrator
export type deleteAdministratorActionType = () => IDeleteAdministratorAction;

export const deleteAdministratorAction: deleteAdministratorActionType = () => {
    return {
        type: 'DELETE_ADMINISTRATOR',
    };
};

// *** INITIAL STATE ***
export type AdministratorStateType = IAdministrator;
const initialState: IAdministrator | null = null;

// *** REDUCER ***
const reducer = (state = initialState, action: ActionTypes): IAdministrator | null => {
    switch (action.type) {
        case 'ADD_ADMINISTRATOR': {
            return action.administrator;
        }
        case 'DELETE_ADMINISTRATOR': {
            return initialState;
        }
        default:
            return state;
    }
};

export default reducer;
