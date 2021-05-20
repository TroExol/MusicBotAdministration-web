/* eslint-disable @typescript-eslint/no-var-requires */
const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());
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

app.listen(port, () => {
    console.log(`Backend Server is running at http://localhost:${port}`);
});
