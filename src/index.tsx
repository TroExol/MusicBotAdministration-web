import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { BrowserRouter } from 'react-router-dom';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { Provider } from 'react-redux';
import { SnackbarProvider } from 'notistack';

import App from './App';
import reportWebVitals from './reportWebVitals';
import store from './store';

const theme = createMuiTheme({
    palette: {
        primary: { main: '#cbf1f5', light: '#e3fdfd' },
        secondary: { main: '#71c9ce', light: '#a6e3e9' },
    },
});

ReactDOM.render(
    <Provider store={store}>
        <ThemeProvider theme={theme}>
            <SnackbarProvider maxSnack={5} autoHideDuration={3000}>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </SnackbarProvider>
        </ThemeProvider>
    </Provider>,
    document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
