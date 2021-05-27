import React, { useEffect, useState } from 'react';
import { Typography, TextField, Button, MenuItem, useTheme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';

import { getUsersAction, IUser } from '../../store/users';
import { IPayment } from '../../store/payments';
import { getSubscriptionsAction, ISubscription } from '../../store/subscriptions';
import { ISOtoDateTimePicker } from '../../utils/formatters';

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '500px',
            padding: '20px',
            boxSizing: 'border-box',
            border: `2px solid ${theme.palette.primary.main}`,
            borderRadius: '10px',
            backgroundColor: 'white',
        },
        title: {
            color: theme.palette.secondary.main,
            marginBottom: '15px',
        },
        field: {
            width: '400px',
            margin: '10px auto',
        },
    });
});

export type createPaymentFormType = {
    date: string;
    user: string;
    subscription: string;
};

interface IProps {
    title: string;
    onSuccessConfirm: (data: createPaymentFormType, payment: IPayment | undefined) => void;
    // eslint-disable-next-line react/require-default-props
    payment?: IPayment;
}

const CreatePayment = (props: IProps): JSX.Element => {
    const { title, onSuccessConfirm, payment } = props;

    const classes = useStyles();
    const theme = useTheme();

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [usersState, setUsersState] = useState<IUser[]>([]);
    const [subscriptionState, setSubscriptionsState] = useState<ISubscription[]>([]);

    const { handleSubmit, control, formState } = useForm();

    useEffect(() => {
        (async () => {
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

            await getSubscriptionsAction()
                .then((subscriptions) => {
                    if (subscriptions[0]) {
                        if (subscriptions[1].length <= 0) {
                            throw new Error('Нет подписок');
                        }

                        setSubscriptionsState(subscriptions[1]);
                    } else {
                        throw new Error(subscriptions[1]);
                    }
                })
                .catch((error) => {
                    setSubscriptionsState([]);

                    const snackBar = enqueueSnackbar(error.message, {
                        variant: 'error',
                        anchorOrigin: { horizontal: 'right', vertical: 'top' },
                        onClick: () => closeSnackbar(snackBar),
                    });
                });
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSubmitHandler = (data: createPaymentFormType) => {
        onSuccessConfirm(data, payment);
    };

    return (
        <form onSubmit={handleSubmit(onSubmitHandler)} className={classes.root}>
            <Typography variant="h5" component="span" color="primary">
                {title}
            </Typography>
            <Controller
                render={({ field }) => (
                    <TextField
                        className={classes.field}
                        variant="outlined"
                        label="Дата оплаты"
                        type="datetime-local"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        inputProps={{
                            min: '2020-03-29T00:00',
                            max: new Date(
                                new Date().getTime() - new Date().getTimezoneOffset() * 60000,
                            )
                                .toISOString()
                                .slice(0, -1),
                        }}
                        disabled={usersState.length <= 0}
                        error={!!formState.errors?.date?.message}
                        helperText={formState.errors?.date?.message}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...field}
                    />
                )}
                name="date"
                control={control}
                rules={{ required: { value: true, message: 'Введите дату оплаты' } }}
                defaultValue={payment ? ISOtoDateTimePicker(payment.date) : ''}
            />

            <Controller
                render={({ field }) => {
                    return (
                        <TextField
                            className={classes.field}
                            select
                            variant="outlined"
                            label="Пользователь"
                            disabled={usersState.length <= 0}
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            error={!!formState.errors?.user?.message}
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            helperText={formState.errors?.user?.message}
                            value={field.value}
                            SelectProps={{
                                value: field.value,
                                renderValue: (selected) => (selected as string).split(',')[1],
                                onChange: field.onChange,
                            }}
                        >
                            {usersState.map((user) => (
                                <MenuItem
                                    key={user.id}
                                    // eslint-disable-next-line max-len
                                    value={`${user.id},${user.fio},${user.url}`}
                                >
                                    {`${user.fio} ${user.url}`}
                                </MenuItem>
                            ))}
                        </TextField>
                    );
                }}
                control={control}
                name="user"
                rules={{ required: { value: true, message: 'Выберите пользователя' } }}
                defaultValue={payment ? `${payment.userId},${payment.fio},${payment.url}` : ''}
            />

            <Controller
                render={({ field }) => {
                    return (
                        <TextField
                            className={classes.field}
                            select
                            variant="outlined"
                            label="Подписка"
                            disabled={subscriptionState.length <= 0}
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            error={!!formState.errors?.subscription?.message}
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            helperText={formState.errors?.subscription?.message}
                            value={field.value}
                            SelectProps={{
                                value: field.value,
                                renderValue: (selected) => (selected as string).split(',')[1],
                                onChange: field.onChange,
                            }}
                        >
                            {subscriptionState.map((subscription) => (
                                <MenuItem
                                    key={subscription.id}
                                    // eslint-disable-next-line max-len
                                    value={`${subscription.id},${subscription.name}`}
                                >
                                    {subscription.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    );
                }}
                control={control}
                name="subscription"
                rules={{ required: { value: true, message: 'Выберите подписку' } }}
                defaultValue={payment ? `${payment.subscriptionId},${payment.subscription}` : ''}
            />

            <Button
                variant="contained"
                color="primary"
                type="submit"
                style={{ color: theme.palette.secondary.light }}
                disabled={usersState.length <= 0}
            >
                Подтвердить
            </Button>
        </form>
    );
};

export default CreatePayment;
