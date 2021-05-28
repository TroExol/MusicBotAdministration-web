import React, { useEffect, useState } from 'react';
import { Button, useTheme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import { GridToolbarContainer, XGrid } from '@material-ui/x-grid';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Workbook from 'react-excel-workbook';

import { executeQueryAction, IQueryConstructorRow } from '../../store/queryConstructor';
import { renderCellExpand } from '../GridCellExpand/GridCellExpand';

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '700px',
            height: '600px',
            padding: '20px',
            boxSizing: 'border-box',
            border: `2px solid ${theme.palette.secondary.main}`,
            borderRadius: '10px',
            backgroundColor: 'white',
        },
        title: {
            color: theme.palette.primary.main,
            marginBottom: '15px',
        },
        actions: {
            marginTop: '10px',
            '& > button:not(:first-child)': {
                marginLeft: '7px',
            },
        },
        content: {
            height: '90%',
            width: '100%',
        },
    });
});

interface IProps {
    table: string;
    filters: string | undefined;
}

const QueryConstructorTable = (props: IProps): JSX.Element => {
    const { table, filters } = props;

    const classes = useStyles();
    const theme = useTheme();

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [rowsState, setRowsState] = useState<IQueryConstructorRow[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(() => true);

            await executeQueryAction({ table, filters })
                .then((rows) => {
                    if (rows[0]) {
                        if (rows[1].length <= 0) {
                            throw new Error('Нет данных');
                        }

                        setTimeout(() => {
                            setRowsState(rows[1]);
                            setLoading(() => false);
                        }, 0);
                    } else {
                        throw new Error(rows[1]);
                    }
                })
                .catch((error) => {
                    setTimeout(() => {
                        setRowsState([]);
                        setLoading(() => false);
                    }, 0);

                    const snackBar = enqueueSnackbar(error.message, {
                        variant: 'error',
                        anchorOrigin: { horizontal: 'right', vertical: 'top' },
                        onClick: () => closeSnackbar(snackBar),
                    });
                });
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const ExportButton = () => {
        return (
            <GridToolbarContainer>
                <Workbook
                    filename="Результат запроса.xlsx"
                    element={
                        <Button
                            color="primary"
                            variant="contained"
                            style={{ color: theme.palette.secondary.light }}
                        >
                            Выгрузить в MS Excel
                        </Button>
                    }
                >
                    <Workbook.Sheet data={rowsState} name="Результат запроса">
                        {Object.keys(rowsState[0] ?? {}).map((column) => (
                            <Workbook.Column key={column} label={column} value={column} />
                        ))}
                    </Workbook.Sheet>
                </Workbook>
            </GridToolbarContainer>
        );
    };

    return (
        <div className={classes.root}>
            <div className={classes.content}>
                <XGrid
                    rows={rowsState.map((row) => {
                        return {
                            ...row,
                            id: Object.values(row).join(''),
                        };
                    })}
                    columns={Object.keys(rowsState[0] ?? {}).map((column) => {
                        return {
                            field: column,
                            headerName: column,
                            width: 200,
                            renderCell: renderCellExpand,
                        };
                    })}
                    pageSize={5}
                    loading={loading}
                    scrollbarSize={10}
                    hideFooter
                    disableColumnFilter
                />

                <div className={classes.actions}>
                    <ExportButton />
                </div>
            </div>
        </div>
    );
};

export default QueryConstructorTable;
