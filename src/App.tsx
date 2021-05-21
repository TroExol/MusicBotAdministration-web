import React from 'react';

import { connect } from 'react-redux';

import Layout from './HOC/Layout/Layout';
import Routes from './routes';
import { StoreType } from './store';
import Auth from './components/Auth/Auth';

interface IProps {
    administrator: StoreType['administrator'];
}

const App = (props: IProps): JSX.Element => {
    const { administrator } = props;

    return Object.keys(administrator).length !== 0 ? (
        <div className="App">
            <Layout>
                <>{Routes()}</>
            </Layout>
        </div>
    ) : (
        <Auth />
    );
};

const mapStateToProps = (state: StoreType) => {
    return {
        administrator: state.administrator,
    };
};

export default connect(mapStateToProps)(App);
