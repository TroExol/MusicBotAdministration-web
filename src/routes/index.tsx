import React from 'react';
import { Switch, Route } from 'react-router-dom';
import homeRoutes from './home';

export interface IRouterObject {
    name: string;
    path: string;
    exact: boolean;
    RenderFn: () => JSX.Element;
}

export const allRoutes = [...homeRoutes];

const Routes = (): JSX.Element => {
    return (
        <Switch>
            {allRoutes.map(({ name, path, exact, RenderFn }) => (
                <Route key={name} path={path} exact={exact} render={() => <RenderFn />} />
            ))}
            <Route render={() => <h1>Not Found</h1>} />
        </Switch>
    );
};

export default Routes;
