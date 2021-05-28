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
import { ArrowDropDownOutlined, TableChartOutlined } from '@material-ui/icons';
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
    const [reportsEl, setReportsEl] = useState<null | HTMLElement>(null);

    const handleTablesClick = (event: MouseEvent<HTMLButtonElement>) => {
        setTablesEl(() => event.currentTarget);
    };

    const handleTablesClose = () => {
        setTablesEl(() => null);
    };

    const handleReportsClick = (event: MouseEvent<HTMLButtonElement>) => {
        setReportsEl(() => event.currentTarget);
    };

    const handleReportsClose = () => {
        setReportsEl(() => null);
    };

    return (
        <div className={classes.root}>
            <div className={classes.content}>
                <div className={classes.routes}>
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
                        <MenuItem
                            onClick={() => {
                                history.push('/');
                                handleTablesClose();
                            }}
                        >
                            Запросы
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                history.push('/queryTypes');
                                handleTablesClose();
                            }}
                        >
                            Типы запросов
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                history.push('/subscriptions');
                                handleTablesClose();
                            }}
                        >
                            Подписки
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                history.push('/users');
                                handleTablesClose();
                            }}
                        >
                            Пользователи
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                history.push('/payments');
                                handleTablesClose();
                            }}
                        >
                            Оплаты
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                history.push('/tracks');
                                handleTablesClose();
                            }}
                        >
                            Треки
                        </MenuItem>
                    </Menu>

                    <Button
                        aria-controls="reports-menu"
                        aria-haspopup="true"
                        color="primary"
                        variant="contained"
                        onClick={handleReportsClick}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            color: theme.palette.secondary.light,
                        }}
                    >
                        <TableChartOutlined />
                        &nbsp;Отчеты
                        <ArrowDropDownOutlined />
                    </Button>

                    <Menu
                        id="reports-menu"
                        anchorEl={reportsEl}
                        keepMounted
                        open={Boolean(reportsEl)}
                        onClose={handleReportsClose}
                    >
                        <MenuItem
                            onClick={() => {
                                history.push('/queriesReport');
                                handleReportsClose();
                            }}
                        >
                            Запросы
                        </MenuItem>

                        <MenuItem
                            onClick={() => {
                                history.push('/profitReport');
                                handleReportsClose();
                            }}
                        >
                            Прибыль
                        </MenuItem>

                        <MenuItem
                            onClick={() => {
                                history.push('/queryTypesReport');
                                handleReportsClose();
                            }}
                        >
                            Популярность типов запросов
                        </MenuItem>

                        <MenuItem
                            onClick={() => {
                                history.push('/usersReport');
                                handleReportsClose();
                            }}
                        >
                            Активность пользователей
                        </MenuItem>
                    </Menu>

                    <Button
                        color="primary"
                        variant="contained"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            color: theme.palette.secondary.light,
                        }}
                        onClick={() => {
                            history.push('/queryConstructor');
                        }}
                    >
                        Конструктор
                    </Button>
                </div>

                <Administrator />
            </div>
        </div>
    );
};

export default NavigationHeader;
