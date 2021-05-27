import React, { useEffect, useState } from 'react';

import { Button, makeStyles, Modal, Typography, useTheme } from '@material-ui/core';
import {
    XGrid,
    GridColDef,
    GridValueFormatterParams,
    GridRowSelectedParams,
} from '@material-ui/x-grid';
import { useSnackbar } from 'notistack';

import { renderCellExpand } from '../GridCellExpand/GridCellExpand';
import { IQueryType } from '../../store/queryTypes';
import {
    addSubscriptionAction,
    getSubscriptionsAction,
    ISubscription,
    updateSubscriptionAction,
} from '../../store/subscriptions';
import CreateSubscription, { createSubscriptionFormType } from './CreateSubscription';

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
        width: 200,
        renderCell: renderCellExpand,
    },
    {
        field: 'amount',
        headerName: 'Стоимость, руб',
        type: 'number',
        width: 200,
        renderCell: renderCellExpand,
    },
    {
        field: 'queryTypes',
        headerName: 'Доступные типы запросов',
        width: 200,
        sortable: false,
        flex: 1,
        renderCell: (params) =>
            renderCellExpand(params, (parameters: GridValueFormatterParams) =>
                (parameters.value as IQueryType[]).map((queryType) => queryType.name).join(', '),
            ),
    },
];

const Subscriptions = (): JSX.Element => {
    const classes = useStyles();

    const theme = useTheme();

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [subscriptionsState, setSubscriptionsState] = useState<ISubscription[]>([]);
    const [selectedSubscription, setSelectedSubscription] = useState<ISubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [openCreateState, setOpenCreateState] = useState<boolean>(false);
    const [openEditState, setOpenEditState] = useState<boolean>(false);

    const onSuccessCreateHandler = async (data: createSubscriptionFormType) => {
        setOpenCreateState(() => false);

        const { name, amount, queryTypes } = data;

        const subscription: ISubscription = {
            id: -1,
            name,
            amount,
            queryTypes: queryTypes.map((queryType: string) => ({
                id: Number(queryType.split(',')[0]),
                name: queryType.split(',')[1],
            })),
        };

        const subscriptionId = await addSubscriptionAction(subscription);

        if (subscriptionId[0]) {
            setSubscriptionsState([
                ...subscriptionsState,
                { ...subscription, id: subscriptionId[1] },
            ]);

            const snackBar = enqueueSnackbar('Подписка успешно добавлена', {
                variant: 'success',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
        } else {
            const snackBar = enqueueSnackbar(subscriptionId[1], {
                variant: 'error',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
        }
    };

    const rowSelectionHandler = (row: GridRowSelectedParams) => {
        const newState = row.data as ISubscription;
        setSelectedSubscription(() => newState);
    };

    const editQueryHandler = () => {
        if (!selectedSubscription) {
            const snackBar = enqueueSnackbar('Выберите 1 подписку', {
                variant: 'error',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
            return;
        }

        setOpenEditState(() => true);
    };

    const onSuccessEditHandler = async (
        data: createSubscriptionFormType,
        subscription: ISubscription | undefined,
    ) => {
        setOpenEditState(() => false);

        const { name, amount, queryTypes } = data;

        const updatedSubscription: ISubscription = {
            id: (subscription as ISubscription).id,
            name,
            amount,
            queryTypes: queryTypes.map((queryType: string) => ({
                id: Number(queryType.split(',')[0]),
                name: queryType.split(',')[1],
            })),
        };

        const subscriptionId = await updateSubscriptionAction(
            updatedSubscription,
            subscription as ISubscription,
        );

        if (subscriptionId[0]) {
            const newState = subscriptionsState.map((queryState) =>
                queryState.id !== subscriptionId[1] ? queryState : updatedSubscription,
            );

            setSubscriptionsState(newState);
            setSelectedSubscription(updatedSubscription);

            const snackBar = enqueueSnackbar('Подписка успешно изменена', {
                variant: 'success',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
        } else {
            const snackBar = enqueueSnackbar(subscriptionId[1], {
                variant: 'error',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
        }
    };

    useEffect(() => {
        getSubscriptionsAction()
            .then((subscriptions) => {
                if (subscriptions[0]) {
                    if (subscriptions[1].length <= 0) {
                        throw new Error('Нет подписок');
                    }
                    setTimeout(() => {
                        setSubscriptionsState(subscriptions[1]);
                        setLoading(false);
                    }, 0);
                } else {
                    throw new Error(subscriptions[1]);
                }
            })
            .catch((error) => {
                setSubscriptionsState([]);
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
                Подписки
            </Typography>

            <div className={classes.content}>
                <XGrid
                    rows={subscriptionsState}
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
                        <CreateSubscription
                            title="Создание подписки"
                            onSuccessConfirm={onSuccessCreateHandler}
                        />
                    </Modal>

                    <Modal
                        className={classes.modal}
                        open={openEditState}
                        onBackdropClick={() => setOpenEditState(() => false)}
                    >
                        <CreateSubscription
                            title="Изменение подписки"
                            onSuccessConfirm={onSuccessEditHandler}
                            subscription={selectedSubscription as ISubscription}
                        />
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default Subscriptions;
