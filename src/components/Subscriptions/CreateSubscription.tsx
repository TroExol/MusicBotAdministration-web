import React, { useEffect, useState } from 'react';
import { Typography, TextField, Button, MenuItem, useTheme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';

import { getQueryTypesAction, IQueryType } from '../../store/queryTypes';
import { ISubscription } from '../../store/subscriptions';

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

export type createSubscriptionFormType = {
    name: string;
    amount: string;
    queryTypes: string[];
};

interface IProps {
    title: string;
    onSuccessConfirm: (
        data: createSubscriptionFormType,
        subscription: ISubscription | undefined,
    ) => void;
    // eslint-disable-next-line react/require-default-props
    subscription?: ISubscription;
}

const CreateSubscription = (props: IProps): JSX.Element => {
    const { title, onSuccessConfirm, subscription } = props;

    const classes = useStyles();
    const theme = useTheme();

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [queryTypesState, setQueryTypesState] = useState<IQueryType[]>([]);

    const { handleSubmit, control, formState } = useForm();

    useEffect(() => {
        (async () => {
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
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSubmitHandler = (data: createSubscriptionFormType) => {
        onSuccessConfirm(data, subscription);
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
                        label="Название"
                        error={!!formState.errors?.name?.message}
                        helperText={formState.errors?.name?.message}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...field}
                    />
                )}
                name="name"
                control={control}
                rules={{ required: { value: true, message: 'Заполните название' } }}
                defaultValue={subscription ? subscription.name : ''}
            />

            <Controller
                render={({ field }) => (
                    <TextField
                        className={classes.field}
                        variant="outlined"
                        label="Стоимость, руб"
                        error={!!formState.errors?.amount?.message}
                        helperText={formState.errors?.amount?.message}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...field}
                    />
                )}
                name="amount"
                control={control}
                rules={{
                    required: { value: true, message: 'Заполните стоимость' },
                    min: { value: 0, message: 'Минимальная стоимость - 0' },
                    pattern: {
                        value: /^(\d+\.)?\d+$/g,
                        message: 'Введите положительное число',
                    },
                }}
                defaultValue={subscription ? subscription.amount : ''}
            />

            <Controller
                render={({ field }) => {
                    return (
                        <TextField
                            className={classes.field}
                            select
                            variant="outlined"
                            label="Доступные типы запросов"
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            error={!!formState.errors?.queryTypes?.message}
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            helperText={formState.errors?.queryTypes?.message}
                            value={field.value}
                            SelectProps={{
                                multiple: true,
                                value: field.value,
                                renderValue: (selected) =>
                                    (selected as string[])
                                        .map((value) => {
                                            const split = value.split(',');
                                            return split[1];
                                        })
                                        .join(', '),
                                onChange: field.onChange,
                            }}
                        >
                            {queryTypesState.map((queryType) => (
                                <MenuItem
                                    key={queryType.id}
                                    // eslint-disable-next-line max-len
                                    value={`${queryType.id},${queryType.name}`}
                                >
                                    {queryType.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    );
                }}
                control={control}
                name="queryTypes"
                rules={{ required: { value: true, message: 'Выберите доступные типы запросов' } }}
                defaultValue={
                    subscription
                        ? subscription.queryTypes.map(
                              (queryType) => `${queryType.id},${queryType.name}`,
                          )
                        : []
                }
            />

            <Button
                variant="contained"
                color="primary"
                type="submit"
                style={{ color: theme.palette.secondary.light }}
            >
                Подтвердить
            </Button>
        </form>
    );
};

export default CreateSubscription;
