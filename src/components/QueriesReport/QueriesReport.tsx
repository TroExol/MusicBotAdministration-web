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
import {
    XGrid,
    GridColDef,
    GridToolbarContainer,
    GridValueFormatterParams,
} from '@material-ui/x-grid';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// import ReactExport from 'react-data-export';
import Workbook from 'react-excel-workbook';

import { renderCellExpand } from '../GridCellExpand/GridCellExpand';
import { ISOtoDateTime } from '../../utils/formatters';
import { getQueriesReportAction, IQueriesReportRow } from '../../store/queriesReport';
import { getUsersAction, IUser } from '../../store/users';
import { getQueryTypesAction, IQueryType } from '../../store/queryTypes';
import { ITrack } from '../../store/tracks';

// const { ExcelFile } = ReactExport;
// const { ExcelSheet, ExcelColumn } = ReactExport.ExcelFile;

const useStyles = makeStyles({
    content: {
        marginTop: '10px',
        height: '520px',
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
        field: 'id',
        headerName: 'ID',
        type: 'number',
        renderCell: renderCellExpand,
        filterable: false,
    },
    {
        field: 'date',
        headerName: 'Дата Запроса',
        width: 190,
        type: 'dateTime',
        renderCell: (params) =>
            renderCellExpand(params, (parameters) => ISOtoDateTime(parameters.value as string)),
    },
    {
        field: 'countTracks',
        headerName: 'Количество треков',
        type: 'number',
        width: 200,
        renderCell: renderCellExpand,
        filterable: false,
    },
    {
        field: 'author',
        headerName: 'Запрашиваемый автор',
        width: 200,
        renderCell: renderCellExpand,
        filterable: false,
    },
    {
        field: 'fio',
        headerName: 'Пользователь',
        width: 190,
        renderCell: renderCellExpand,
    },
    {
        field: 'url',
        headerName: 'Ссылка на пользователя',
        width: 250,
        renderCell: renderCellExpand,
        filterable: false,
    },
    {
        field: 'queryType',
        headerName: 'Тип запроса',
        width: 180,
        renderCell: renderCellExpand,
    },
    {
        field: 'tracks',
        headerName: 'Полученные треки',
        width: 200,
        sortable: false,
        renderCell: (params) =>
            renderCellExpand(params, (parameters: GridValueFormatterParams) =>
                (parameters.value as ITrack[])
                    .map((track) => `${track.author} ${track.name}`)
                    .join(', '),
            ),
    },
];

const QueriesReport = (): JSX.Element => {
    const classes = useStyles();

    const theme = useTheme();

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [queriesState, setQueriesState] = useState<IQueriesReportRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [usersState, setUsersState] = useState<IUser[]>([]);
    const [queryTypesState, setQueryTypesState] = useState<IQueryType[]>([]);
    const [enableDateFilterState, setEnableDateFilterState] = useState(false);
    const [enableUserFilterState, setEnableUserFilterState] = useState(false);
    const [enableQueryTypeFilterState, setEnableQueryTypeFilterState] = useState(false);
    const [dateFilterState, setDateFilterState] = useState<[string?, string?]>([]);
    const [userFilterState, setUserFilterState] = useState<string | undefined>(undefined);
    const [queryTypeFilterState, setQueryTypeFilterState] = useState<string | undefined>(undefined);

    const memoLoadData = useCallback(() => {
        (async () => {
            setLoading(() => true);

            await getQueriesReportAction({
                dateFromFilter: enableDateFilterState ? dateFilterState[0] : undefined,
                dateToFilter: enableDateFilterState ? dateFilterState[1] : undefined,
                userFilter: enableUserFilterState ? userFilterState : undefined,
                queryTypeFilter: enableQueryTypeFilterState ? queryTypeFilterState : undefined,
            })
                .then((queries) => {
                    if (queries[0]) {
                        if (queries[1].length <= 0) {
                            throw new Error('Нет запросов');
                        }
                        setTimeout(() => {
                            setQueriesState(queries[1]);
                            setLoading(false);
                        }, 0);
                    } else {
                        throw new Error(queries[1]);
                    }
                })
                .catch((error) => {
                    setQueriesState([]);
                    setLoading(false);

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

                            setUsersState(users[1]);
                        } else {
                            throw new Error(users[1]);
                        }
                    })
                    .catch((error) => {
                        setUsersState([]);

                        const snackBar = enqueueSnackbar(error.message, {
                            variant: 'error',
                            anchorOrigin: { horizontal: 'right', vertical: 'top' },
                            onClick: () => closeSnackbar(snackBar),
                        });
                    });
            }

            if (queryTypesState.length <= 0) {
                await getQueryTypesAction()
                    .then((queryTypes) => {
                        if (queryTypes[0]) {
                            if (queryTypes[1].length <= 0) {
                                throw new Error('Нет типов запросов');
                            }

                            setQueryTypesState(queryTypes[1]);
                        } else {
                            throw new Error(queryTypes[1]);
                        }
                    })
                    .catch((error) => {
                        setQueryTypesState([]);

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
        enableQueryTypeFilterState,
        dateFilterState,
        userFilterState,
        queryTypeFilterState,
    ]);

    // eslint-disable-next-line
    useEffect(
        memoLoadData,
        // eslint-disable-next-line
        [
            enableDateFilterState,
            enableUserFilterState,
            enableQueryTypeFilterState,
            dateFilterState,
            userFilterState,
            queryTypeFilterState,
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

    const onQueryTypeChangeHandler = (
        data: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    ) => {
        const newState = data.target.value;

        setQueryTypeFilterState(() => newState);
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
                        checked={enableQueryTypeFilterState}
                        onChange={() =>
                            setEnableQueryTypeFilterState(() => !enableQueryTypeFilterState)
                        }
                    />
                    <TextField
                        className={classes.field}
                        select
                        size="small"
                        variant="outlined"
                        label="Тип запроса"
                        disabled={!enableQueryTypeFilterState || queryTypesState.length <= 0}
                        name="queryType"
                        value={queryTypeFilterState}
                        onChange={onQueryTypeChangeHandler}
                        error={enableQueryTypeFilterState && !queryTypeFilterState}
                        helperText={
                            enableQueryTypeFilterState &&
                            !queryTypeFilterState &&
                            'Выберите тип запроса'
                        }
                    >
                        {queryTypesState.map((queryType) => (
                            <MenuItem
                                key={queryType.id}
                                value={`${queryType.id},${queryType.name}`}
                            >
                                {queryType.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </FormGroup>
            </div>

            <Divider variant="middle" />
        </GridToolbarContainer>
    );

    const Footer = () => {
        const convertToExcelFormat = (queries: IQueriesReportRow[]) => {
            return queries.map((query) => ({
                ...query,
                date: ISOtoDateTime(query.date),
                queryType: query.queryType,
                tracks: query.tracks.map((track) => `${track.author} ${track.name}`).join(', '),
            }));
        };

        return (
            <GridToolbarContainer>
                <Workbook
                    filename="Отчет по запросам.xlsx"
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
                    <Workbook.Sheet
                        data={convertToExcelFormat(queriesState)}
                        name="Отчет по запросам"
                    >
                        <Workbook.Column label="ID" value="id" />
                        <Workbook.Column label="Дата запроса" value="date" />
                        <Workbook.Column label="Количество треков" value="countTracks" />
                        <Workbook.Column label="Запрашиваемый автор" value="author" />
                        <Workbook.Column label="Пользователь" value="fio" />
                        <Workbook.Column label="Ссылка на VK" value="url" />
                        <Workbook.Column label="Тип запроса" value="queryType" />
                        <Workbook.Column label="Полученные треки" value="tracks" />
                    </Workbook.Sheet>
                </Workbook>
            </GridToolbarContainer>
        );
    };

    return (
        <div>
            <Typography variant="h5" component="h2" color="primary">
                Запросы
            </Typography>

            <div className={classes.content}>
                <XGrid
                    rows={queriesState}
                    columns={columns}
                    pageSize={5}
                    loading={loading}
                    scrollbarSize={10}
                    components={{
                        Toolbar,
                        Footer,
                    }}
                    disableColumnFilter
                />
            </div>
        </div>
    );
};

export default QueriesReport;
