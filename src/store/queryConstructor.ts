import axios from 'axios';

import { URLS } from '../common/constants';

export interface IQueryConstructorRow {
    [key: string]: string | number;
}

// *** ACTIONS ***
// Get tables
export type getTablesActionType = () => Promise<[true, string[]] | [false, string]>;

export const getTablesAction: getTablesActionType = async () => {
    try {
        const result = await axios.get(URLS.tables);

        if (!result.data.success) {
            return [false, result.data.message];
        }

        const tables = result.data.result;

        return [true, tables];
    } catch (e) {
        return [false, 'Не удалось получить таблицы'];
    }
};

export interface IColumn {
    name: string;
    type: string;
}

export type getColumnsActionType = ({
    table,
}: {
    table: string;
}) => Promise<[true, IColumn[]] | [false, string]>;

export const getColumnsAction: getColumnsActionType = async (table) => {
    try {
        const result = await axios.get(URLS.columns, {
            params: table,
        });

        if (!result.data.success) {
            return [false, result.data.message];
        }

        const columns = result.data.result;

        return [true, columns];
    } catch (e) {
        return [false, 'Не удалось получить столбцы'];
    }
};

// Execute query
export type executeQueryActionType = ({
    table,
    filters,
}: {
    table: string;
    filters: string | undefined;
}) => Promise<[true, IQueryConstructorRow[]] | [false, string]>;

export const executeQueryAction: executeQueryActionType = async (params) => {
    try {
        const result = await axios.get(URLS.sql, {
            params,
        });

        if (!result.data.success) {
            return [false, result.data.message];
        }

        const columns = result.data.result;

        return [true, columns];
    } catch (e) {
        return [false, e.message];
    }
};
