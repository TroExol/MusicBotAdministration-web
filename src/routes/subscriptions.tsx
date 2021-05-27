import React from 'react';

import { IRouterObject } from './index';
import Subscriptions from '../components/Subscriptions/Subscriptions';

const index: IRouterObject = {
    name: 'subscriptions/index',
    path: '/subscriptions',
    exact: true,
    RenderFn: (): JSX.Element => {
        return <Subscriptions />;
    },
};
export default [index];
