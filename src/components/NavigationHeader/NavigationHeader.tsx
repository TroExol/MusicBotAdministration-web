import React from 'react';
import { Button, createStyles, makeStyles, Theme, useTheme } from '@material-ui/core';
import { HomeOutlined } from '@material-ui/icons';
import { useHistory } from 'react-router-dom';

import constants from '../../common/constants';
import Administrator from '../Administrator/Administrator';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.palette.secondary.main,
            width: '100%',
        },
        content: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: constants.CONTENT_WIDTH,
            margin: '0 auto',
            padding: '10px 20px',
            boxSizing: 'border-box',
        },
        routes: {
            '& > *:not(:first-child)': {
                marginLeft: '15px',
            },
        },
    }),
);

const NavigationHeader = (): JSX.Element => {
    const classes = useStyles();
    const theme = useTheme();
    const history = useHistory();

    return (
        <div className={classes.root}>
            <div className={classes.content}>
                <div className={classes.routes}>
                    <Button color="primary" variant="contained" onClick={() => history.push('/')}>
                        <HomeOutlined style={{ color: theme.palette.secondary.light }} />
                    </Button>
                </div>

                <Administrator />
            </div>
        </div>
    );
};

export default NavigationHeader;
