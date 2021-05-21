/* eslint-disable @typescript-eslint/no-var-requires */
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bodyParser = require('body-parser');

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

app.get('/admin/', async (req, res) => {
    try {
        const { login, password } = req.query;

        await sql.connect(config);

        const result = await sql.query`SELECT * FROM Администратор
          WHERE Логин = ${login} AND Пароль = ${password}`;

        res.send(result);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.put('/admin', async (req, res) => {
    try {
        const { id, newPassword } = req.body.params;

        if (!id || !newPassword) {
            res.status(403).send('Не удалось получить данные о пользователе');
            return;
        }

        await sql.connect(config);

        const result = await sql.query`UPDATE Администратор
            SET Пароль = ${newPassword}
            WHERE ID = ${id}`;

        res.send(result);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(port, () => {
    console.log(`Backend Server is running at http://localhost:${port}`);
});
