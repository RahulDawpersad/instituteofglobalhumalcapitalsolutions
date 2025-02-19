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
        const { username, email, password } = req.body;

        const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
        db.query(checkEmailQuery, [email], (err, result) => {
            if (err) throw err;

            if (result.length > 0) {
                return res.status(400).json({ message: 'Email already exists, please try again!' });
            }

            const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
            db.query(insertQuery, [username, email, password], (err) => {
                if (err) throw err;
                res.status(200).json({ message: 'Registration successful!' });
            });
        });
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
};