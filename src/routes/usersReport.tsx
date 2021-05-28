import React from 'react';

import { IRouterObject } from './index';
import UsersReport from '../components/UsersReport/UsersReport';

const index: IRouterObject = {
    name: 'usersReport/index',
    path: '/usersReport',
    exact: true,
    RenderFn: (): JSX.Element => {
        return <UsersReport />;
    },
};
export default [index];
