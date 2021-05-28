/* eslint-disable @typescript-eslint/no-var-requires,camelcase */
// noinspection JSNonASCIINames,NonAsciiCharacters,JSUnresolvedVariable,ExceptionCaughtLocallyJS

const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = 5000;

const config = {
    user: 'troexol',
    password: '1qaz!QAZ',
    database: 'MusicBotAdministration',
    server: 'localhost',
    port: 1434,
    options: {
        trustServerCertificate: true,
    },
};

app.get(
    '/admin/',
    [
        check('login', 'Некорректный логин').isLength({ min: 3 }),
        check('password', 'Некорректный пароль').isLength({ min: 6 }),
    ],
    async (req, res) => {
        try {
            await sql.connect(config);

            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    error: errors,
                    message: 'Некорректные данные авторизации',
                });
                return;
            }

            const { login, password } = req.query;

            const result = await sql.query`SELECT * FROM Администратор
              WHERE Логин = ${login} AND Пароль = ${password}`;

            const administrator =
                result.recordset.length > 0
                    ? {
                          id: result.recordset[0].ID,
                          login: result.recordset[0].Логин,
                          fio: result.recordset[0].ФИО,
                          password: result.recordset[0].Пароль,
                      }
                    : null;

            res.status(200).json({
                success: true,
                result: administrator,
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message,
                message: 'Не удалось получить информацию с сервера',
            });
        }
    },
);

app.get('/queries/', async (req, res) => {
    try {
        await sql.connect(config);

        const queries = await sql.query(
            `SELECT Запрос.ID, ДатаЗапроса, КоличествоТреков, ЗапрашиваемыйАвтор, ID_Пользователь,
                ФамилияИмя, СсылкаНаVK, ID_ТипЗапроса, ТипЗапроса.Название AS ТипЗапроса,
                ИмяАвтора, Трек.Название AS Трек, ID_Трек, ID_Автор
                FROM Запрос
                LEFT JOIN Пользователь ON Запрос.ID_Пользователь = Пользователь.ID
                LEFT JOIN ТипЗапроса ON Запрос.ID_ТипЗапроса = ТипЗапроса.ID
                LEFT JOIN ПолученныйТрек ON Запрос.ID = ПолученныйТрек.ID_Запрос
                LEFT JOIN Трек ON ПолученныйТрек.ID_Трек = Трек.ID
                LEFT JOIN Автор ON Трек.ID_Автор = Автор.ID
                ORDER BY Запрос.ID, ID_Трек`,
        );

        const queriesGrouped = queries.recordset.reduce((state, query) => {
            const foundQuery = state.find((queryFind) => queryFind.ID === query.ID);

            if (foundQuery && query.ID_Трек) {
                foundQuery.Треки.push({
                    ID: query.ID_Трек,
                    Трек: query.Трек,
                    ID_Автор: query.ID_Автор,
                    Автор: query.ИмяАвтора,
                });

                return state;
            }

            const {
                ID,
                ДатаЗапроса,
                КоличествоТреков,
                ЗапрашиваемыйАвтор,
                ID_Пользователь,
                ФамилияИмя,
                СсылкаНаVK,
                ID_ТипЗапроса,
                ТипЗапроса,
            } = query;

            state.push({
                ID,
                ДатаЗапроса,
                КоличествоТреков,
                ЗапрашиваемыйАвтор,
                ID_Пользователь,
                ФамилияИмя,
                СсылкаНаVK,
                ID_ТипЗапроса,
                ТипЗапроса,
                Треки: query.ID_Трек
                    ? [
                          {
                              ID: query.ID_Трек,
                              Трек: query.Трек,
                              ID_Автор: query.ID_Автор,
                              Автор: query.ИмяАвтора,
                          },
                      ]
                    : [],
            });

            return state;
        }, []);

        const formatQuery = (query) => ({
            id: query.ID,
            date: query.ДатаЗапроса,
            countTracks: query.КоличествоТреков,
            author: query.ЗапрашиваемыйАвтор,
            userId: query.ID_Пользователь,
            user: query.ФамилияИмя,
            userUrl: query.СсылкаНаVK,
            queryTypeId: query.ID_ТипЗапроса,
            queryType: query.ТипЗапроса,
            tracks: query.Треки.map((track) => ({
                id: track.ID,
                name: track.Трек,
                authorId: track.ID_Автор,
                author: track.Автор,
            })),
        });

        const formattedQueries = queriesGrouped.map(formatQuery);

        res.status(200).json({
            success: true,
            result: formattedQueries,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось получить информацию с сервера',
        });
    }
});

app.post('/query/', async (req, res) => {
    try {
        const { date, author, countTracks, queryTypeId, tracks, userId } = req.body.params;

        await sql.connect(config);

        const response =
            await sql.query`INSERT INTO Запрос (ДатаЗапроса, КоличествоТреков, ЗапрашиваемыйАвтор,
                ID_Пользователь, ID_ТипЗапроса)
             OUTPUT INSERTED.ID
             VALUES (${date}, ${countTracks}, ${author}, ${userId}, ${queryTypeId})`;

        let queryId;

        if (response?.recordset?.[0]?.ID != null) {
            queryId = response.recordset[0].ID;
        }

        if (queryId) {
            // eslint-disable-next-line no-restricted-syntax
            for (const iTrack of tracks) {
                // eslint-disable-next-line no-await-in-loop
                await sql.query(
                    `INSERT INTO ПолученныйТрек (ID_Трек, ID_Запрос)
                         VALUES (${iTrack.id}, ${queryId})`,
                );
            }

            res.status(201).json({
                success: true,
                result: queryId,
            });
        } else {
            throw new Error('Не удалось добавить запрос');
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось отправить информацию на сервер',
        });
    }
});

app.put('/query/', async (req, res) => {
    try {
        const { id, date, author, countTracks, queryTypeId, tracks, userId } = req.body.params;

        await sql.connect(config);

        const response = await sql.query`UPDATE Запрос SET ДатаЗапроса = ${date},
                КоличествоТреков = ${countTracks}, ЗапрашиваемыйАвтор = ${author},
                ID_Пользователь = ${userId}, ID_ТипЗапроса = ${queryTypeId}
             WHERE ID = ${id}`;

        const success = response.rowsAffected[0] > 0;

        if (success) {
            if (await sql.query`DELETE FROM ПолученныйТрек WHERE ID_Запрос = ${id}`) {
                // eslint-disable-next-line no-restricted-syntax
                for (const iTrack of tracks) {
                    // eslint-disable-next-line no-await-in-loop
                    await sql.query(
                        `INSERT INTO ПолученныйТрек (ID_Трек, ID_Запрос)
                             VALUES (${iTrack.id}, ${id})`,
                    );
                }
            } else {
                throw new Error('Не удалось удалить полученные треки');
            }

            res.status(200).json({
                success: true,
                result: id,
            });
        } else {
            throw new Error('Не удалось изменить запрос');
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось отправить информацию на сервер',
        });
    }
});

app.delete('/query/', async (req, res) => {
    try {
        const { id } = req.query;

        await sql.connect(config);

        await sql.query(`DELETE FROM Запрос WHERE ID = ${id}`);

        res.status(200).json({
            success: true,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось получить информацию с сервера',
        });
    }
});

app.get('/users/', async (req, res) => {
    try {
        await sql.connect(config);

        const users = await sql.query(`SELECT * FROM Пользователь`);

        const formatUser = (query) => ({
            id: query.ID,
            fio: query.ФамилияИмя,
            url: query.СсылкаНаVK,
        });

        const formattedUsers = users.recordset.map(formatUser);

        res.status(200).json({
            success: true,
            result: formattedUsers,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось получить информацию с сервера',
        });
    }
});

app.get('/queryTypes/', async (req, res) => {
    try {
        await sql.connect(config);

        const queryTypes = await sql.query(`SELECT * FROM ТипЗапроса`);

        const formatQueryType = (queryType) => ({
            id: queryType.ID,
            name: queryType.Название,
        });

        const formattedQueryTypes = queryTypes.recordset.map(formatQueryType);

        res.status(200).json({
            success: true,
            result: formattedQueryTypes,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось получить информацию с сервера',
        });
    }
});

app.post('/queryType/', async (req, res) => {
    try {
        const { name } = req.body.params;

        await sql.connect(config);

        const response = await sql.query`INSERT INTO ТипЗапроса (Название)
             OUTPUT INSERTED.ID
             VALUES (${name})`;

        let queryTypeId;

        if (response?.recordset?.[0]?.ID != null) {
            queryTypeId = response.recordset[0].ID;
        }

        if (queryTypeId) {
            res.status(201).json({
                success: true,
                result: queryTypeId,
            });
        } else {
            throw new Error('Не удалось добавить тип запроса');
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось отправить информацию на сервер',
        });
    }
});

app.put('/queryType/', async (req, res) => {
    try {
        const { id, name } = req.body.params;

        await sql.connect(config);

        const response = await sql.query`UPDATE ТипЗапроса SET Название = ${name}
             WHERE ID = ${id}`;

        const success = response.rowsAffected[0] > 0;

        if (success) {
            res.status(200).json({
                success: true,
                result: id,
            });
        } else {
            throw new Error('Не удалось изменить тип запроса');
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось отправить информацию на сервер',
        });
    }
});

app.get('/tracks/', async (req, res) => {
    try {
        await sql.connect(config);

        const tracks = await sql.query(
            `SELECT Трек.ID, Название, ID_Автор, Автор.ИмяАвтора
                FROM Трек
                LEFT JOIN Автор ON Трек.ID_Автор = Автор.ID
                ORDER BY Трек.ID`,
        );

        const formatTrack = (track) => ({
            id: track.ID,
            name: track.Название,
            authorId: track.ID_Автор,
            author: track.ИмяАвтора,
        });

        const formattedTracks = tracks.recordset.map(formatTrack);

        res.status(200).json({
            success: true,
            result: formattedTracks,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось получить информацию с сервера',
        });
    }
});

app.post('/track/', async (req, res) => {
    try {
        const { name, author } = req.body.params;

        await sql.connect(config);

        let authorId;

        const authorResponse = await sql.query`SELECT ID FROM Автор WHERE ИмяАвтора = ${author}`;

        if (authorResponse.recordset.length <= 0) {
            authorId = (
                await sql.query`INSERT INTO Автор (ИмяАвтора)
              OUTPUT INSERTED.ID
              VALUES (${author})`
            )?.recordset?.[0]?.ID;
        } else {
            authorId = authorResponse.recordset[0].ID;
        }

        if (!authorId) {
            throw new Error('Не удалось добавить автора');
        }

        const response = await sql.query`INSERT INTO Трек (Название, ID_Автор)
             OUTPUT INSERTED.ID
             VALUES (${name}, ${authorId})`;

        let trackId;

        if (response?.recordset?.[0]?.ID != null) {
            trackId = response.recordset[0].ID;
        }

        if (!trackId) {
            throw new Error('Не удалось добавить трек');
        }

        res.status(201).json({
            success: true,
            result: trackId,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось отправить информацию на сервер',
        });
    }
});

app.put('/track/', async (req, res) => {
    try {
        const { id, name, author } = req.body.params;

        await sql.connect(config);

        let authorId;

        const authorResponse = await sql.query`SELECT ID FROM Автор WHERE ИмяАвтора = ${author}`;

        if (authorResponse.recordset.length <= 0) {
            authorId = (
                await sql.query`INSERT INTO Автор (ИмяАвтора)
              OUTPUT INSERTED.ID
              VALUES (${author})`
            )?.recordset?.[0]?.ID;
        } else {
            authorId = authorResponse.recordset[0].ID;
        }

        if (!authorId) {
            throw new Error('Не удалось добавить автора');
        }

        const response = await sql.query`UPDATE Трек SET Название = ${name},
                ID_Автор = ${authorId}
             WHERE ID = ${id}`;

        const success = response.rowsAffected[0] > 0;

        if (!success) {
            throw new Error('Не удалось изменить трек');
        }

        res.status(200).json({
            success: true,
            result: id,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось отправить информацию на сервер',
        });
    }
});

app.get('/users/', async (req, res) => {
    try {
        await sql.connect(config);

        const users = await sql.query(`SELECT * FROM Пользователь`);

        const formatUser = (user) => ({
            id: user.ID,
            fio: user.ФамилияИмя,
            url: user.СсылкаНаVK,
        });

        const formattedUsers = users.recordset.map(formatUser);

        res.status(200).json({
            success: true,
            result: formattedUsers,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось получить информацию с сервера',
        });
    }
});

app.post('/user/', async (req, res) => {
    try {
        const { fio, url } = req.body.params;

        await sql.connect(config);

        const response = await sql.query`INSERT INTO Пользователь
              (ФамилияИмя, СсылкаНаVk)
             OUTPUT INSERTED.ID
             VALUES (${fio}, ${url})`;

        let userId;

        if (response?.recordset?.[0]?.ID != null) {
            userId = response.recordset[0].ID;
        }

        if (userId) {
            res.status(201).json({
                success: true,
                result: userId,
            });
        } else {
            throw new Error('Не удалось добавить пользователя');
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось отправить информацию на сервер',
        });
    }
});

app.put('/user/', async (req, res) => {
    try {
        const { id, url } = req.body.params;

        await sql.connect(config);

        const response = await sql.query`UPDATE Пользователь SET СсылкаНаVK = ${url}
             WHERE ID = ${id}`;

        const success = response.rowsAffected[0] > 0;

        if (success) {
            res.status(200).json({
                success: true,
                result: id,
            });
        } else {
            throw new Error('Не удалось изменить пользователя');
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось отправить информацию на сервер',
        });
    }
});

app.get('/payments/', async (req, res) => {
    try {
        await sql.connect(config);

        const payments = await sql.query(`SELECT ОплатаПодписки.ID, ДатаОплаты, ID_Пользователь,
              Пользователь.ФамилияИмя, Пользователь.СсылкаНаVK, ОплатаПодписки.ID_Подписка,
              Подписка.Название, (SELECT TOP 1 Стоимость FROM СтоимостьПодписки
                      WHERE СтоимостьПодписки.ID_Подписка = Подписка.ID
                        AND ДатаДобавленияСтоимости < ДатаОплаты
                      ORDER BY ДатаДобавленияСтоимости DESC)
                      AS Стоимость
            FROM ОплатаПодписки
            LEFT JOIN Пользователь ON ОплатаПодписки.ID_Пользователь = Пользователь.ID
            LEFT JOIN Подписка ON Подписка.ID = ОплатаПодписки.ID_Подписка`);

        const formatPayment = (payment) => ({
            id: payment.ID,
            date: payment.ДатаОплаты,
            amount: payment.Стоимость,
            userId: payment.ID_Пользователь,
            fio: payment.ФамилияИмя,
            url: payment.СсылкаНаVK,
            subscriptionId: payment.ID_Подписка,
            subscription: payment.Название,
        });

        const formattedPayments = payments.recordset.map(formatPayment);

        res.status(200).json({
            success: true,
            result: formattedPayments,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось получить информацию с сервера',
        });
    }
});

app.post('/payment/', async (req, res) => {
    try {
        const { date, userId, subscriptionId } = req.body.params;

        await sql.connect(config);

        const response = await sql.query`INSERT INTO ОплатаПодписки
              (ДатаОплаты, ID_Пользователь, ID_Подписка)
             OUTPUT INSERTED.ID
             VALUES (${date}, ${userId}, ${subscriptionId})`;

        let paymentId;

        if (response?.recordset?.[0]?.ID != null) {
            paymentId = response.recordset[0].ID;
        }

        if (paymentId) {
            res.status(201).json({
                success: true,
                result: paymentId,
            });
        } else {
            throw new Error('Не удалось добавить оплату');
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось отправить информацию на сервер',
        });
    }
});

app.put('/payment/', async (req, res) => {
    try {
        const { id, date, userId, subscriptionId } = req.body.params;

        await sql.connect(config);

        const response = await sql.query`UPDATE ОплатаПодписки SET ДатаОплаты = ${date},
                ID_Пользователь = ${userId}, ID_Подписка = ${subscriptionId}
             WHERE ID = ${id}`;

        const success = response.rowsAffected[0] > 0;

        if (success) {
            res.status(200).json({
                success: true,
                result: id,
            });
        } else {
            throw new Error('Не удалось изменить оплату');
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось отправить информацию на сервер',
        });
    }
});

app.delete('/payment/', async (req, res) => {
    try {
        const { id } = req.query;

        await sql.connect(config);

        await sql.query(`DELETE FROM ОплатаПодписки WHERE ID = ${id}`);

        res.status(200).json({
            success: true,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось получить информацию с сервера',
        });
    }
});

app.get('/subscriptions/', async (req, res) => {
    try {
        await sql.connect(config);

        const subscriptions = await sql.query(
            `SELECT Подписка.ID, Подписка.Название, ID_ТипЗапроса,
                  ТипЗапроса.Название AS ТипЗапроса,
                  (SELECT TOP 1 Стоимость FROM СтоимостьПодписки
                      WHERE СтоимостьПодписки.ID_Подписка = Подписка.ID
                      ORDER BY ДатаДобавленияСтоимости DESC)
                      AS Стоимость
                FROM Подписка
                LEFT JOIN ДоступныйТипЗапроса
                  ON Подписка.ID = ДоступныйТипЗапроса.ID_Подписка
                LEFT JOIN ТипЗапроса
                  ON ТипЗапроса.ID = ДоступныйТипЗапроса.ID_ТипЗапроса
                ORDER BY Подписка.ID, ID_ТипЗапроса`,
        );

        const subscriptionsGrouped = subscriptions.recordset.reduce((state, subscription) => {
            const foundSubscription = state.find(
                (subscriptionFind) => subscriptionFind.ID === subscription.ID,
            );

            if (foundSubscription && subscription.ID_ТипЗапроса) {
                foundSubscription.ДоступныеТипыЗапросов.push({
                    ID: subscription.ID_ТипЗапроса,
                    Название: subscription.ТипЗапроса,
                });

                return state;
            }

            const { ID, Название, Стоимость } = subscription;

            state.push({
                ID,
                Название,
                Стоимость,
                ДоступныеТипыЗапросов: subscription.ID_ТипЗапроса
                    ? [
                          {
                              ID: subscription.ID_ТипЗапроса,
                              Название: subscription.ТипЗапроса,
                          },
                      ]
                    : [],
            });

            return state;
        }, []);

        const formatSubscription = (subscription) => ({
            id: subscription.ID,
            name: subscription.Название,
            amount: subscription.Стоимость,
            queryTypes: subscription.ДоступныеТипыЗапросов.map((queryType) => ({
                id: queryType.ID,
                name: queryType.Название,
            })),
        });

        const formattedSubscriptions = subscriptionsGrouped.map(formatSubscription);

        res.status(200).json({
            success: true,
            result: formattedSubscriptions,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось получить информацию с сервера',
        });
    }
});

app.post('/subscription/', async (req, res) => {
    try {
        const { name, amount, queryTypes } = req.body.params;

        await sql.connect(config);

        const response = await sql.query`INSERT INTO Подписка (Название)
             OUTPUT INSERTED.ID
             VALUES (${name})`;

        let subscriptionId;

        if (response?.recordset?.[0]?.ID != null) {
            subscriptionId = response.recordset[0].ID;
        }

        if (subscriptionId) {
            await sql.query`INSERT INTO СтоимостьПодписки (Стоимость,ID_Подписка)
                    VALUES (${amount}, ${subscriptionId})`;

            // eslint-disable-next-line no-restricted-syntax
            for (const iQueryType of queryTypes) {
                // eslint-disable-next-line no-await-in-loop
                await sql.query(
                    `INSERT INTO ДоступныйТипЗапроса (ID_Подписка, ID_ТипЗапроса)
                         VALUES (${subscriptionId}, ${iQueryType.id})`,
                );
            }

            res.status(201).json({
                success: true,
                result: subscriptionId,
            });
        } else {
            throw new Error('Не удалось добавить подписку');
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось отправить информацию на сервер',
        });
    }
});

app.put('/subscription/', async (req, res) => {
    try {
        // const { id, name, amount, queryTypes } = req.body.params;
        const [subscriptionNew, subscriptionOld] = req.body.params;

        await sql.connect(config);

        const response = await sql.query`UPDATE Подписка SET Название = ${subscriptionNew.name}
             WHERE ID = ${subscriptionOld.id}`;

        const success = response.rowsAffected[0] > 0;

        if (success) {
            if (
                await sql.query`DELETE FROM ДоступныйТипЗапроса
                  WHERE ID_Подписка = ${subscriptionOld.id}`
            ) {
                // eslint-disable-next-line no-restricted-syntax
                for (const iQueryType of subscriptionNew.queryTypes) {
                    // eslint-disable-next-line no-await-in-loop
                    await sql.query(
                        `INSERT INTO ДоступныйТипЗапроса (ID_Подписка, ID_ТипЗапроса)
                         VALUES (${subscriptionOld.id}, ${iQueryType.id})`,
                    );
                }
            } else {
                throw new Error('Не удалось удалить доступные типы запросов');
            }

            // eslint-disable-next-line eqeqeq
            if (subscriptionNew.amount != subscriptionOld.amount) {
                await sql.query`INSERT INTO СтоимостьПодписки (Стоимость,ID_Подписка)
                    VALUES (${subscriptionNew.amount}, ${subscriptionOld.id})`;
            }

            res.status(200).json({
                success: true,
                result: subscriptionOld.id,
            });
        } else {
            throw new Error('Не удалось изменить подписку');
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось отправить информацию на сервер',
        });
    }
});

app.put(
    '/admin/',
    [
        check('id', 'Некорректный логин').isLength({ min: 1 }),
        check('newPassword', 'Некорректный пароль').isLength({ min: 6 }),
    ],
    async (req, res) => {
        try {
            await sql.connect(config);

            const errors = validationResult(req.body);

            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    error: errors,
                    message: 'Некорректные данные изменения пароля',
                });
                return;
            }
            const { id, newPassword } = req.body.params;

            const result = await sql.query`UPDATE Администратор
            SET Пароль = ${newPassword}
            WHERE ID = ${id}`;

            res.status(200).json({
                success: true,
                result,
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message,
                message: 'Не удалось получить информацию с сервера',
            });
        }
    },
);

app.get('/queriesReport/', async (req, res) => {
    try {
        const filters = req.query;

        await sql.connect(config);

        let whereStr = '';
        if (filters.dateFromFilter && filters.dateToFilter) {
            whereStr += ` AND ДатаЗапроса >= '${filters.dateFromFilter}' AND
                ДатаЗапроса <= '${filters.dateToFilter}' `;
        }

        if (filters.queryTypeFilter) {
            whereStr += ` AND ID_ТипЗапроса = ${filters.queryTypeFilter} `;
        }

        if (filters.userFilter) {
            whereStr += ` AND ID_Пользователь = ${filters.userFilter} `;
        }

        const report = await sql.query(`SELECT Запрос.ID, ДатаЗапроса, КоличествоТреков,
              ЗапрашиваемыйАвтор, ФамилияИмя, СсылкаНаVK, ТипЗапроса.Название AS ТипЗапроса,
              Трек.Название AS Трек, ИмяАвтора
            FROM Запрос
            INNER JOIN Пользователь ON Запрос.ID_Пользователь = Пользователь.ID
            ${whereStr}
            LEFT JOIN ТипЗапроса ON Запрос.ID_ТипЗапроса = ТипЗапроса.ID
            LEFT JOIN ПолученныйТрек ON Запрос.ID = ПолученныйТрек.ID_Запрос
            LEFT JOIN Трек ON ПолученныйТрек.ID_Трек = Трек.ID
            LEFT JOIN Автор ON Трек.ID_Автор = Автор.ID`);

        const queriesGrouped = report.recordset.reduce((state, query) => {
            const foundQuery = state.find((queryFind) => queryFind.ID === query.ID);

            if (foundQuery && query.Трек) {
                foundQuery.Треки.push({
                    Трек: query.Трек,
                    Автор: query.ИмяАвтора,
                });

                return state;
            }

            const {
                ID,
                ДатаЗапроса,
                КоличествоТреков,
                ЗапрашиваемыйАвтор,
                ФамилияИмя,
                СсылкаНаVK,
                ТипЗапроса,
            } = query;

            state.push({
                ID,
                ДатаЗапроса,
                КоличествоТреков,
                ЗапрашиваемыйАвтор,
                ФамилияИмя,
                СсылкаНаVK,
                ТипЗапроса,
                Треки: query.Трек
                    ? [
                          {
                              Трек: query.Трек,
                              Автор: query.ИмяАвтора,
                          },
                      ]
                    : [],
            });

            return state;
        }, []);

        const formatReport = (query) => ({
            id: query.ID,
            date: query.ДатаЗапроса,
            countTracks: query.КоличествоТреков,
            author: query.ЗапрашиваемыйАвтор,
            fio: query.ФамилияИмя,
            url: query.СсылкаНаVK,
            queryType: query.ТипЗапроса,
            tracks: query.Треки.map((track) => ({
                name: track.Трек,
                author: track.Автор,
            })),
        });

        const formattedReport = queriesGrouped.map(formatReport);

        res.status(200).json({
            success: true,
            result: formattedReport,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось получить информацию с сервера',
        });
    }
});

app.get('/profitReport/', async (req, res) => {
    try {
        const filters = req.query;

        await sql.connect(config);

        let whereStr = '';
        if (filters.dateFromFilter && filters.dateToFilter) {
            whereStr += ` AND ДатаОплаты >= '${filters.dateFromFilter}' AND
                ДатаОплаты <= '${filters.dateToFilter}' `;
        }

        if (filters.subscriptionFilter) {
            whereStr += ` AND ID_Подписка = ${filters.subscriptionFilter} `;
        }

        if (filters.userFilter) {
            whereStr += ` AND ID_Пользователь = ${filters.userFilter} `;
        }

        const report = await sql.query(`SELECT ISNULL(CONVERT(CHAR(10),ДатаОплаты,104),
              'Итог') AS ДатаОплаты, ISNULL(Подписка.Название, 'Итог') AS Подписка,
               Count(Подписка.ID) AS КолвоПодписок, sum(Стоимость) AS Прибыль
            FROM ОплатаПодписки
            INNER JOIN Подписка ON ОплатаПодписки.ID_Подписка = Подписка.ID
            ${whereStr}
            OUTER APPLY (
                Select TOP 1 *
                From СтоимостьПодписки
                WHERE СтоимостьПодписки.ID_Подписка = Подписка.ID
            AND ДатаДобавленияСтоимости <= ДатаОплаты
            ORDER BY ДатаДобавленияСтоимости DESC
                ) Стоимость
            GROUP BY CONVERT(CHAR(10), ДатаОплаты, 104), Подписка.Название WITH ROLLUP
            ORDER BY CONVERT(DATETIME, CONVERT(CHAR(10), ДатаОплаты, 104), 104) DESC`);

        const formatReport = (query) => ({
            id: query.ID,
            date: query.ДатаОплаты,
            subscription: query.Подписка,
            countSubscriptions: query.КолвоПодписок,
            profit: query.Прибыль,
        });

        const formattedReport = report.recordset.map(formatReport);

        res.status(200).json({
            success: true,
            result: formattedReport,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось получить информацию с сервера',
        });
    }
});

app.get('/queryTypesReport/', async (req, res) => {
    try {
        const filters = req.query;

        await sql.connect(config);

        let whereStr = '';
        if (filters.dateFromFilter && filters.dateToFilter) {
            whereStr += ` AND ДатаЗапроса >= '${filters.dateFromFilter}' AND
                ДатаЗапроса <= '${filters.dateToFilter}' `;
        }

        const report = await sql.query(`SELECT ТипЗапроса.Название,
              COUNT(Запрос.ID_ТипЗапроса) AS Количество
            FROM Запрос
            INNER JOIN ТипЗапроса ON Запрос.ID_ТипЗапроса = ТипЗапроса.ID
            ${whereStr}
            GROUP BY ТипЗапроса.Название ORDER BY Количество DESC`);

        const formatReport = (query) => ({
            name: query.Название,
            count: query.Количество,
        });

        const formattedReport = report.recordset.map(formatReport);

        res.status(200).json({
            success: true,
            result: formattedReport,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось получить информацию с сервера',
        });
    }
});

app.get('/usersReport/', async (req, res) => {
    try {
        const filters = req.query;

        await sql.connect(config);

        let whereStr = '';
        if (filters.dateFromFilter && filters.dateToFilter) {
            whereStr += ` AND ДатаЗапроса >= '${filters.dateFromFilter}' AND
                ДатаЗапроса <= '${filters.dateToFilter}' `;
        }

        const report = await sql.query(`SELECT ФамилияИмя, СсылкаНаVK,
              COUNT(Запрос.ID_Пользователь) AS КолвоЗапросов
            FROM Запрос
            INNER JOIN Пользователь ON Запрос.ID_Пользователь = Пользователь.ID
            ${whereStr}
            GROUP BY ФамилияИмя, СсылкаНаVK ORDER BY КолвоЗапросов DESC`);

        const formatReport = (query) => ({
            fio: query.ФамилияИмя,
            url: query.СсылкаНаVK,
            count: query.КолвоЗапросов,
        });

        const formattedReport = report.recordset.map(formatReport);

        res.status(200).json({
            success: true,
            result: formattedReport,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось получить информацию с сервера',
        });
    }
});

app.get('/tables/', async (req, res) => {
    try {
        await sql.connect(config);

        const tables = await sql.query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_NAME != 'sysdiagrams'`);

        const formattedTables = tables.recordset.map((table) => table.TABLE_NAME);

        res.status(200).json({
            success: true,
            result: formattedTables,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось получить информацию с сервера',
        });
    }
});

app.get('/columns/', async (req, res) => {
    try {
        const { table } = req.query;

        await sql.connect(config);

        const columns =
            await sql.query(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = '${table}'`);

        const formattedColumns = columns.recordset.map((column) => ({
            name: column.COLUMN_NAME,
            type: column.DATA_TYPE,
        }));

        res.status(200).json({
            success: true,
            result: formattedColumns,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось получить информацию с сервера',
        });
    }
});

app.get('/sql/', async (req, res) => {
    try {
        const { table, columns, filters } = req.query;

        await sql.connect(config);

        const where = filters ? ` WHERE ${filters}` : '';
        const columnsRes = columns?.length ? columns.join(',') : '*';

        const query = await sql.query(`SELECT ${columnsRes} FROM ${table} ${where}`);

        const formattedQuery = query.recordset;

        res.status(200).json({
            success: true,
            result: formattedQuery,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            message: 'Не удалось получить информацию с сервера',
        });
    }
});

app.listen(port, () => {
    console.log(`Backend Server has been started at http://localhost:${port}`);
});
