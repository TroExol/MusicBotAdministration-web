import axios from 'axios';

import { URLS } from '../common/constants';
import { ITrack } from './tracks';

export interface IQuery {
    id: number;
    date: string;
    countTracks: number;
    author: string;
    userId: number;
    user: string;
    userUrl: string;
    queryTypeId: number;
    queryType: string;
    tracks: ITrack[];
}

// *** ACTIONS ***
// Get Queries
export type getQueriesActionType = () => Promise<[true, IQuery[]] | [false, string]>;

export const getQueriesAction: getQueriesActionType = async () => {
    try {
        const result = await axios.get(URLS.queries);

        if (!result.data.success) {
            return [false, result.data.message];
        }

        const queries = result.data.result;

        return [true, queries];
    } catch (e) {
        return [false, 'Не удалось получить запросы'];
    }
};

export type addQueryActionType = (query: IQuery) => Promise<[true, number] | [false, string]>;

export const addQueryAction: addQueryActionType = async (query) => {
    try {
        let reqQuery = query;

        if (query.queryType === 'Функции') {
            reqQuery = { ...query, countTracks: 0, author: '', tracks: [] };
        }

        const result = await axios.post(URLS.query, {
            params: reqQuery,
        });

        if (!result.data.success) {
            return [false, result.data.message];
        }

        const queryId = result.data.result;

        return [true, queryId];
    } catch (e) {
        return [false, 'Не удалось добавить запрос'];
    }
};

export type deleteQueryActionType = (id: number) => Promise<[true] | [false, string]>;

export const deleteQueryAction: deleteQueryActionType = async (id) => {
    try {
        const result = await axios.delete(URLS.query, {
            params: { id },
        });

        if (!result.data.success) {
            return [false, result.data.message];
        }

        return [true];
    } catch (e) {
        return [false, 'Не удалось удалить запрос(ы)'];
    }
};

export const updateQueryAction: addQueryActionType = async (query) => {
    try {
        const result = await axios.put(URLS.query, {
            params: query,
        });

        if (!result.data.success) {
            return [false, result.data.message];
        }

        const queryId = result.data.result;

        return [true, queryId];
    } catch (e) {
        return [false, 'Не удалось изменить запрос'];
    }
};
