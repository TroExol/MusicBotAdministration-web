import React, { ChangeEvent, useEffect, useState } from 'react';
import { Typography, TextField, Button, MenuItem, useTheme, FormControl } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';

import { getUsersAction, IUser } from '../../store/users';
import { IQuery } from '../../store/queries';
import { ISOtoDateTimePicker } from '../../utils/formatters';
import { getQueryTypesAction, IQueryType } from '../../store/queryTypes';
import { getTracksAction, ITrack } from '../../store/tracks';

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

export type createQueryFormType = {
    date: string;
    countTracks: string;
    author: string;
    queryType: string;
    user: string;
    tracks: string[];
};

interface IProps {
    title: string;
    onSuccessConfirm: (data: createQueryFormType, query: IQuery | undefined) => void;
    // eslint-disable-next-line react/require-default-props
    query?: IQuery;
}

const CreateQuery = (props: IProps): JSX.Element => {
    const { title, onSuccessConfirm, query } = props;

    const classes = useStyles();
    const theme = useTheme();

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [usersState, setUsersState] = useState<IUser[]>([]);
    const [queryTypesState, setQueryTypesState] = useState<IQueryType[]>([]);
    const [tracksState, setTracksState] = useState<ITrack[]>([]);
    const [selectedQueryTypeState, setSelectedQueryTypeState] = useState<string | null>(null);

    const { handleSubmit, control, register, formState } = useForm({
        defaultValues: {
            date: query ? ISOtoDateTimePicker(query.date) : '',
            countTracks: query ? query.countTracks : '',
            author: query ? query.author : '',
            user: query ? `${query.userId},${query.user},${query.userUrl}` : '',
            queryType: query ? `${query.queryTypeId},${query.queryType}` : '',
            tracks: query
                ? query.tracks.map(
                      (track) => `${track.id},${track.track},${track.authorId},${track.author}`,
                  )
                : [],
        },
    });

    useEffect(() => {
        if (query) {
            setSelectedQueryTypeState(() => query.queryType);
        }

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

            await getTracksAction()
                .then((tracks) => {
                    if (tracks[0]) {
                        if (tracks[1].length <= 0) {
                            throw new Error('Нет треков');
                        }

                        setTracksState(tracks[1]);
                    } else {
                        throw new Error(tracks[1]);
                    }
                })
                .catch((error) => {
                    setTracksState([]);

                    const snackBar = enqueueSnackbar(error.message, {
                        variant: 'error',
                        anchorOrigin: { horizontal: 'right', vertical: 'top' },
                        onClick: () => closeSnackbar(snackBar),
                    });
                });
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onChangeQueryTypeSelect = (data: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const queryType = data.target.value.split(',')[1];
        setSelectedQueryTypeState(queryType);
    };

    const onSubmitHandler = (data: createQueryFormType) => {
        onSuccessConfirm(data, query);
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
                        label="Дата запроса"
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
                rules={{ required: { value: true, message: 'Введите дату запроса' } }}
            />

            <Controller
                render={({ field }) => (
                    <TextField
                        className={classes.field}
                        variant="outlined"
                        label="Количество треков"
                        disabled={usersState.length <= 0 || selectedQueryTypeState === 'Функции'}
                        error={!!formState.errors?.countTracks?.message}
                        helperText={formState.errors?.countTracks?.message}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...field}
                    />
                )}
                name="countTracks"
                control={control}
                rules={{
                    required: {
                        value: selectedQueryTypeState !== 'Функции',
                        message: 'Заполните поле количества',
                    },
                    min: { value: 1, message: 'Минимальное количество - 1' },
                    pattern: {
                        value: /^\d+$/g,
                        message: 'Введите целое число',
                    },
                }}
            />

            <Controller
                render={({ field }) => (
                    <TextField
                        className={classes.field}
                        variant="outlined"
                        label="Запрашиваемый автор"
                        disabled={usersState.length <= 0 || selectedQueryTypeState === 'Функции'}
                        error={!!formState.errors?.author?.message}
                        helperText={formState.errors?.author?.message}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...field}
                    />
                )}
                name="author"
                control={control}
            />

            <FormControl>
                <TextField
                    className={classes.field}
                    select
                    variant="outlined"
                    label="Пользователь"
                    disabled={usersState.length <= 0}
                    error={!!formState.errors?.user?.message}
                    helperText={formState.errors?.user?.message}
                    defaultValue={query ? `${query.userId},${query.user},${query.userUrl}` : ''}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...register('user', {
                        required: { value: true, message: 'Выберите пользователя' },
                    })}
                >
                    {usersState.map((user) => (
                        <MenuItem key={user.id} value={`${user.id},${user.fio},${user.url}`}>
                            {user.fio}
                        </MenuItem>
                    ))}
                </TextField>
            </FormControl>

            <FormControl>
                <TextField
                    className={classes.field}
                    select
                    variant="outlined"
                    label="Тип запроса"
                    disabled={usersState.length <= 0}
                    error={!!formState.errors?.queryType?.message}
                    helperText={formState.errors?.queryType?.message}
                    defaultValue={query ? `${query.queryTypeId},${query.queryType}` : ''}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...register('queryType', {
                        required: { value: true, message: 'Выберите тип запроса' },
                    })}
                    onChange={onChangeQueryTypeSelect}
                >
                    {queryTypesState.map((queryType) => (
                        <MenuItem key={queryType.id} value={`${queryType.id},${queryType.name}`}>
                            {queryType.name}
                        </MenuItem>
                    ))}
                </TextField>
            </FormControl>

            <Controller
                render={({ field }) => {
                    return (
                        <TextField
                            className={classes.field}
                            select
                            variant="outlined"
                            label="Полученные треки"
                            disabled={
                                usersState.length <= 0 || selectedQueryTypeState === 'Функции'
                            }
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            error={!!formState.errors?.tracks?.message}
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            helperText={formState.errors?.tracks?.message}
                            value={field.value}
                            SelectProps={{
                                multiple: true,
                                value: field.value,
                                renderValue: (selected) =>
                                    (selected as string[])
                                        .map((value) => {
                                            const split = value.split(',');
                                            return `${split[3]} ${split[1]}`;
                                        })
                                        .join(', '),
                                onChange: field.onChange,
                            }}
                        >
                            {tracksState.map((track) => (
                                <MenuItem
                                    key={track.id}
                                    // eslint-disable-next-line max-len
                                    value={`${track.id},${track.track},${track.authorId},${track.author}`}
                                >
                                    {`${track.author} ${track.track}`}
                                </MenuItem>
                            ))}
                        </TextField>
                    );
                }}
                control={control}
                name="tracks"
                rules={{
                    required: {
                        value: selectedQueryTypeState !== 'Функции',
                        message: 'Выберите полученные треки',
                    },
                }}
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

export default CreateQuery;
