/* eslint-disable @typescript-eslint/no-var-requires,camelcase */
// noinspection JSNonASCIINames,NonAsciiCharacters

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

            if (foundQuery) {
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
                Треки: [
                    {
                        ID: query.ID_Трек,
                        Трек: query.Трек,
                        ID_Автор: query.ID_Автор,
                        Автор: query.ИмяАвтора,
                    },
                ],
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
                track: track.Трек,
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
            tracks.forEach((track) => {
                (async () => {
                    const iTrack = track;

                    await sql.query(
                        `INSERT INTO ПолученныйТрек (ID_Трек, ID_Запрос)
                         VALUES (${iTrack.id}, ${queryId})`,
                    );
                })();
            });

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
                tracks.forEach((track) => {
                    (async () => {
                        const iTrack = track;

                        await sql.query(
                            `INSERT INTO ПолученныйТрек (ID_Трек, ID_Запрос)
                             VALUES (${iTrack.id}, ${id})`,
                        );
                    })();
                });
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

app.delete('/query', async (req, res) => {
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

app.get('/users', async (req, res) => {
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

app.get('/queryTypes', async (req, res) => {
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

app.get('/tracks', async (req, res) => {
    try {
        await sql.connect(config);

        const tracks = await sql.query(
            `SELECT Трек.ID, Название, ID_Автор, Автор.ИмяАвтора FROM Трек
              LEFT JOIN Автор ON Трек.ID_Автор = Автор.ID`,
        );

        const formatTrack = (track) => ({
            id: track.ID,
            track: track.Название,
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

app.put(
    '/admin',
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

app.listen(port, () => {
    console.log(`Backend Server has been started at http://localhost:${port}`);
});
