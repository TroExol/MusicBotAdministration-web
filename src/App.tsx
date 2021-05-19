import React from 'react';
import Layout from './HOC/Layout/Layout';
import Routes from './routes';

const App = (): JSX.Element => {
    return (
        <div className="App">
            <Layout>
                <>{Routes()}</>
            </Layout>
        </div>
    );
};

export default App;
