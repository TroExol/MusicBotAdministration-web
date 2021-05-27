import React from 'react';

import { IRouterObject } from './index';
import Payments from '../components/Payments/Payments';

const index: IRouterObject = {
    name: 'payments/index',
    path: '/payments',
    exact: true,
    RenderFn: (): JSX.Element => {
        return <Payments />;
    },
};
export default [index];
