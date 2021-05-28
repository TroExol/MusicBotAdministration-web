import axios from 'axios';

import { URLS } from '../common/constants';

export interface IProfitReportRow {
    id: string;
    date: string;
    subscription: string;
    countSubscriptions: number;
    profit: number;
}

// *** ACTIONS ***
// Get
export type getProfitReportActionType = ({
    dateFromFilter,
    dateToFilter,
    userFilter,
    subscriptionFilter,
}: {
    dateFromFilter: string | undefined;
    dateToFilter: string | undefined;
    userFilter: string | undefined;
    subscriptionFilter: string | undefined;
}) => Promise<[true, IProfitReportRow[]] | [false, string]>;

export const getProfitReportAction: getProfitReportActionType = async (filters) => {
    try {
        const allFilters = { ...filters };

        const dateFrom = allFilters.dateFromFilter;
        const dateTo = allFilters.dateToFilter;
        const user = allFilters.userFilter;
        const subscription = allFilters.subscriptionFilter;

        allFilters.dateFromFilter = dateFrom && dateTo ? dateFrom : undefined;
        allFilters.dateToFilter = dateFrom && dateTo ? dateTo : undefined;
        allFilters.userFilter = user?.split(',')[0];
        allFilters.subscriptionFilter = subscription?.split(',')[0];

        const result = await axios.get(URLS.profitReport, {
            params: allFilters,
        });

        if (!result.data.success) {
            return [false, result.data.message];
        }

        const report = result.data.result.map((row: IProfitReportRow) => ({
            ...row,
            id: `${row.date}${row.subscription}`,
        }));

        return [true, report];
    } catch (e) {
        return [false, 'Не удалось получить отчет о прибыли'];
    }
};
