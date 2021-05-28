import React, { useEffect, useState } from 'react';

import { Button, makeStyles, Modal, Typography, useTheme } from '@material-ui/core';
import { XGrid, GridColDef, GridRowSelectedParams } from '@material-ui/x-grid';
import { useSnackbar } from 'notistack';

import { renderCellExpand } from '../GridCellExpand/GridCellExpand';
import CreateQueryType, { createQueryTypeFormType } from './CreateQueryType';
import {
    addQueryTypeAction,
    getQueryTypesAction,
    IQueryType,
    updateQueryTypeAction,
} from '../../store/queryTypes';

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
        field: 'name',
        headerName: 'Название',
        flex: 1,
        renderCell: renderCellExpand,
    },
];

const QueryTypes = (): JSX.Element => {
    const classes = useStyles();

    const theme = useTheme();

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [queryTypesState, setQueryTypesState] = useState<IQueryType[]>([]);
    const [selectedQueryType, setSelectedQueryType] = useState<IQueryType | null>(null);
    const [loading, setLoading] = useState(true);
    const [openCreateState, setOpenCreateState] = useState<boolean>(false);
    const [openEditState, setOpenEditState] = useState<boolean>(false);

    const onSuccessCreateHandler = async (data: createQueryTypeFormType) => {
        setOpenCreateState(() => false);

        const { name } = data;

        const queryType = { id: -1, name };

        const queryTypeId = await addQueryTypeAction(queryType);

        if (queryTypeId[0]) {
            setQueryTypesState([...queryTypesState, { id: queryTypeId[1], name }]);

            const snackBar = enqueueSnackbar('Тип запроса успешно добавлен', {
                variant: 'success',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
        } else {
            const snackBar = enqueueSnackbar(queryTypeId[1], {
                variant: 'error',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
        }
    };

    const rowSelectionHandler = (row: GridRowSelectedParams) => {
        const newState = row.data as IQueryType;
        setSelectedQueryType(() => newState);
    };

    const editQueryHandler = () => {
        if (!selectedQueryType) {
            const snackBar = enqueueSnackbar('Выберите 1 тип запроса', {
                variant: 'error',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
            return;
        }

        setOpenEditState(() => true);
    };

    const onSuccessEditHandler = async (
        data: createQueryTypeFormType,
        queryType: IQueryType | undefined,
    ) => {
        setOpenEditState(() => false);

        const { name } = data;

        const updatedQueryType: IQueryType = {
            id: (queryType as IQueryType).id,
            name,
        };

        const queryTypeId = await updateQueryTypeAction(updatedQueryType);

        if (queryTypeId[0]) {
            const newState = queryTypesState.map((queryTypeState) =>
                queryTypeState.id !== queryTypeId[1] ? queryTypeState : updatedQueryType,
            );

            setQueryTypesState(newState);
            setSelectedQueryType(updatedQueryType);

            const snackBar = enqueueSnackbar('Тип запроса успешно изменен', {
                variant: 'success',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
        } else {
            const snackBar = enqueueSnackbar(queryTypeId[1], {
                variant: 'error',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
        }
    };

    useEffect(() => {
        getQueryTypesAction()
            .then((queryTypes) => {
                if (queryTypes[0]) {
                    if (queryTypes[1].length <= 0) {
                        throw new Error('Нет типов запросов');
                    }
                    setTimeout(() => {
                        setQueryTypesState(queryTypes[1]);
                        setLoading(false);
                    }, 0);
                } else {
                    throw new Error(queryTypes[1]);
                }
            })
            .catch((error) => {
                setTimeout(() => {
                    setQueryTypesState([]);
                    setLoading(false);
                }, 0);

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
                Типы запросов
            </Typography>

            <div className={classes.content}>
                <XGrid
                    rows={queryTypesState}
                    columns={columns}
                    pageSize={5}
                    loading={loading}
                    scrollbarSize={10}
                    disableMultipleSelection
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

                    <Modal
                        className={classes.modal}
                        open={openCreateState}
                        onBackdropClick={() => setOpenCreateState(() => false)}
                    >
                        <CreateQueryType
                            title="Создание типа запроса"
                            onSuccessConfirm={onSuccessCreateHandler}
                        />
                    </Modal>

                    <Modal
                        className={classes.modal}
                        open={openEditState}
                        onBackdropClick={() => setOpenEditState(() => false)}
                    >
                        <CreateQueryType
                            title="Изменение типа запроса"
                            onSuccessConfirm={onSuccessEditHandler}
                            user={selectedQueryType as IQueryType}
                        />
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default QueryTypes;
