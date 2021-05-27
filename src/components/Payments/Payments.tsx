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
import { XGrid, GridColDef, GridRowSelectedParams } from '@material-ui/x-grid';
import { useSnackbar } from 'notistack';

import { renderCellExpand } from '../GridCellExpand/GridCellExpand';
import CreatePayment, { createPaymentFormType } from './CreatePayment';
import { ISOtoDateTime } from '../../utils/formatters';
import {
    addPaymentAction,
    deletePaymentAction,
    getPaymentsAction,
    IPayment,
    updatePaymentAction,
} from '../../store/payments';

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
        headerName: 'Дата оплаты',
        width: 190,
        type: 'dateTime',
        renderCell: (params) =>
            renderCellExpand(params, (parameters) => ISOtoDateTime(parameters.value as string)),
    },
    {
        field: 'amount',
        headerName: 'Сумма, руб',
        type: 'number',
        width: 200,
        renderCell: renderCellExpand,
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
    },
    { field: 'subscription', headerName: 'Подписка', width: 180, renderCell: renderCellExpand },
];

const Payments = (): JSX.Element => {
    const classes = useStyles();

    const theme = useTheme();

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [paymentsState, setPaymentsState] = useState<IPayment[]>([]);
    const [selectedPayments, setSelectedPayments] = useState<IPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [openCreateState, setOpenCreateState] = useState<boolean>(false);
    const [openEditState, setOpenEditState] = useState<boolean>(false);
    const [openDeleteConfirmationState, setOpenDeleteConfirmationState] = useState<boolean>(false);

    const handleDelete = async () => {
        const deletedPaymentIds: number[] = [];

        // eslint-disable-next-line no-restricted-syntax
        for (const payments of selectedPayments) {
            // eslint-disable-next-line no-await-in-loop
            const res = await deletePaymentAction(payments.id);

            if (res[0]) {
                deletedPaymentIds.push(payments.id);

                const snackBar = enqueueSnackbar(`Оплата с id ${payments.id} успешно удалена`, {
                    variant: 'success',
                    anchorOrigin: { horizontal: 'right', vertical: 'top' },
                    onClick: () => closeSnackbar(snackBar),
                });
            } else {
                const snackBar = enqueueSnackbar(`Не удалось удалить оплату с id ${payments.id}`, {
                    variant: 'error',
                    anchorOrigin: { horizontal: 'right', vertical: 'top' },
                    onClick: () => closeSnackbar(snackBar),
                });
            }
        }

        setPaymentsState(() =>
            paymentsState.filter(
                (payment) => !deletedPaymentIds.some((paymentId) => payment.id === paymentId),
            ),
        );

        setSelectedPayments(() =>
            selectedPayments.filter(
                (payment) => !deletedPaymentIds.some((paymentId) => payment.id === paymentId),
            ),
        );

        setOpenDeleteConfirmationState(() => false);
    };

    const handleDeleteConfirmationClick = () => {
        if (selectedPayments.length <= 0) {
            const snackBar = enqueueSnackbar('Выберите минимум 1 оплату', {
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

    const onSuccessCreateHandler = async (data: createPaymentFormType) => {
        setOpenCreateState(() => false);

        const { date, user, subscription } = data;

        const payment: IPayment = {
            id: -1,
            date: `${date}:00.000Z`,
            userId: Number(user.split(',')[0]),
            fio: user.split(',')[1],
            url: user.split(',')[2],
            subscriptionId: Number(subscription.split(',')[0]),
            subscription: subscription.split(',')[1],
        };

        const paymentId = await addPaymentAction(payment);

        if (paymentId[0]) {
            const snackBar = enqueueSnackbar('Оплата успешно добавлена', {
                variant: 'success',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });

            updateTable();
        } else {
            const snackBar = enqueueSnackbar(paymentId[1], {
                variant: 'error',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
        }
    };

    const rowSelectionHandler = (row: GridRowSelectedParams) => {
        if (row.isSelected) {
            const newState = [...selectedPayments, row.data as IPayment];
            setSelectedPayments(() => newState);
        } else {
            const newState = selectedPayments.filter((payment) => payment.id !== row.data.id);
            setSelectedPayments(() => newState);
        }
    };

    const editPaymentHandler = () => {
        if (selectedPayments.length !== 1) {
            const snackBar = enqueueSnackbar('Выберите 1 оплату', {
                variant: 'error',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
            return;
        }

        setOpenEditState(() => true);
    };

    const onSuccessEditHandler = async (
        data: createPaymentFormType,
        payment: IPayment | undefined,
    ) => {
        setOpenEditState(() => false);

        const { date, user, subscription } = data;

        const updatedPayment: IPayment = {
            id: (payment as IPayment).id,
            date: `${date}:00.000Z`,
            userId: Number(user.split(',')[0]),
            fio: user.split(',')[1],
            url: user.split(',')[2],
            subscriptionId: Number(subscription.split(',')[0]),
            subscription: subscription.split(',')[1],
        };

        const paymentId = await updatePaymentAction(updatedPayment);

        if (paymentId[0]) {
            const snackBar = enqueueSnackbar('Запрос успешно изменен', {
                variant: 'success',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });

            setSelectedPayments([]);
            updateTable();
        } else {
            const snackBar = enqueueSnackbar(paymentId[1], {
                variant: 'error',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
        }
    };

    function updateTable() {
        setLoading(() => true);

        getPaymentsAction()
            .then((payments) => {
                if (payments[0]) {
                    if (payments[1].length <= 0) {
                        throw new Error('Нет оплат');
                    }
                    setTimeout(() => {
                        setPaymentsState(() => payments[1]);
                        setLoading(() => false);
                    }, 0);
                } else {
                    throw new Error(payments[1]);
                }
            })
            .catch((error) => {
                setPaymentsState([]);
                setLoading(false);

                const snackBar = enqueueSnackbar(error.message, {
                    variant: 'error',
                    anchorOrigin: { horizontal: 'right', vertical: 'top' },
                    onClick: () => closeSnackbar(snackBar),
                });
            });
    }

    useEffect(() => {
        updateTable();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <Typography variant="h5" component="h2" color="primary">
                Оплаты
            </Typography>

            <div className={classes.content}>
                <XGrid
                    rows={paymentsState}
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
                        onClick={editPaymentHandler}
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
                        <CreatePayment
                            title="Создание оплаты"
                            onSuccessConfirm={onSuccessCreateHandler}
                        />
                    </Modal>

                    <Modal
                        className={classes.modal}
                        open={openEditState}
                        onBackdropClick={() => setOpenEditState(() => false)}
                    >
                        <CreatePayment
                            title="Изменение оплаты"
                            onSuccessConfirm={onSuccessEditHandler}
                            payment={selectedPayments[0]}
                        />
                    </Modal>

                    <Dialog
                        open={openDeleteConfirmationState}
                        onClose={handleDeleteConfirmationClose}
                        aria-labelledby="alert-dialog-delete"
                    >
                        <DialogTitle id="alert-dialog-delete">
                            Вы точно хотите удалить выбранные оплаты?
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

export default Payments;
