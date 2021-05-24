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

export type addQueryTypeActionType = (
    queryType: IQueryType,
) => Promise<[true, number] | [false, string]>;

export const addQueryTypeAction: addQueryTypeActionType = async (queryType) => {
    try {
        const result = await axios.post(URLS.queryType, {
            params: queryType,
        });

        if (!result.data.success) {
            return [false, result.data.message];
        }

        const queryId = result.data.result;

        return [true, queryId];
    } catch (e) {
        return [false, 'Не удалось отправить запрос на сервер'];
    }
};

export const updateQueryTypeAction: addQueryTypeActionType = async (queryType) => {
    try {
        const result = await axios.put(URLS.queryType, {
            params: queryType,
        });

        if (!result.data.success) {
            return [false, result.data.message];
        }

        const queryTypeId = result.data.result;

        return [true, queryTypeId];
    } catch (e) {
        return [false, 'Не удалось отправить запрос на сервер'];
    }
};
