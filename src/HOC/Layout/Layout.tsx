import React from 'react';
import { makeStyles } from '@material-ui/core';
import Footer from '../../components/Footer/Footer';
import NavigationHeader from '../../components/NavigationHeader/NavigationHeader';
import constants from '../../common/constants';

const useStyles = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
    },
    content: {
        flex: '1',
        width: constants.CONTENT_WIDTH,
        margin: '0 auto',
        padding: '20px 0',
    },
});

interface IProps {
    children: JSX.Element;
}

const Layout = (props: IProps): JSX.Element => {
    const { children } = props;
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <NavigationHeader />

            <main className={classes.content}>{children}</main>

            <Footer />
        </div>
    );
};

export default Layout;
