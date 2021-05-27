import React from 'react';
import { Typography, TextField, Button, useTheme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useForm, Controller } from 'react-hook-form';
import { ITrack } from '../../store/tracks';

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

export type createTrackFormType = {
    name: string;
    author: string;
};

interface IProps {
    title: string;
    onSuccessConfirm: (data: createTrackFormType, track: ITrack | undefined) => void;
    // eslint-disable-next-line react/require-default-props
    track?: ITrack;
}

const CreateTrack = (props: IProps): JSX.Element => {
    const { title, onSuccessConfirm, track } = props;

    const classes = useStyles();
    const theme = useTheme();

    const { handleSubmit, control, formState } = useForm();

    const onSubmitHandler = (data: createTrackFormType) => {
        onSuccessConfirm(data, track);
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
                rules={{ required: { value: true, message: 'Введите название' } }}
                defaultValue={track ? track.name : ''}
            />

            <Controller
                render={({ field }) => (
                    <TextField
                        className={classes.field}
                        variant="outlined"
                        label="Автор"
                        error={!!formState.errors?.author?.message}
                        helperText={formState.errors?.author?.message}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...field}
                    />
                )}
                name="author"
                control={control}
                rules={{ required: { value: true, message: 'Введите автора' } }}
                defaultValue={track ? track.author : ''}
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

export default CreateTrack;
