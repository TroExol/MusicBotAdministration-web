import React from 'react';

import { IRouterObject } from './index';
import QueryTypesReport from '../components/QueryTypesReport/QueryTypesReport';

const index: IRouterObject = {
    name: 'queryTypesReport/index',
    path: '/queryTypesReport',
    exact: true,
    RenderFn: (): JSX.Element => {
        return <QueryTypesReport />;
    },
};
export default [index];
