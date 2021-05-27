import React from 'react';

import { IRouterObject } from './index';
import Users from '../components/Users/Users';

const index: IRouterObject = {
    name: 'users/index',
    path: '/users',
    exact: true,
    RenderFn: (): JSX.Element => {
        return <Users />;
    },
};
export default [index];
