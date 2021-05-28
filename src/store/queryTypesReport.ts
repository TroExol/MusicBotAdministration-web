import axios from 'axios';

import { URLS } from '../common/constants';

export interface IQueryTypesReportRow {
    name: string;
    count: number;
}

// *** ACTIONS ***
// Get
export type getQueryTypesReportActionType = ({
    dateFromFilter,
    dateToFilter,
}: {
    dateFromFilter: string | undefined;
    dateToFilter: string | undefined;
}) => Promise<[true, IQueryTypesReportRow[]] | [false, string]>;

export const getQueryTypesReportAction: getQueryTypesReportActionType = async (filters) => {
    try {
        const allFilters = { ...filters };

        const dateFrom = allFilters.dateFromFilter;
        const dateTo = allFilters.dateToFilter;

        allFilters.dateFromFilter = dateFrom && dateTo ? dateFrom : undefined;
        allFilters.dateToFilter = dateFrom && dateTo ? dateTo : undefined;

        const result = await axios.get(URLS.queryTypesReport, {
            params: allFilters,
        });

        if (!result.data.success) {
            return [false, result.data.message];
        }

        const report = result.data.result.map((row: IQueryTypesReportRow) => ({
            ...row,
            id: row.name,
        }));

        return [true, report];
    } catch (e) {
        return [false, 'Не удалось получить отчет о популярности типов запросов'];
    }
};
