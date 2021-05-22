import React from 'react';
import { Typography, TextField, Button } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useForm, Controller } from 'react-hook-form';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import { StoreDispatchType, StoreType } from '../../store';

import {
    addAdministratorAction,
    addAdministratorActionType,
    changePasswordAction,
    IAdministrator,
} from '../../store/administrator';

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

interface IProps {
    administrator: StoreType['administrator'];
    addAdministrator: addAdministratorActionType;
}

const PasswordEdit = (props: IProps): JSX.Element => {
    const { administrator, addAdministrator } = props;

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const classes = useStyles();
    const { handleSubmit, control, formState, getValues } = useForm();

    const onSubmitHandler = async (data: {
        oldPassword: string;
        newPassword: string;
        newPasswordRepeat: string;
    }) => {
        if (!administrator.id) {
            const snackBar = enqueueSnackbar('Что-то пошло не так. Попробуйте обновить страницу', {
                variant: 'error',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });

            return;
        }

        const resultTuple = await changePasswordAction({
            id: administrator.id,
            newPassword: data.newPassword,
        });

        if (resultTuple[0]) {
            addAdministrator({
                administrator: { ...administrator, password: resultTuple[1].password },
            });

            const snackBar = enqueueSnackbar('Пароль успешно изменен', {
                variant: 'success',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
        } else {
            const snackBar = enqueueSnackbar(resultTuple[1], {
                variant: 'error',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmitHandler)} className={classes.root}>
            <Typography variant="h5" component="span" color="secondary">
                Изменение пароля
            </Typography>

            <Controller
                render={({ field }) => (
                    <TextField
                        className={classes.field}
                        variant="outlined"
                        label="Старый пароль"
                        type="password"
                        error={!!formState.errors?.oldPassword?.message}
                        helperText={formState.errors?.oldPassword?.message}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...field}
                    />
                )}
                name="oldPassword"
                control={control}
                rules={{
                    required: { value: true, message: 'Введите старый пароль' },
                    validate: (value) =>
                        administrator.password === value ? true : 'Старый пароль указан неверно',
                    minLength: {
                        value: 6,
                        message: 'Длина пароля должна быть больше 5',
                    },
                }}
                defaultValue=""
            />

            <Controller
                render={({ field }) => (
                    <TextField
                        className={classes.field}
                        variant="outlined"
                        label="Новый пароль"
                        type="password"
                        error={!!formState.errors?.newPassword?.message}
                        helperText={formState.errors?.newPassword?.message}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...field}
                    />
                )}
                name="newPassword"
                control={control}
                rules={{
                    required: { value: true, message: 'Введите новый пароль' },
                    validate: (value) =>
                        getValues('oldPassword') !== value
                            ? true
                            : 'Новый пароль должен отличаться от старого',
                    minLength: {
                        value: 6,
                        message: 'Длина пароля должна быть больше 5',
                    },
                }}
                defaultValue=""
            />

            <Controller
                render={({ field }) => (
                    <TextField
                        className={classes.field}
                        variant="outlined"
                        label="Повторите новый пароль"
                        type="password"
                        error={!!formState.errors?.newPasswordRepeat?.message}
                        helperText={formState.errors?.newPasswordRepeat?.message}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...field}
                    />
                )}
                name="newPasswordRepeat"
                control={control}
                rules={{
                    required: { value: true, message: 'Повторите новый пароль' },
                    validate: (value) =>
                        getValues('newPassword') === value ? true : 'Пароль не совпадает',
                }}
                defaultValue=""
            />

            <Button variant="contained" color="secondary" type="submit">
                Подтвердить
            </Button>
        </form>
    );
};

const mapStateToProps = (state: StoreType) => {
    return {
        administrator: state.administrator,
    };
};

const mapDispatchToProps = (dispatch: StoreDispatchType) => {
    return {
        addAdministrator: ({ administrator }: { administrator: IAdministrator }) =>
            dispatch(addAdministratorAction({ administrator })),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(PasswordEdit);
