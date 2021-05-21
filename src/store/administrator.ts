import axios from 'axios';

import { URLS } from '../common/constants';

export interface IAdministrator {
    id?: number;
    fio?: string;
    login?: string;
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
// Get Administrator
export type getAdministratorActionType = ({
    login,
    password,
}: {
    login: string;
    password: string;
}) => Promise<[true, IAdministrator] | [false, string]>;

export const getAdministratorAction: getAdministratorActionType = async ({ login, password }) => {
    try {
        const res = await axios.get(URLS.admin, {
            params: {
                login,
                password,
            },
        });

        const administrator = res.data.recordset;

        return administrator.length > 0
            ? [
                  true,
                  {
                      id: administrator[0].ID,
                      login: administrator[0].Логин,
                      fio: administrator[0].ФИО,
                  },
              ]
            : [false, 'Неправильно указаны данные авторизации'];
    } catch (e) {
        return [false, 'Не удалось получить информацию с сервера'];
    }
};

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
const initialState: AdministratorStateType = {};

// *** REDUCER ***
const reducer = (state = initialState, action: ActionTypes): AdministratorStateType => {
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
