import React from 'react';

import {
    Button,
    createStyles,
    makeStyles,
    TextField,
    Theme,
    Typography,
    useTheme,
} from '@material-ui/core';
import { useForm, Controller } from 'react-hook-form';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';

import { StoreDispatchType } from '../../store';
import {
    addAdministratorAction,
    addAdministratorActionType,
    getAdministratorAction,
    IAdministrator,
} from '../../store/administrator';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '500px',
            padding: '20px',
            boxSizing: 'border-box',
            border: `2px solid ${theme.palette.primary.main}`,
            borderRadius: '10px',
            backgroundColor: 'white',
        },
        title: {
            marginBottom: '15px',
        },
        field: {
            width: '400px',
            margin: '10px auto',
        },
    }),
);

interface IProps {
    addAdministrator: addAdministratorActionType;
}

const Auth = (props: IProps): JSX.Element => {
    const { addAdministrator } = props;

    const classes = useStyles();

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const { handleSubmit, control, formState } = useForm();
    const theme = useTheme();

    const onSuccessConfirmationHandler = (administrator: IAdministrator) => {
        const snackBar = enqueueSnackbar('Вы успешно вошли', {
            variant: 'success',
            anchorOrigin: { horizontal: 'right', vertical: 'top' },
            onClick: () => closeSnackbar(snackBar),
        });

        addAdministrator({ administrator });
    };

    const onSubmitHandler = async ({ login, password }: { login: string; password: string }) => {
        const administratorTuple = await getAdministratorAction({ login, password });

        if (administratorTuple[0]) {
            onSuccessConfirmationHandler(administratorTuple[1]);
        } else {
            const snackBar = enqueueSnackbar(administratorTuple[1], {
                variant: 'error',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
        }
    };

    return (
        <div className={classes.root}>
            <form onSubmit={handleSubmit(onSubmitHandler)} className={classes.form}>
                <Typography variant="h5" component="span" color="primary" className={classes.title}>
                    Авторизация
                </Typography>

                <Controller
                    render={({ field }) => (
                        <TextField
                            className={classes.field}
                            variant="outlined"
                            label="Логин"
                            error={!!formState.errors?.login?.message}
                            helperText={formState.errors?.login?.message}
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...field}
                        />
                    )}
                    name="login"
                    control={control}
                    rules={{
                        required: { value: true, message: 'Введите логин' },
                        minLength: {
                            value: 3,
                            message: 'Длина логина должна быть больше 2',
                        },
                    }}
                    defaultValue=""
                />

                <Controller
                    render={({ field }) => (
                        <TextField
                            className={classes.field}
                            type="password"
                            variant="outlined"
                            label="Пароль"
                            error={!!formState.errors?.password?.message}
                            helperText={formState.errors?.password?.message}
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...field}
                        />
                    )}
                    name="password"
                    control={control}
                    rules={{
                        required: { value: true, message: 'Введите пароль' },
                        minLength: {
                            value: 6,
                            message: 'Длина пароля должна быть больше 5',
                        },
                    }}
                    defaultValue=""
                />

                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    style={{ color: theme.palette.secondary.light }}
                >
                    Войти
                </Button>
            </form>
        </div>
    );
};

const mapDispatchToProps = (dispatch: StoreDispatchType) => {
    return {
        addAdministrator: ({ administrator }: { administrator: IAdministrator }) =>
            dispatch(addAdministratorAction({ administrator })),
    };
};

export default connect(undefined, mapDispatchToProps)(Auth);
