import React, { useEffect, useState } from 'react';

import { Button, makeStyles, Modal, Typography, useTheme } from '@material-ui/core';
import { XGrid, GridColDef, GridRowSelectedParams } from '@material-ui/x-grid';
import { useSnackbar } from 'notistack';

import { renderCellExpand } from '../GridCellExpand/GridCellExpand';
import CreateTrack, { createTrackFormType } from './CreateTrack';
import { addTrackAction, getTracksAction, ITrack, updateTrackAction } from '../../store/tracks';

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
        field: 'name',
        headerName: 'Название',
        flex: 0.5,
        renderCell: renderCellExpand,
    },
    {
        field: 'author',
        headerName: 'Автор',
        flex: 0.5,
        renderCell: renderCellExpand,
    },
];

const Tracks = (): JSX.Element => {
    const classes = useStyles();

    const theme = useTheme();

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [tracksState, setTracksState] = useState<ITrack[]>([]);
    const [selectedTrack, setSelectedTrack] = useState<ITrack | null>(null);
    const [loading, setLoading] = useState(true);
    const [openCreateState, setOpenCreateState] = useState<boolean>(false);
    const [openEditState, setOpenEditState] = useState<boolean>(false);

    const onSuccessCreateHandler = async (data: createTrackFormType) => {
        setOpenCreateState(() => false);

        const { name, author } = data;

        const track = { id: -1, name, author };

        const trackId = await addTrackAction(track);

        if (trackId[0]) {
            setTracksState([...tracksState, { id: trackId[1], name, author }]);

            const snackBar = enqueueSnackbar('Трек успешно добавлен', {
                variant: 'success',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
        } else {
            const snackBar = enqueueSnackbar(trackId[1], {
                variant: 'error',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
        }
    };

    const rowSelectionHandler = (row: GridRowSelectedParams) => {
        const newState = row.data as ITrack;
        setSelectedTrack(() => newState);
    };

    const editTrackHandler = () => {
        if (!selectedTrack) {
            const snackBar = enqueueSnackbar('Выберите 1 трек', {
                variant: 'error',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
            return;
        }

        setOpenEditState(() => true);
    };

    const onSuccessEditHandler = async (data: createTrackFormType, track: ITrack | undefined) => {
        setOpenEditState(() => false);

        const { name, author } = data;

        const updatedTrack: ITrack = {
            id: (track as ITrack).id,
            name,
            author,
        };

        const trackId = await updateTrackAction(updatedTrack);

        if (trackId[0]) {
            const newState = tracksState.map((trackState) =>
                trackState.id !== trackId[1] ? trackState : updatedTrack,
            );

            setTracksState(newState);
            setSelectedTrack(updatedTrack);

            const snackBar = enqueueSnackbar('Трек успешно изменен', {
                variant: 'success',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
        } else {
            const snackBar = enqueueSnackbar(trackId[1], {
                variant: 'error',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
        }
    };

    useEffect(() => {
        getTracksAction()
            .then((tracks) => {
                if (tracks[0]) {
                    if (tracks[1].length <= 0) {
                        throw new Error('Нет треков');
                    }
                    setTimeout(() => {
                        setTracksState(tracks[1]);
                        setLoading(false);
                    }, 0);
                } else {
                    throw new Error(tracks[1]);
                }
            })
            .catch((error) => {
                setTracksState([]);
                setLoading(false);

                const snackBar = enqueueSnackbar(error.message, {
                    variant: 'error',
                    anchorOrigin: { horizontal: 'right', vertical: 'top' },
                    onClick: () => closeSnackbar(snackBar),
                });
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <Typography variant="h5" component="h2" color="primary">
                Треки
            </Typography>

            <div className={classes.content}>
                <XGrid
                    rows={tracksState}
                    columns={columns}
                    pageSize={5}
                    loading={loading}
                    scrollbarSize={10}
                    disableMultipleSelection
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
                        onClick={editTrackHandler}
                    >
                        Изменить
                    </Button>

                    <Modal
                        className={classes.modal}
                        open={openCreateState}
                        onBackdropClick={() => setOpenCreateState(() => false)}
                    >
                        <CreateTrack
                            title="Создание трека"
                            onSuccessConfirm={onSuccessCreateHandler}
                        />
                    </Modal>

                    <Modal
                        className={classes.modal}
                        open={openEditState}
                        onBackdropClick={() => setOpenEditState(() => false)}
                    >
                        <CreateTrack
                            title="Изменение трека"
                            onSuccessConfirm={onSuccessEditHandler}
                            track={selectedTrack as ITrack}
                        />
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default Tracks;
