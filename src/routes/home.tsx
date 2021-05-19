import React from 'react';
import { IRouterObject } from './index';

const index: IRouterObject = {
    name: 'home/index',
    path: '/',
    exact: true,
    RenderFn: (): JSX.Element => {
        return <>Home</>;
    },
};
export default [index];
