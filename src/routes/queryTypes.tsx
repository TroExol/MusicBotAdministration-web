import React from 'react';

import { IRouterObject } from './index';
import QueryTypes from '../components/QueryTypes/QueryTypes';

const index: IRouterObject = {
    name: 'queryTypes/index',
    path: '/queryTypes',
    exact: true,
    RenderFn: (): JSX.Element => {
        return <QueryTypes />;
    },
};
export default [index];
