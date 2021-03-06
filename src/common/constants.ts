const CONTENT_WIDTH = '1000px';

export const baseServerUrl = 'http://localhost:5000';

export const URLS = {
    admin: `${baseServerUrl}/admin`,
    queries: `${baseServerUrl}/queries`,
    query: `${baseServerUrl}/query`,
    users: `${baseServerUrl}/users`,
    user: `${baseServerUrl}/user`,
    queryTypes: `${baseServerUrl}/queryTypes`,
    queryType: `${baseServerUrl}/queryType`,
    tracks: `${baseServerUrl}/tracks`,
    track: `${baseServerUrl}/track`,
    subscriptions: `${baseServerUrl}/subscriptions`,
    subscription: `${baseServerUrl}/subscription`,
    payments: `${baseServerUrl}/payments`,
    payment: `${baseServerUrl}/payment`,
    queriesReport: `${baseServerUrl}/queriesReport`,
    profitReport: `${baseServerUrl}/profitReport`,
    queryTypesReport: `${baseServerUrl}/queryTypesReport`,
    usersReport: `${baseServerUrl}/usersReport`,
    tables: `${baseServerUrl}/tables`,
    columns: `${baseServerUrl}/columns`,
    sql: `${baseServerUrl}/sql`,
};

export default { CONTENT_WIDTH, URLS };
