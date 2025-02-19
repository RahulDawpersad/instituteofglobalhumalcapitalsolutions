require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require("path");
const bcrypt = require('bcryptjs');
const axios = require("axios");
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 5000; // Use .env PORT or fallback to 3000
app.use(cors());

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Load .env variables
const SENDINBLUE_API_KEY = process.env.SENDINBLUE_API_KEY;
const LIST_ID = process.env.LIST_ID;
const WELCOME_TEMPLATE_ID = process.env.WELCOME_TEMPLATE_ID;

// PostgreSQL Connection
// const pool = new Pool({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     database: process.env.DB_NAME,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     ssl: { rejectUnauthorized: false },
//     connectionTimeoutMillis: 30000, // 30 seconds
//     idleTimeoutMillis: 30000, // 30 seconds
//     max: 10, // Limit the number of connections
// });

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
});


// Serve the landing page (index.html)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html")); // Adjusted path for index.html
});

// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

// Serve the register page
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

// Registration Route
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.redirect('/register?error=Email already exists, try again!');
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [username, email, hashedPassword]);
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.status(500).send('Something went wrong, please try again later.');
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.send(`<script>sessionStorage.setItem('error', 'Email or Password is incorrect!'); window.location.href = '/login';</script>`);
        }
        
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (isMatch) {
            return res.send(`<script>sessionStorage.setItem('success', 'Login successful!'); sessionStorage.setItem('username', '${user.username}'); window.location.href = '/';</script>`);
        } else {
            return res.send(`<script>sessionStorage.setItem('error', 'Email or Password is incorrect!'); window.location.href = '/login';</script>`);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Something went wrong, please try again later.');
    }
});

// Subscribe API
app.post("/subscribe", async (req, res) => {
    const { email } = req.body;

    try {
        const response = await axios.post(
            "https://api.brevo.com/v3/contacts",
            { email, listIds: [parseInt(LIST_ID)] },
            { headers: { "Content-Type": "application/json", "api-key": SENDINBLUE_API_KEY } }
        );

        res.json({ message: "Subscription successful! Check your email." });
    } catch (error) {
        console.error("Error subscribing user:", error.response?.data || error.message);
        res.status(400).json({ message: "Unable to create contact, email is already associated with another Contact"});
    }
});


// Serve the about page
app.get('/about', (req, res) => {
    res.sendFile(__dirname + '/public/about.html');
});

// Serve the services page
app.get('/services', (req, res) => {
    res.sendFile(__dirname + '/public/services.html');
});

app.get('/programmedirector', (req, res) => {
    res.sendFile(__dirname + '/public/programmedirector.html')
})

app.get('/strategiconference', (req, res) => {
    res.sendFile(__dirname + '/public/strategiconference.html')
})

app.get('/humancapitalstrategies', (req, res) => {
    res.sendFile(__dirname + '/public/humancapitalstrategies.html')
})



// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Something went wrong, please try again later.');
});

// Start the server
// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});




















// require('dotenv').config();
// const express = require('express');
// const mysql = require('mysql');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const path = require("path");
// const bcrypt = require('bcryptjs');
// const axios = require("axios");

// // Create an Express app
// const app = express();
// const port = 3001; // Change the port number
// app.use(cors());

// // Middleware
// app.use(express.json()); // Parse JSON request bodies
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static('public')); // To serve static files (like HTML)
// app.use("/assets", express.static(path.join(__dirname, "assets"))); // Serve static files from 'assets' folder

// // Load .env variables
// const SENDINBLUE_API_KEY = process.env.SENDINBLUE_API_KEY;
// const LIST_ID = process.env.LIST_ID;
// const WELCOME_TEMPLATE_ID = process.env.WELCOME_TEMPLATE_ID;

// // MySQL connection pooling
// const db = mysql.createPool({
//     connectionLimit: 10, // Set the connection limit as needed
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME
// });

// // Test the connection
// db.getConnection((err, connection) => {
//     if (err) throw err;
//     console.log('Connected to Clever Cloud MySQL');
//     connection.release(); // Always release the connection after using it
// });

// // Serve the landing page (index.html)
// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "public", "index.html")); // Adjusted path for index.html
// });

// // Serve the login page
// app.get('/login', (req, res) => {
//     res.sendFile(__dirname + '/public/login.html');
// });

// // Serve the register page
// app.get('/register', (req, res) => {
//     res.sendFile(__dirname + '/public/register.html');
// });

// // Registration Route
// app.post('/register', (req, res) => {
//     const { username, email, password } = req.body;

//     const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
//     db.query(checkEmailQuery, [email], (err, result) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).send('Something went wrong, please try again later.');
//         }

//         if (result.length > 0) {
//             // Redirect with an error query parameter
//             return res.redirect('/register?error=Email already exists for this account, please try again!');
//         }

//         bcrypt.hash(password, 10, (err, hashedPassword) => {
//             if (err) {
//                 console.error(err);
//                 return res.status(500).send('Something went wrong, please try again later.');
//             }

//             const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
//             db.query(insertQuery, [username, email, hashedPassword], (err) => {
//                 if (err) {
//                     console.error(err);
//                     return res.status(500).send('Something went wrong, please try again later.');
//                 }
//                 res.redirect('/login');
//             });
//         });
//     });
// });

// // Login Route
// app.post('/login', (req, res) => {
//     const { email, password } = req.body;

//     const query = 'SELECT * FROM users WHERE email = ?';
//     db.query(query, [email], (err, result) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).send('Something went wrong, please try again later.');
//         }

//         if (result.length > 0) {
//             // Compare the hashed password
//             bcrypt.compare(password, result[0].password, (err, isMatch) => {
//                 if (err) {
//                     console.error(err);
//                     return res.status(500).send('Something went wrong, please try again later.');
//                 }

//                 if (isMatch) {
//                     // Successful login, set sessionStorage
//                     const username = result[0].username;
//                     res.send(`
//                         <script>
//                             sessionStorage.setItem('success', 'Login successful! Redirecting to home...');
//                             setTimeout(() => { window.location.href = '/'; sessionStorage.setItem('username', '${username}'); }, 2000);
//                         </script>
//                     `);
//                 } else {
//                     res.send(`
//                         <script>
//                             sessionStorage.setItem('error', 'Email or Password is incorrect, please try again!');
//                             window.location.href = '/login';
//                         </script>
//                     `);
//                 }
//             });
//         } else {
//             res.send(`
//                 <script>
//                     sessionStorage.setItem('error', 'Email or Password is incorrect, please try again!');
//                     window.location.href = '/login';
//                 </script>
//             `);
//         }
//     });
// });

// // Subscribe API
// app.post("/subscribe", async (req, res) => {
//     const { email } = req.body;

//     try {
//         const response = await axios.post(
//             "https://api.brevo.com/v3/contacts",
//             { email, listIds: [parseInt(LIST_ID)] },
//             { headers: { "Content-Type": "application/json", "api-key": SENDINBLUE_API_KEY } }
//         );

//         res.json({ message: "Subscription successful! Check your email." });
//     } catch (error) {
//         console.error("Error subscribing user:", error.response?.data || error.message);
//         res.status(400).json({ message: "Subscription failed. Try again!" });
//     }
// });


// // Serve the about page
// app.get('/about', (req, res) => {
//     res.sendFile(__dirname + '/public/about.html');
// });

// // Serve the services page
// app.get('/services', (req, res) => {
//     res.sendFile(__dirname + '/public/services.html');
// });



// // Error handling middleware
// app.use((err, req, res, next) => {
//     console.error(err);  // Log the error internally
//     res.status(500).send('Something went wrong, please try again later.');
// });

// // Start the server
// app.listen(port, () => {
//     console.log(`Server running on http://localhost:${port}`);
// });










