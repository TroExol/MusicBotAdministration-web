import React from 'react';

import { IRouterObject } from './index';
import QueriesReport from '../components/QueriesReport/QueriesReport';

const index: IRouterObject = {
    name: 'queriesReport/index',
    path: '/queriesReport',
    exact: true,
    RenderFn: (): JSX.Element => {
        return <QueriesReport />;
    },
};
export default [index];
