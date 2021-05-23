import React, { useEffect, useState } from 'react';

import {
    Button,
    Dialog,
    DialogActions,
    DialogTitle,
    makeStyles,
    Modal,
    Typography,
    useTheme,
} from '@material-ui/core';
import {
    XGrid,
    GridColDef,
    GridValueFormatterParams,
    GridRowSelectedParams,
} from '@material-ui/x-grid';
import { useSnackbar } from 'notistack';

import {
    addQueryAction,
    deleteQueryAction,
    getQueriesAction,
    IQuery,
    updateQueryAction,
} from '../../store/queries';
import { ITrack } from '../../store/tracks';
import { renderCellExpand } from '../GridCellExpand/GridCellExpand';
import CreateQuery, { createQueryFormType } from './CreateQuery';
import { ISOtoDateTime } from '../../utils/formatters';

const useStyles = makeStyles({
    content: {
        marginTop: '10px',
        height: '460px',
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
});

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', type: 'number', renderCell: renderCellExpand },
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
    },
    {
        field: 'author',
        headerName: 'Запрашиваемый автор',
        width: 200,
        renderCell: renderCellExpand,
    },
    { field: 'user', headerName: 'Пользователь', width: 190, renderCell: renderCellExpand },
    {
        field: 'userUrl',
        headerName: 'Ссылка на пользователя',
        width: 250,
        renderCell: renderCellExpand,
    },
    { field: 'queryType', headerName: 'Тип запроса', width: 180, renderCell: renderCellExpand },
    {
        field: 'tracks',
        headerName: 'Полученные треки',
        width: 200,
        sortable: false,
        renderCell: (params) =>
            renderCellExpand(params, (parameters: GridValueFormatterParams) =>
                (parameters.value as ITrack[])
                    .map((track) => `${track.author} ${track.track}`)
                    .join(', '),
            ),
    },
];

const Queries = (): JSX.Element => {
    const classes = useStyles();

    const theme = useTheme();

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [queriesState, setQueriesState] = useState<IQuery[]>([]);
    const [selectedQueries, setSelectedQueries] = useState<IQuery[]>([]);
    const [loading, setLoading] = useState(true);
    const [openCreateState, setOpenCreateState] = useState<boolean>(false);
    const [openEditState, setOpenEditState] = useState<boolean>(false);
    const [openDeleteConfirmationState, setOpenDeleteConfirmationState] = useState<boolean>(false);

    const handleDelete = async () => {
        const deletedQueryIds: number[] = [];

        // eslint-disable-next-line no-restricted-syntax
        for (const query of selectedQueries) {
            // eslint-disable-next-line no-await-in-loop
            const res = await deleteQueryAction(query.id);

            if (res[0]) {
                deletedQueryIds.push(query.id);

                const snackBar = enqueueSnackbar(`Запрос с id ${query.id} успешно удален`, {
                    variant: 'success',
                    anchorOrigin: { horizontal: 'right', vertical: 'top' },
                    onClick: () => closeSnackbar(snackBar),
                });
            } else {
                const snackBar = enqueueSnackbar(`Не удалось удалить запрос с id ${query.id}`, {
                    variant: 'error',
                    anchorOrigin: { horizontal: 'right', vertical: 'top' },
                    onClick: () => closeSnackbar(snackBar),
                });
            }
        }

        setQueriesState(() =>
            queriesState.filter(
                (query) => !deletedQueryIds.some((queryId) => query.id === queryId),
            ),
        );

        setSelectedQueries(() =>
            selectedQueries.filter(
                (query) => !deletedQueryIds.some((queryId) => query.id === queryId),
            ),
        );

        setOpenDeleteConfirmationState(() => false);
    };

    const handleDeleteConfirmationClick = () => {
        if (selectedQueries.length <= 0) {
            const snackBar = enqueueSnackbar('Выберите минимум 1 запрос', {
                variant: 'error',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
            return;
        }

        setOpenDeleteConfirmationState(() => true);
    };

    const handleDeleteConfirmationClose = () => {
        setOpenDeleteConfirmationState(() => false);
    };

    const onSuccessCreateHandler = async (data: createQueryFormType) => {
        setOpenCreateState(() => false);

        const { author, countTracks, date, queryType, tracks, user } = data;

        const query: IQuery = {
            id: -1,
            author,
            countTracks: Number(countTracks),
            date: `${date}:00.000Z`,
            queryTypeId: Number(queryType.split(',')[0]),
            queryType: queryType.split(',')[1],
            userId: Number(user.split(',')[0]),
            user: user.split(',')[1],
            userUrl: user.split(',')[2],
            tracks: tracks.map((track: string) => ({
                id: Number(track.split(',')[0]),
                track: track.split(',')[1],
                authorId: Number(track.split(',')[2]),
                author: track.split(',')[3],
            })),
        };

        const queryId = await addQueryAction(query);

        if (queryId[0]) {
            setQueriesState([...queriesState, { ...query, id: queryId[1] }]);

            const snackBar = enqueueSnackbar('Запрос успешно добавлен', {
                variant: 'success',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
        } else {
            const snackBar = enqueueSnackbar(queryId[1], {
                variant: 'error',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
        }
    };

    const rowSelectionHandler = (row: GridRowSelectedParams) => {
        if (row.isSelected) {
            const newState = [...selectedQueries, row.data as IQuery];
            setSelectedQueries(() => newState);
        } else {
            const newState = selectedQueries.filter((query) => query.id !== row.data.id);
            setSelectedQueries(() => newState);
        }
    };

    const editQueryHandler = () => {
        if (selectedQueries.length !== 1) {
            const snackBar = enqueueSnackbar('Выберите 1 запрос', {
                variant: 'error',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
            return;
        }

        setOpenEditState(() => true);
    };

    const onSuccessEditHandler = async (data: createQueryFormType, query: IQuery | undefined) => {
        setOpenEditState(() => false);

        const { author, countTracks, date, queryType, tracks, user } = data;

        const updatedQuery: IQuery = {
            id: (query as IQuery).id,
            author,
            countTracks: Number(countTracks),
            date: `${date}:00.000Z`,
            queryTypeId: Number(queryType.split(',')[0]),
            queryType: queryType.split(',')[1],
            userId: Number(user.split(',')[0]),
            user: user.split(',')[1],
            userUrl: user.split(',')[2],
            tracks: tracks.map((track: string) => ({
                id: Number(track.split(',')[0]),
                track: track.split(',')[1],
                authorId: Number(track.split(',')[2]),
                author: track.split(',')[3],
            })),
        };

        const queryId = await updateQueryAction(updatedQuery);

        if (queryId[0]) {
            const newState = queriesState.map((queryState) =>
                queryState.id !== queryId[1] ? queryState : updatedQuery,
            );

            setQueriesState(newState);

            const snackBar = enqueueSnackbar('Запрос успешно изменен', {
                variant: 'success',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
        } else {
            const snackBar = enqueueSnackbar(queryId[1], {
                variant: 'error',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
        }
    };

    useEffect(() => {
        getQueriesAction()
            .then((queries) => {
                if (queries[0]) {
                    if (queries[1].length <= 0) {
                        throw new Error('Нет запросов');
                    }

                    setQueriesState(queries[1]);
                    setLoading(false);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                    checkboxSelection
                    loading={loading}
                    scrollbarSize={10}
                    onRowSelected={rowSelectionHandler}
                />

                <div className={classes.actions}>
                    <Button
                        variant="contained"
                        color="primary"
                        style={{ color: theme.palette.secondary.light }}
                        onClick={() => setOpenCreateState(() => true)}
                    >
                        Добавить
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        style={{ color: theme.palette.secondary.light }}
                        onClick={editQueryHandler}
                    >
                        Изменить
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        style={{ color: theme.palette.secondary.light }}
                        onClick={handleDeleteConfirmationClick}
                    >
                        Удалить
                    </Button>

                    <Modal
                        className={classes.modal}
                        open={openCreateState}
                        onBackdropClick={() => setOpenCreateState(() => false)}
                    >
                        <CreateQuery
                            title="Создание запроса"
                            onSuccessConfirm={onSuccessCreateHandler}
                        />
                    </Modal>

                    <Modal
                        className={classes.modal}
                        open={openEditState}
                        onBackdropClick={() => setOpenEditState(() => false)}
                    >
                        <CreateQuery
                            title="Изменение запроса"
                            onSuccessConfirm={onSuccessEditHandler}
                            query={selectedQueries[0]}
                        />
                    </Modal>

                    <Dialog
                        open={openDeleteConfirmationState}
                        onClose={handleDeleteConfirmationClose}
                        aria-labelledby="alert-dialog-delete"
                    >
                        <DialogTitle id="alert-dialog-delete">
                            Вы точно хотите удалить выбранные запросы?
                        </DialogTitle>
                        <DialogActions>
                            <Button
                                onClick={handleDeleteConfirmationClose}
                                color="primary"
                                variant="contained"
                                style={{ color: theme.palette.secondary.light }}
                                autoFocus
                            >
                                Оставить
                            </Button>
                            <Button
                                onClick={handleDelete}
                                color="primary"
                                variant="outlined"
                                style={{ color: theme.palette.primary.main }}
                            >
                                Удалить
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Queries;
