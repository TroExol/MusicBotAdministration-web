import React, { ChangeEvent, Component, useEffect, useState } from 'react';

import {
    Button,
    makeStyles,
    MenuItem,
    Modal,
    TextField,
    Typography,
    useTheme,
} from '@material-ui/core';
import { useSnackbar } from 'notistack';
import { useForm, Controller } from 'react-hook-form';
import {
    Query,
    Builder,
    Utils as QbUtils,
    JsonGroup,
    Fields,
    Config,
    ImmutableTree,
} from 'react-awesome-query-builder';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import MaterialConfig from 'react-awesome-query-builder/lib/config/material';

import { getColumnsAction, getTablesAction, IColumn } from '../../store/queryConstructor';
// eslint-disable-next-line
import 'react-awesome-query-builder/lib/css/styles.css';
// eslint-disable-next-line
import 'react-awesome-query-builder/lib/css/compact_styles.css';
import QueryConstructorTable from './QueryConstructorTable';

const InitialConfig = MaterialConfig;

const useStyles = makeStyles({
    content: {
        margin: '10px 0',
    },
    actions: {
        '& > *:not(:first-child)': {
            marginLeft: '7px',
        },
    },
    field: {
        width: '300px',
    },
    modal: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
    },
});

let filters: string | undefined = '';
let treeTmp: ImmutableTree | undefined;

const QueryConstructor = (): JSX.Element => {
    const classes = useStyles();

    const theme = useTheme();

    const { control, formState, getValues } = useForm({
        defaultValues: {
            table: '',
        },
    });

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [tablesState, setTablesState] = useState<string[]>([]);
    const [selectedTableState, setSelectedTableState] = useState<string | undefined>();
    const [columnsState, setColumnsState] = useState<IColumn[]>([]);
    const [loading, setLoading] = useState(true);
    const [openShowTableState, setOpenShowTableState] = useState<boolean>(false);

    const handleOpenShowTableClick = (data: { table: string }) => {
        const { table } = data;

        if (!table) {
            const snackBar = enqueueSnackbar('Выберите таблицу', {
                variant: 'error',
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                onClick: () => closeSnackbar(snackBar),
            });

            return;
        }

        setOpenShowTableState(() => true);
    };

    const handleOpenShowTableClose = () => {
        setOpenShowTableState(() => false);
    };

    const typesMap: { [key: string]: string } = {
        nvarchar: 'text',
        varchar: 'text',
        int: 'number',
        decimal: 'number',
        datetime: 'datetime',
    };

    const config: Config = {
        ...InitialConfig,
        fields: columnsState.reduce((columns: Fields, column) => {
            // eslint-disable-next-line no-param-reassign
            columns[column.name] = {
                label: column.name,
                type: typesMap[column.type],
            };

            return columns;
        }, {}),
        settings: {
            ...InitialConfig.settings,
            theme: {
                material: theme,
            },
            valueLabel: 'Значение',
            valuePlaceholder: 'Значение',
            fieldLabel: 'Поле',
            operatorLabel: 'Оператор',
            fieldPlaceholder: 'Выберите поле',
            operatorPlaceholder: 'Выберите оператор',
            funcPlaceholder: 'Выберите функцию',
            deleteLabel: null,
            addGroupLabel: 'Добавить группу',
            addRuleLabel: 'Добавить правило',
            delGroupLabel: null,
            valueSourcesPopupTitle: 'Выберите источник значения',
            removeRuleConfirmOptions: {
                title: 'Вы точно хотите удалить правило?',
                okText: 'Да',
                okType: 'danger',
            },
            removeGroupConfirmOptions: {
                title: 'Вы точно хотите удалить группу?',
                okText: 'Да',
                okType: 'danger',
            },
        },
    };

    const queryValue: JsonGroup = { id: QbUtils.uuid(), type: 'group' };

    class QueryBuilder extends Component {
        // eslint-disable-next-line react/state-in-constructor
        state = {
            tree: treeTmp ?? QbUtils.checkTree(QbUtils.loadTree(queryValue), config),
            config,
        };

        render = () => (
            <div>
                <Query
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...config}
                    // eslint-disable-next-line react/destructuring-assignment,react/no-this-in-sfc
                    value={this.state.tree}
                    // eslint-disable-next-line react/no-this-in-sfc
                    onChange={this.onChange}
                    // eslint-disable-next-line react/no-this-in-sfc
                    renderBuilder={this.renderBuilder}
                />
                {/* eslint-disable-next-line react/no-this-in-sfc */}
                {this.renderResult(this.state)}
            </div>
        );

        renderBuilder = (props: never) => (
            <div>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <Builder {...props} />
            </div>
        );

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-shadow
        renderResult = ({ tree: immutableTree, config }) =>
            filters ? (
                <div className="query-builder-result">
                    Условие: <pre>{JSON.stringify(QbUtils.sqlFormat(immutableTree, config))}</pre>
                </div>
            ) : (
                ''
            );

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-shadow
        onChange = (immutableTree, config) => {
            // eslint-disable-next-line react/no-this-in-sfc
            this.setState({ tree: immutableTree, config });

            treeTmp = immutableTree;
            filters = QbUtils.sqlFormat(immutableTree, config);
        };
    }

    // eslint-disable-next-line
    useEffect(
        () => {
            (async () => {
                setLoading(() => true);

                await getTablesAction()
                    .then((tables) => {
                        if (tables[0]) {
                            if (tables[1].length <= 0) {
                                throw new Error('Нет таблиц');
                            }
                            setTimeout(() => {
                                setTablesState(tables[1]);
                                setLoading(false);
                            }, 0);
                        } else {
                            throw new Error(tables[1]);
                        }
                    })
                    .catch((error) => {
                        setTimeout(() => {
                            setTablesState([]);
                            setLoading(false);
                        }, 0);

                        const snackBar = enqueueSnackbar(error.message, {
                            variant: 'error',
                            anchorOrigin: { horizontal: 'right', vertical: 'top' },
                            onClick: () => closeSnackbar(snackBar),
                        });
                    });
            })();
        },
        // eslint-disable-next-line
        [],
    );

    useEffect(() => {
        if (!selectedTableState) {
            return;
        }

        (async () => {
            setLoading(() => true);

            await getColumnsAction({ table: selectedTableState })
                .then((columns) => {
                    if (columns[0]) {
                        if (columns[1].length <= 0) {
                            throw new Error('Нет столбцов');
                        }
                        setTimeout(() => {
                            setColumnsState(columns[1]);
                            setLoading(false);
                        }, 0);
                    } else {
                        throw new Error(columns[1]);
                    }
                })
                .catch((error) => {
                    setTimeout(() => {
                        setColumnsState([]);
                        setLoading(false);
                    }, 0);

                    const snackBar = enqueueSnackbar(error.message, {
                        variant: 'error',
                        anchorOrigin: { horizontal: 'right', vertical: 'top' },
                        onClick: () => closeSnackbar(snackBar),
                    });
                });
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTableState]);

    const onTableChangeHandler = (
        data: ChangeEvent<{ name?: string | undefined; value: unknown }>,
    ) => {
        const newState = data.target.value;

        treeTmp = undefined;
        filters = undefined;
        setSelectedTableState(() => newState as string);
    };

    return (
        <form>
            <Typography variant="h5" component="h2" color="primary">
                Конструктор запросов
            </Typography>

            <div className={classes.content}>
                <div className={classes.actions}>
                    <Controller
                        render={({ field }) => {
                            return (
                                <TextField
                                    className={classes.field}
                                    select
                                    size="small"
                                    variant="outlined"
                                    label="Таблица"
                                    disabled={loading || tablesState.length <= 0}
                                    // value={field.value}
                                    error={!!formState.errors?.table?.message}
                                    helperText={formState.errors?.table?.message}
                                    // eslint-disable-next-line react/jsx-props-no-spreading
                                    // {...field}
                                    value={field.value}
                                    SelectProps={{
                                        // multiple: true,
                                        value: field.value,
                                        // renderValue: (selected) => (selected
                                        // as string[]).join(', '),
                                        onChange: (value) => {
                                            field.onChange(value);
                                            onTableChangeHandler(value);
                                        },
                                    }}
                                >
                                    {tablesState.map((table) => (
                                        <MenuItem key={table} value={table}>
                                            {table}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            );
                        }}
                        control={control}
                        name="table"
                        rules={{ required: { value: true, message: 'Выберите таблицу' } }}
                    />

                    <Button
                        variant="contained"
                        color="primary"
                        // type="submit"
                        onClick={() => handleOpenShowTableClick(getValues())}
                        style={{ color: theme.palette.secondary.light }}
                        disabled={loading || !selectedTableState || tablesState.length <= 0}
                    >
                        Выполнить
                    </Button>
                </div>
            </div>

            <QueryBuilder />

            <Modal
                className={classes.modal}
                open={openShowTableState}
                onBackdropClick={handleOpenShowTableClose}
            >
                <QueryConstructorTable table={selectedTableState as string} filters={filters} />
            </Modal>
        </form>
    );
};

export default QueryConstructor;
