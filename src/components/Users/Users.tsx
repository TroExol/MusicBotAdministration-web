import React, { useEffect, useState } from 'react';

import { Button, makeStyles, Modal, Typography, useTheme } from '@material-ui/core';
import { XGrid, GridColDef, GridRowSelectedParams } from '@material-ui/x-grid';
import { useSnackbar } from 'notistack';

import { renderCellExpand } from '../GridCellExpand/GridCellExpand';
import { addUserAction, getUsersAction, IUser, updateUserAction } from '../../store/users';
import CreateUser, { createUserFormType } from './CreateUser';

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
        field: 'fio',
        headerName: 'Фамилия и имя',
        flex: 0.5,
        renderCell: renderCellExpand,
    },
    {
        field: 'url',
        headerName: 'Ссылка на VK',
        flex: 0.5,
        renderCell: renderCellExpand,
    },
];

const Users = (): JSX.Element => {
    const classes = useStyles();

    const theme = useTheme();

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [usersState, setUsersState] = useState<IUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [openCreateState, setOpenCreateState] = useState<boolean>(false);
    const [openEditState, setOpenEditState] = useState<boolean>(false);

    const onSuccessCreateHandler = async (data: createUserFormType) => {
        setOpenCreateState(() => false);

        const { fio, url } = data;

        const user = { id: -1, fio, url };

        const userId = await addUserAction(user);

        if (userId[0]) {
            setUsersState([...usersState, { id: userId[1], fio, url }]);

            const snackBar = enqueueSnackbar('Пользователь успешно добавлен', {
                variant: 'success',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
        } else {
            const snackBar = enqueueSnackbar(userId[1], {
                variant: 'error',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
        }
    };

    const rowSelectionHandler = (row: GridRowSelectedParams) => {
        const newState = row.data as IUser;
        setSelectedUser(() => newState);
    };

    const editQueryHandler = () => {
        if (!selectedUser) {
            const snackBar = enqueueSnackbar('Выберите 1 пользователя', {
                variant: 'error',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
            return;
        }

        setOpenEditState(() => true);
    };

    const onSuccessEditHandler = async (data: createUserFormType, user: IUser | undefined) => {
        setOpenEditState(() => false);

        const { fio, url } = data;

        const updatedUser: IUser = {
            id: (user as IUser).id,
            fio,
            url,
        };

        const userId = await updateUserAction(updatedUser);

        if (userId[0]) {
            const newState = usersState.map((userState) =>
                userState.id !== userId[1] ? userState : updatedUser,
            );

            setUsersState(newState);
            setSelectedUser(updatedUser);

            const snackBar = enqueueSnackbar('Пользователь успешно изменен', {
                variant: 'success',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
        } else {
            const snackBar = enqueueSnackbar(userId[1], {
                variant: 'error',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });
        }
    };

    useEffect(() => {
        getUsersAction()
            .then((users) => {
                if (users[0]) {
                    if (users[1].length <= 0) {
                        throw new Error('Нет пользователей');
                    }
                    setTimeout(() => {
                        setUsersState(users[1]);
                        setLoading(false);
                    }, 0);
                } else {
                    throw new Error(users[1]);
                }
            })
            .catch((error) => {
                setUsersState([]);
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
                Пользователи
            </Typography>

            <div className={classes.content}>
                <XGrid
                    rows={usersState}
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
                        onClick={editQueryHandler}
                    >
                        Изменить
                    </Button>

                    <Modal
                        className={classes.modal}
                        open={openCreateState}
                        onBackdropClick={() => setOpenCreateState(() => false)}
                    >
                        <CreateUser
                            title="Создание пользователя"
                            onSuccessConfirm={onSuccessCreateHandler}
                        />
                    </Modal>

                    <Modal
                        className={classes.modal}
                        open={openEditState}
                        onBackdropClick={() => setOpenEditState(() => false)}
                    >
                        <CreateUser
                            title="Изменение пользователя"
                            onSuccessConfirm={onSuccessEditHandler}
                            user={selectedUser as IUser}
                        />
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default Users;
