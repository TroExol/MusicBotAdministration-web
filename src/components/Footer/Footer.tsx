import React from 'react';
import { createStyles, makeStyles, Theme, Typography } from '@material-ui/core';
import { connect } from 'react-redux';

import { StoreType } from '../../store';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            padding: '10px',
        },
    }),
);

interface IProps {
    administrator: StoreType['administrator'];
}

const Footer = (props: IProps): JSX.Element => {
    const { administrator } = props;

    const classes = useStyles();

    return (
        <div className={classes.root}>
            <Typography>
                {administrator.login} {administrator.fio}
            </Typography>
        </div>
    );
};

const mapStateToProps = (state: StoreType) => {
    return {
        administrator: state.administrator,
    };
};

export default connect(mapStateToProps)(Footer);
