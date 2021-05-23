import React from 'react';

import { IRouterObject } from './index';
import Queries from '../components/Queries/Queries';

const index: IRouterObject = {
    name: 'home/index',
    path: '/',
    exact: true,
    RenderFn: (): JSX.Element => {
        return <Queries />;
    },
};
export default [index];
