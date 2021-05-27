import axios from 'axios';

import { URLS } from '../common/constants';

export interface IQueriesReportRow {
    id: number;
    date: string;
    countTracks: number;
    author: string;
    fio: string;
    url: string;
    queryType: string;
    tracks: {
        name: string;
        author: string;
    }[];
}

// *** ACTIONS ***
// Get
export type getQueriesReportActionType = ({
    dateFromFilter,
    dateToFilter,
    userFilter,
    queryTypeFilter,
}: {
    dateFromFilter: string | undefined;
    dateToFilter: string | undefined;
    userFilter: string | undefined;
    queryTypeFilter: string | undefined;
}) => Promise<[true, IQueriesReportRow[]] | [false, string]>;

export const getQueriesReportAction: getQueriesReportActionType = async (filters) => {
    try {
        const allFilters = { ...filters };

        const dateFrom = allFilters.dateFromFilter;
        const dateTo = allFilters.dateToFilter;
        const user = allFilters.userFilter;
        const queryType = allFilters.queryTypeFilter;

        allFilters.dateFromFilter = dateFrom && dateTo ? dateFrom : undefined;
        allFilters.dateToFilter = dateFrom && dateTo ? dateTo : undefined;
        allFilters.userFilter = user?.split(',')[0];
        allFilters.queryTypeFilter = queryType?.split(',')[0];

        const result = await axios.get(URLS.queriesReport, {
            params: allFilters,
        });

        if (!result.data.success) {
            return [false, result.data.message];
        }

        const report = result.data.result;

        return [true, report];
    } catch (e) {
        return [false, 'Не удалось получить отчет о запросах'];
    }
};
