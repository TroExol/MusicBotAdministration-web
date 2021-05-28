import React from 'react';

import { IRouterObject } from './index';
import QueryConstructor from '../components/QueryConstructor/QueryConstructor';

const index: IRouterObject = {
    name: 'queryConstructor/index',
    path: '/queryConstructor',
    exact: true,
    RenderFn: (): JSX.Element => {
        return <QueryConstructor />;
    },
};
export default [index];
