import React, { MouseEvent, useState } from 'react';
import {
    Button,
    createStyles,
    makeStyles,
    Menu,
    MenuItem,
    Theme,
    useTheme,
} from '@material-ui/core';
import { ArrowDropDownOutlined, HomeOutlined, TableChartOutlined } from '@material-ui/icons';
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
            display: 'flex',
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

    const [tablesEl, setTablesEl] = useState<null | HTMLElement>(null);

    const handleTablesClick = (event: MouseEvent<HTMLButtonElement>) => {
        setTablesEl(() => event.currentTarget);
    };

    const handleTablesClose = () => {
        setTablesEl(() => null);
    };

    return (
        <div className={classes.root}>
            <div className={classes.content}>
                <div className={classes.routes}>
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={() => history.push('/')}
                        style={{ color: theme.palette.secondary.light }}
                    >
                        <HomeOutlined />
                    </Button>

                    <Button
                        aria-controls="tables-menu"
                        aria-haspopup="true"
                        color="primary"
                        variant="contained"
                        onClick={handleTablesClick}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            color: theme.palette.secondary.light,
                        }}
                    >
                        <TableChartOutlined />
                        &nbsp;Таблицы
                        <ArrowDropDownOutlined />
                    </Button>

                    <Menu
                        id="tables-menu"
                        anchorEl={tablesEl}
                        keepMounted
                        open={Boolean(tablesEl)}
                        onClose={handleTablesClose}
                    >
                        <MenuItem onClick={() => history.push('/queryTypes')}>
                            Типы запросов
                        </MenuItem>
                        <MenuItem onClick={() => history.push('/subscriptions')}>Подписки</MenuItem>
                        <MenuItem onClick={() => history.push('/users')}>Пользователи</MenuItem>
                        <MenuItem onClick={() => history.push('/payments')}>Оплаты</MenuItem>
                        <MenuItem onClick={() => history.push('/tracks')}>Треки</MenuItem>
                    </Menu>
                </div>

                <Administrator />
            </div>
        </div>
    );
};

export default NavigationHeader;
