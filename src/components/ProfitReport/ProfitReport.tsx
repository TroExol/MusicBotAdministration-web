import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';

import {
    Button,
    Divider,
    FormGroup,
    makeStyles,
    MenuItem,
    Switch,
    TextField,
    Typography,
    useTheme,
} from '@material-ui/core';
import { useSnackbar } from 'notistack';
import { XGrid, GridColDef, GridToolbarContainer } from '@material-ui/x-grid';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Workbook from 'react-excel-workbook';

import { renderCellExpand } from '../GridCellExpand/GridCellExpand';
import { getUsersAction, IUser } from '../../store/users';
import { getProfitReportAction, IProfitReportRow } from '../../store/profitReport';
import { getSubscriptionsAction, ISubscription } from '../../store/subscriptions';

const useStyles = makeStyles({
    content: {
        marginTop: '10px',
        height: '470px',
    },
    actions: {
        marginTop: '10px',
        '& > button:not(:first-child)': {
            marginLeft: '7px',
        },
    },
    modal: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
    },
    field: {
        width: '200px',
        margin: '10px auto',
    },
});

const columns: GridColDef[] = [
    {
        field: 'date',
        headerName: 'Дата оплаты',
        flex: 0.25,
        type: 'dateTime',
        renderCell: renderCellExpand,
    },
    {
        field: 'subscription',
        headerName: 'Подписка',
        flex: 0.25,
        renderCell: renderCellExpand,
    },
    {
        field: 'countSubscriptions',
        headerName: 'Количество подписок',
        type: 'number',
        flex: 0.25,
        renderCell: renderCellExpand,
    },
    {
        field: 'profit',
        headerName: 'Прибыль, руб.',
        type: 'number',
        flex: 0.25,
        renderCell: renderCellExpand,
    },
];

const ProfitReport = (): JSX.Element => {
    const classes = useStyles();

    const theme = useTheme();

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [rowsState, setRowsState] = useState<IProfitReportRow[]>([]);
    const [loading, setLoading] = useState(true);

    const [usersState, setUsersState] = useState<IUser[]>([]);
    const [subscriptionsState, setSubscriptionsState] = useState<ISubscription[]>([]);

    const [enableDateFilterState, setEnableDateFilterState] = useState(false);
    const [enableUserFilterState, setEnableUserFilterState] = useState(false);
    const [enableSubscriptionFilterState, setEnableSubscriptionFilterState] = useState(false);

    const [dateFilterState, setDateFilterState] = useState<[string?, string?]>([]);
    const [userFilterState, setUserFilterState] = useState<string | undefined>(undefined);
    const [subscriptionFilterState, setSubscriptionFilterState] =
        useState<string | undefined>(undefined);

    const memoLoadData = useCallback(() => {
        (async () => {
            setLoading(() => true);

            await getProfitReportAction({
                dateFromFilter: enableDateFilterState ? dateFilterState[0] : undefined,
                dateToFilter: enableDateFilterState ? dateFilterState[1] : undefined,
                userFilter: enableUserFilterState ? userFilterState : undefined,
                subscriptionFilter: enableSubscriptionFilterState
                    ? subscriptionFilterState
                    : undefined,
            })
                .then((rows) => {
                    if (rows[0]) {
                        if (rows[1].length <= 0) {
                            throw new Error('Нет данных');
                        }
                        setTimeout(() => {
                            setRowsState(rows[1]);
                            setLoading(false);
                        }, 0);
                    } else {
                        throw new Error(rows[1]);
                    }
                })
                .catch((error) => {
                    setTimeout(() => {
                        setRowsState([]);
                        setLoading(false);
                    }, 0);

                    const snackBar = enqueueSnackbar(error.message, {
                        variant: 'error',
                        anchorOrigin: { horizontal: 'right', vertical: 'top' },
                        onClick: () => closeSnackbar(snackBar),
                    });
                });

            if (usersState.length <= 0) {
                await getUsersAction()
                    .then((users) => {
                        if (users[0]) {
                            if (users[1].length <= 0) {
                                throw new Error('Нет пользователей');
                            }

                            setTimeout(() => {
                                setUsersState(users[1]);
                            }, 0);
                        } else {
                            throw new Error(users[1]);
                        }
                    })
                    .catch((error) => {
                        setTimeout(() => {
                            setUsersState([]);
                        }, 0);

                        const snackBar = enqueueSnackbar(error.message, {
                            variant: 'error',
                            anchorOrigin: { horizontal: 'right', vertical: 'top' },
                            onClick: () => closeSnackbar(snackBar),
                        });
                    });
            }

            if (subscriptionsState.length <= 0) {
                await getSubscriptionsAction()
                    .then((subscription) => {
                        if (subscription[0]) {
                            if (subscription[1].length <= 0) {
                                throw new Error('Нет подписок');
                            }

                            setTimeout(() => {
                                setSubscriptionsState(subscription[1]);
                            }, 0);
                        } else {
                            throw new Error(subscription[1]);
                        }
                    })
                    .catch((error) => {
                        setTimeout(() => {
                            setSubscriptionsState([]);
                        }, 0);

                        const snackBar = enqueueSnackbar(error.message, {
                            variant: 'error',
                            anchorOrigin: { horizontal: 'right', vertical: 'top' },
                            onClick: () => closeSnackbar(snackBar),
                        });
                    });
            }
        })();

        // eslint-disable-next-line
    }, [
        enableDateFilterState,
        enableUserFilterState,
        enableSubscriptionFilterState,
        dateFilterState,
        userFilterState,
        subscriptionFilterState,
    ]);

    // eslint-disable-next-line
    useEffect(
        memoLoadData,
        // eslint-disable-next-line
        [
            enableDateFilterState,
            enableUserFilterState,
            enableSubscriptionFilterState,
            dateFilterState,
            userFilterState,
            subscriptionFilterState,
        ],
    );

    const onDateFromChangeHandler = (data: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const newState = [...dateFilterState];

        newState[0] = data.target.value;

        setDateFilterState(() => newState as [string?, string?]);
    };

    const onDateToChangeHandler = (data: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const newState = [...dateFilterState];

        newState[1] = data.target.value;

        setDateFilterState(() => newState as [string?, string?]);
    };

    const onUserChangeHandler = (data: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const newState = data.target.value;

        setUserFilterState(() => newState);
    };

    const onSubscriptionChangeHandler = (
        data: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    ) => {
        const newState = data.target.value;

        setSubscriptionFilterState(() => newState);
    };

    const Toolbar = () => (
        <GridToolbarContainer style={{ display: 'block' }}>
            <div style={{ display: 'flex' }}>
                <FormGroup row style={{ alignItems: 'center' }}>
                    <Switch
                        checked={enableDateFilterState}
                        onChange={() => setEnableDateFilterState(() => !enableDateFilterState)}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <TextField
                            className={classes.field}
                            variant="outlined"
                            label="Дата с"
                            type="date"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={dateFilterState[0]}
                            inputProps={{
                                min: '2020-03-29',
                                max:
                                    dateFilterState[1] ??
                                    new Date(
                                        new Date().getTime() -
                                            new Date().getTimezoneOffset() * 60000,
                                    )
                                        .toISOString()
                                        .slice(0, -14),
                            }}
                            disabled={!enableDateFilterState}
                            error={enableDateFilterState && !dateFilterState[0]}
                            helperText={
                                enableDateFilterState &&
                                !dateFilterState[0] &&
                                'Введите начало периода'
                            }
                            name="dateFrom"
                            onChange={onDateFromChangeHandler}
                            onKeyDown={(event) => {
                                event.preventDefault();
                            }}
                        />
                        <TextField
                            className={classes.field}
                            variant="outlined"
                            label="Дата по"
                            type="date"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={dateFilterState[1]}
                            inputProps={{
                                min: dateFilterState[0] ?? '2020-03-29',
                                max: new Date(
                                    new Date().getTime() - new Date().getTimezoneOffset() * 60000,
                                )
                                    .toISOString()
                                    .slice(0, -14),
                            }}
                            disabled={!enableDateFilterState}
                            error={enableDateFilterState && !dateFilterState[1]}
                            helperText={
                                enableDateFilterState &&
                                !dateFilterState[1] &&
                                'Введите конец периода'
                            }
                            name="dateTo"
                            onChange={onDateToChangeHandler}
                            onKeyDown={(event) => {
                                event.preventDefault();
                            }}
                        />
                    </div>
                </FormGroup>

                <FormGroup row style={{ alignItems: 'center' }}>
                    <Switch
                        checked={enableUserFilterState}
                        onChange={() => setEnableUserFilterState(() => !enableUserFilterState)}
                    />
                    <TextField
                        className={classes.field}
                        select
                        size="small"
                        variant="outlined"
                        label="Пользователь"
                        disabled={!enableUserFilterState || usersState.length <= 0}
                        name="user"
                        value={userFilterState}
                        onChange={onUserChangeHandler}
                        error={enableUserFilterState && !userFilterState}
                        helperText={
                            enableUserFilterState && !userFilterState && 'Выберите пользователя'
                        }
                    >
                        {usersState.map((user) => (
                            <MenuItem key={user.id} value={`${user.id},${user.fio},${user.url}`}>
                                {user.fio}
                            </MenuItem>
                        ))}
                    </TextField>
                </FormGroup>

                <FormGroup row style={{ alignItems: 'center' }}>
                    <Switch
                        checked={enableSubscriptionFilterState}
                        onChange={() =>
                            setEnableSubscriptionFilterState(() => !enableSubscriptionFilterState)
                        }
                    />
                    <TextField
                        className={classes.field}
                        select
                        size="small"
                        variant="outlined"
                        label="Подписка"
                        disabled={!enableSubscriptionFilterState || subscriptionsState.length <= 0}
                        name="queryType"
                        value={subscriptionFilterState}
                        onChange={onSubscriptionChangeHandler}
                        error={enableSubscriptionFilterState && !subscriptionFilterState}
                        helperText={
                            enableSubscriptionFilterState &&
                            !subscriptionFilterState &&
                            'Выберите подписку'
                        }
                    >
                        {subscriptionsState.map((subscription) => (
                            <MenuItem
                                key={subscription.id}
                                value={`${subscription.id},${subscription.name}`}
                            >
                                {subscription.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </FormGroup>
            </div>

            <Divider variant="middle" />
        </GridToolbarContainer>
    );

    const ExportButton = () => {
        return (
            <GridToolbarContainer>
                <Workbook
                    filename="Отчет по прибыли.xlsx"
                    element={
                        <Button
                            color="primary"
                            variant="contained"
                            style={{ color: theme.palette.secondary.light }}
                        >
                            Выгрузить в MS Excel
                        </Button>
                    }
                >
                    <Workbook.Sheet data={rowsState} name="Отчет по прибыли">
                        <Workbook.Column label="Дата оплаты" value="date" />
                        <Workbook.Column label="Подписка" value="subscription" />
                        <Workbook.Column label="Куплено подписок" value="countSubscriptions" />
                        <Workbook.Column label="Прибыль" value="profit" />
                    </Workbook.Sheet>
                </Workbook>
            </GridToolbarContainer>
        );
    };

    return (
        <div>
            <Typography variant="h5" component="h2" color="primary">
                Прибыль ({rowsState.length > 0 ? rowsState[rowsState.length - 1].profit : 0} руб.)
            </Typography>

            <div className={classes.content}>
                <XGrid
                    rows={rowsState}
                    columns={columns}
                    pageSize={5}
                    loading={loading}
                    scrollbarSize={10}
                    components={{
                        Toolbar,
                    }}
                    hideFooter
                    disableColumnFilter
                />

                <div className={classes.actions}>
                    <ExportButton />
                </div>
            </div>
        </div>
    );
};

export default ProfitReport;
