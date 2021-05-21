import React from 'react';
import { Typography, TextField, Button } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useForm, Controller } from 'react-hook-form';

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

const PasswordEdit = (): JSX.Element => {
    const classes = useStyles();
    const { handleSubmit, control, formState, getValues } = useForm();

    // const [oldPassword, setOldPassword];

    const onSubmitHandler = (data: { name: string; phoneNumber: string }) => {
        console.log(data);
        // onSuccessConfirm();
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
                rules={{ required: { value: true, message: 'Введите старый пароль' } }}
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

export default PasswordEdit;
