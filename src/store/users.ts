import axios from 'axios';

import { URLS } from '../common/constants';

export interface IUser {
    id: number;
    fio: string;
    url: string;
}

// *** ACTIONS ***
// Get
export type getUsersActionType = () => Promise<[true, IUser[]] | [false, string]>;

export const getUsersAction: getUsersActionType = async () => {
    try {
        const result = await axios.get(URLS.users);

        if (!result.data.success) {
            return [false, result.data.message];
        }

        const users = result.data.result;

        return [true, users];
    } catch (e) {
        return [false, 'Не удалось получить пользователей'];
    }
};

export type addUserActionType = (user: IUser) => Promise<[true, number] | [false, string]>;

export const addUserAction: addUserActionType = async (user) => {
    try {
        const result = await axios.post(URLS.user, {
            params: user,
        });

        if (!result.data.success) {
            return [false, result.data.message];
        }

        const userId = result.data.result;

        return [true, userId];
    } catch (e) {
        return [false, 'Не удалось добавить пользователя'];
    }
};

export const updateUserAction: addUserActionType = async (user) => {
    try {
        const result = await axios.put(URLS.user, {
            params: user,
        });

        if (!result.data.success) {
            return [false, result.data.message];
        }

        const userId = result.data.result;

        return [true, userId];
    } catch (e) {
        return [false, 'Не удалось изменить пользователя'];
    }
};
