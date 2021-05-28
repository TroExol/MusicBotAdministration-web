import React from 'react';

import { IRouterObject } from './index';
import ProfitReport from '../components/ProfitReport/ProfitReport';

const index: IRouterObject = {
    name: 'profitReport/index',
    path: '/profitReport',
    exact: true,
    RenderFn: (): JSX.Element => {
        return <ProfitReport />;
    },
};
export default [index];
