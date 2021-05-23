import axios from 'axios';

import { URLS } from '../common/constants';

export interface IUser {
    id: number;
    fio: string;
    url: string;
}

// *** ACTIONS ***
// Get Users
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
        return [false, 'Не удалось получить информацию с сервера'];
    }
};
