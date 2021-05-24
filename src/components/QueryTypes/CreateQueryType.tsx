import React from 'react';
import { Typography, TextField, Button, useTheme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useForm, Controller } from 'react-hook-form';
import { IQueryType } from '../../store/queryTypes';

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

export type createQueryTypeFormType = {
    name: string;
};

interface IProps {
    title: string;
    onSuccessConfirm: (data: createQueryTypeFormType, query: IQueryType | undefined) => void;
    // eslint-disable-next-line react/require-default-props
    queryType?: IQueryType;
}

const CreateQueryType = (props: IProps): JSX.Element => {
    const { title, onSuccessConfirm, queryType } = props;

    const classes = useStyles();
    const theme = useTheme();

    const { handleSubmit, control, formState } = useForm();

    const onSubmitHandler = (data: createQueryTypeFormType) => {
        onSuccessConfirm(data, queryType);
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
                defaultValue={queryType ? queryType.name : ''}
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

export default CreateQueryType;
