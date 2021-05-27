import React from 'react';

import { IRouterObject } from './index';
import Tracks from '../components/Tracks/Tracks';

const index: IRouterObject = {
    name: 'tracks/index',
    path: '/tracks',
    exact: true,
    RenderFn: (): JSX.Element => {
        return <Tracks />;
    },
};
export default [index];
