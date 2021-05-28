import axios from 'axios';

import { URLS } from '../common/constants';

export interface IUsersReportRow {
    fio: string;
    url: string;
    count: number;
}

// *** ACTIONS ***
// Get
export type getUsersReportActionType = ({
    dateFromFilter,
    dateToFilter,
}: {
    dateFromFilter: string | undefined;
    dateToFilter: string | undefined;
}) => Promise<[true, IUsersReportRow[]] | [false, string]>;

export const getUsersReportAction: getUsersReportActionType = async (filters) => {
    try {
        const allFilters = { ...filters };

        const dateFrom = allFilters.dateFromFilter;
        const dateTo = allFilters.dateToFilter;

        allFilters.dateFromFilter = dateFrom && dateTo ? dateFrom : undefined;
        allFilters.dateToFilter = dateFrom && dateTo ? dateTo : undefined;

        const result = await axios.get(URLS.usersReport, {
            params: allFilters,
        });

        if (!result.data.success) {
            return [false, result.data.message];
        }

        const report = result.data.result.map((row: IUsersReportRow) => ({
            ...row,
            id: row.fio,
        }));

        return [true, report];
    } catch (e) {
        return [false, 'Не удалось получить отчет об активности пользователей'];
    }
};
