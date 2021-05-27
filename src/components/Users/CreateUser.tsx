import React from 'react';
import { Typography, TextField, Button, useTheme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useForm, Controller } from 'react-hook-form';
import { IUser } from '../../store/users';

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

export type createUserFormType = {
    fio: string;
    url: string;
};

interface IProps {
    title: string;
    onSuccessConfirm: (data: createUserFormType, user: IUser | undefined) => void;
    // eslint-disable-next-line react/require-default-props
    user?: IUser;
}

const CreateUser = (props: IProps): JSX.Element => {
    const { title, onSuccessConfirm, user } = props;

    const classes = useStyles();
    const theme = useTheme();

    const { handleSubmit, control, formState } = useForm();

    const onSubmitHandler = (data: createUserFormType) => {
        onSuccessConfirm(data, user);
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
                        label="Фамилия и имя"
                        disabled={!!user}
                        error={!!formState.errors?.fio?.message}
                        helperText={formState.errors?.fio?.message}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...field}
                    />
                )}
                name="fio"
                control={control}
                rules={{ required: { value: !user, message: 'Введите фамилию и имя' } }}
                defaultValue={user ? user.fio : ''}
            />

            <Controller
                render={({ field }) => (
                    <TextField
                        className={classes.field}
                        variant="outlined"
                        label="Ссылка на VK"
                        error={!!formState.errors?.url?.message}
                        helperText={formState.errors?.url?.message}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...field}
                    />
                )}
                name="url"
                control={control}
                rules={{ required: { value: true, message: 'Введите ссылку на VK' } }}
                defaultValue={user ? user.url : ''}
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

export default CreateUser;
