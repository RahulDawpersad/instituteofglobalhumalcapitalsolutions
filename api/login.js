const mysql = require('mysql');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

module.exports = (req, res) => {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
        db.query(query, [email, password], (err, result) => {
            if (err) throw err;

            if (result.length > 0) {
                const username = result[0].username;
                res.status(200).json({ message: `Login successful! Welcome, ${username}` });
            } else {
                res.status(400).json({ message: 'Invalid email or password' });
            }
        });
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
};
