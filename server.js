/* eslint-disable @typescript-eslint/no-var-requires */
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

            await sql.connect(config);

            const result = await sql.query`SELECT * FROM Администратор
              WHERE Логин = ${login} AND Пароль = ${password}`;

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

app.put(
    '/admin',
    [
        check('id', 'Некорректный логин').isLength({ min: 1 }),
        check('newPassword', 'Некорректный пароль').isLength({ min: 6 }),
    ],
    async (req, res) => {
        try {
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

            await sql.connect(config);

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
