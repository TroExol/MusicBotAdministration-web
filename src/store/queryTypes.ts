import axios from 'axios';

import { URLS } from '../common/constants';

export interface IQueryType {
    id: number;
    name: string;
}

// *** ACTIONS ***
// Get QueryTypes
export type getQueryTypesActionType = () => Promise<[true, IQueryType[]] | [false, string]>;

export const getQueryTypesAction: getQueryTypesActionType = async () => {
    try {
        const result = await axios.get(URLS.queryTypes);

        if (!result.data.success) {
            return [false, result.data.message];
        }

        const queryTypes = result.data.result;

        return [true, queryTypes];
    } catch (e) {
        return [false, 'Не удалось получить информацию с сервера'];
    }
};
