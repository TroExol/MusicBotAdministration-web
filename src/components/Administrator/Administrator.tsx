import React, { MouseEvent, useState } from 'react';
import {
    Button,
    createStyles,
    Dialog,
    DialogActions,
    DialogTitle,
    makeStyles,
    Menu,
    MenuItem,
    Modal,
    Theme,
    useTheme,
} from '@material-ui/core';
import { ArrowDropDownOutlined, PersonOutlined } from '@material-ui/icons';
import { connect } from 'react-redux';

import PasswordEdit from '../PasswordEdit/PasswordEdit';
import { StoreDispatchType } from '../../store';
import {
    deleteAdministratorAction,
    deleteAdministratorActionType,
} from '../../store/administrator';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        modal: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
        },
    }),
);

interface IProps {
    deleteAdministrator: deleteAdministratorActionType;
}

const Administrator = (props: IProps): JSX.Element => {
    const { deleteAdministrator } = props;

    const classes = useStyles();
    const theme = useTheme();

    const [userEl, setUserEl] = useState<null | HTMLElement>(null);

    const [openExitConfirmationState, setOpenExitConfirmationState] = useState<boolean>(false);
    const [openChangePasswordState, setOpenChangePasswordState] = useState<boolean>(false);

    const handleUserClick = (event: MouseEvent<HTMLButtonElement>) => {
        setUserEl(() => event.currentTarget);
    };

    const handleUserClose = () => {
        setUserEl(() => null);
    };

    const handleExit = () => {
        deleteAdministrator();
    };

    const handleChangePasswordClick = () => {
        setOpenChangePasswordState(() => true);
        handleUserClose();
    };

    const handleChangePasswordClose = () => {
        setOpenChangePasswordState(() => false);
    };

    const handleExitConfirmationClick = () => {
        setOpenExitConfirmationState(() => true);
        handleUserClose();
    };

    const handleExitConfirmationClose = () => {
        setOpenExitConfirmationState(() => false);
    };

    return (
        <div>
            <Button
                aria-controls="user-menu"
                aria-haspopup="true"
                color="primary"
                variant="contained"
                onClick={handleUserClick}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <PersonOutlined style={{ color: theme.palette.secondary.light }} />
                <ArrowDropDownOutlined style={{ color: theme.palette.secondary.light }} />
            </Button>

            <Menu
                id="user-menu"
                anchorEl={userEl}
                keepMounted
                open={Boolean(userEl)}
                onClose={handleUserClose}
            >
                <MenuItem onClick={handleChangePasswordClick}>?????????????? ????????????</MenuItem>
                <MenuItem onClick={handleExitConfirmationClick}>??????????</MenuItem>
            </Menu>

            <Modal
                className={classes.modal}
                open={openChangePasswordState}
                onBackdropClick={handleChangePasswordClose}
            >
                <PasswordEdit />
            </Modal>

            <Dialog
                open={openExitConfirmationState}
                onClose={handleExitConfirmationClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    ???? ?????????? ???????????? ?????????? ???? ?????????????????
                </DialogTitle>
                <DialogActions>
                    <Button
                        onClick={handleExitConfirmationClose}
                        color="primary"
                        variant="contained"
                        style={{ color: theme.palette.secondary.light }}
                        autoFocus
                    >
                        ????????????????
                    </Button>
                    <Button
                        onClick={handleExit}
                        color="primary"
                        variant="outlined"
                        style={{ color: theme.palette.primary.main }}
                    >
                        ??????????
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

const mapDispatchToProps = (dispatch: StoreDispatchType) => {
    return {
        deleteAdministrator: () => dispatch(deleteAdministratorAction()),
    };
};

export default connect(undefined, mapDispatchToProps)(Administrator);
