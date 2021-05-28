import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';

import {
    Button,
    Divider,
    FormGroup,
    makeStyles,
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
import { getQueryTypesReportAction, IQueryTypesReportRow } from '../../store/queryTypesReport';

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
        field: 'name',
        headerName: 'Тип запроса',
        flex: 0.5,
        renderCell: renderCellExpand,
    },
    {
        field: 'count',
        headerName: 'Количество запросов',
        type: 'number',
        flex: 0.5,
        renderCell: renderCellExpand,
    },
];

const QueryTypesReport = (): JSX.Element => {
    const classes = useStyles();

    const theme = useTheme();

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [rowsState, setRowsState] = useState<IQueryTypesReportRow[]>([]);
    const [loading, setLoading] = useState(true);

    const [enableDateFilterState, setEnableDateFilterState] = useState(false);

    const [dateFilterState, setDateFilterState] = useState<[string?, string?]>([]);

    const memoLoadData = useCallback(() => {
        (async () => {
            setLoading(() => true);

            await getQueryTypesReportAction({
                dateFromFilter: enableDateFilterState ? dateFilterState[0] : undefined,
                dateToFilter: enableDateFilterState ? dateFilterState[1] : undefined,
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
        })();

        // eslint-disable-next-line
    }, [enableDateFilterState, dateFilterState]);

    // eslint-disable-next-line
    useEffect(
        memoLoadData,
        // eslint-disable-next-line
        [enableDateFilterState, dateFilterState],
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
            </div>

            <Divider variant="middle" />
        </GridToolbarContainer>
    );

    const ExportButton = () => {
        return (
            <GridToolbarContainer>
                <Workbook
                    filename="Отчет по популярности типов запросов.xlsx"
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
                    <Workbook.Sheet data={rowsState} name="Отчет по типам запросов">
                        <Workbook.Column label="Тип запроса" value="name" />
                        <Workbook.Column label="Количество" value="count" />
                    </Workbook.Sheet>
                </Workbook>
            </GridToolbarContainer>
        );
    };

    return (
        <div>
            <Typography variant="h5" component="h2" color="primary">
                Популярность типов запросов
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

export default QueryTypesReport;
