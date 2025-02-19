require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');


// Create an Express app

const app = express();
const port = 3001; // Change the port number
app.use(cors());



// Middleware

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public')); // To serve static files (like HTML)



// MySQL connection

// MySQL connection (Clever Cloud)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    // port: process.env.DB_PORT,
});


// Connect to MySQL

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to Clever Cloud MySQL');
});


// Serve the landing page (index.html)

app.get('/', (req, res) => {

    res.sendFile(__dirname + '/public/index.html');

});



// Serve the login page

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});


// Serve the register page

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkEmailQuery, [email], (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            return res.send('<script>alert("Email already exists, please try again!"); window.location.href="/register";</script>');
        }

        const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(insertQuery, [username, email, password], (err) => {
            if (err) throw err;
            res.redirect('/login'); // Redirect to login page after successful registration
        });
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            // Successful login, set sessionStorage
            const username = result[0].username;
            res.send(`Login successful! Redirecting to home...<script>setTimeout(() => { window.location.href = '/'; sessionStorage.setItem('username', '${username}'); }, 2000);</script>`);
        } else {
            res.send('<script>alert("Email or Password is incorrect, please try again!"); window.location.href="/login";</script>');
        }
    });
});
  

app.get('/about', (req, res) => {
    res.sendFile(__dirname + '/public/about.html');
  });
  
  app.get('/services', (req, res) => {
    res.sendFile(__dirname + '/public/services.html');
  });


// Start the server

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });