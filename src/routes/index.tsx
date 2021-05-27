import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Typography } from '@material-ui/core';

import homeRoutes from './home';
import queryTypesRoutes from './queryTypes';
import subscriptionsRoutes from './subscriptions';
import usersRoutes from './users';
import paymentsRoutes from './payments';
import tracksRoutes from './tracks';
import queriesReportRoutes from './queriesReport';

export interface IRouterObject {
    name: string;
    path: string;
    exact: boolean;
    RenderFn: () => JSX.Element;
}

export const allRoutes = [
    ...homeRoutes,
    ...queryTypesRoutes,
    ...subscriptionsRoutes,
    ...usersRoutes,
    ...paymentsRoutes,
    ...tracksRoutes,
    ...queriesReportRoutes,
];

const Routes = (): JSX.Element => {
    return (
        <Switch>
            {allRoutes.map(({ name, path, exact, RenderFn }) => (
                <Route key={name} path={path} exact={exact} render={() => <RenderFn />} />
            ))}
            <Route
                render={() => (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant="h4" component="h1" color="primary">
                            Страница не найдена
                        </Typography>
                    </div>
                )}
            />
        </Switch>
    );
};

export default Routes;
