require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require("path");
const bcrypt = require('bcryptjs');
const axios = require("axios");
const { Pool } = require('pg');

// Import app.js
const app = require("./app");

const port = process.env.PORT || 3001; // Use .env PORT or fallback to 3001

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

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
});


// Additional Routes
// PayFast details
// const merchantId = '10033010';
// const merchantKey = '6dwmr589lfzbq';
// const verifyUrl = 'https://www.payfast.co.za/eng/query/validate';


pool.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to PostgreSQL database.");
    }
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
        res.status(400).json({ message: "Unable to create contact, email is already associated with another Contact" });
    }
});


// Subscribe Contact Form
app.post('/api/subscribe', async (req, res) => {
    try {
        const { email, firstName, lastName } = req.body;

        // Basic validation
        if (!email || !firstName || !lastName) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const contactData = {
            email,
            attributes: {
                FIRSTNAME: firstName,
                LASTNAME: lastName
            },
            listIds: [Number(process.env.BREVO_LIST_ID)],
            updateEnabled: true,
            templateId: Number(process.env.BREVO_WELCOME_TEMPLATE_ID)
        };

        const response = await axios.post(
            'https://api.brevo.com/v3/contacts',
            contactData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': process.env.SENDINBLUE_API_KEY
                }
            }
        );

        res.json({ success: true, message: 'Subscription successful' });
    } catch (error) {
        console.error('Brevo API error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Subscription failed',
            details: error.response?.data || error.message
        });
    }
});


// Additional Static Pages
app.get('/about', (req, res) => {
    res.sendFile(__dirname + '/public/about.html');
});

app.get('/services', (req, res) => {
    res.sendFile(__dirname + '/public/services.html');
});

app.get('/programmedirector', (req, res) => {
    res.sendFile(__dirname + '/public/programmedirector.html');
});

app.get('/strategiconference', (req, res) => {
    res.sendFile(__dirname + '/public/strategiconference.html');
});

app.get('/humancapitalstrategies', (req, res) => {
    res.sendFile(__dirname + '/public/humancapitalstrategies.html');
});

app.get('/calendar.html', (req, res) => {
    res.sendFile(__dirname + '/public/calendar.html')
})

app.get('/contact.html', (req, res) => {
    res.sendFile(__dirname + '/public/contact.html')
})

app.get('/terms-and-conditions.html', (req, res) => {
    res.sendFile(__dirname + '/public/terms-and-conditions.html')
})

// Payment Cancelled
app.get('/payment-cancelled.html', (req, res) => {
    res.sendFile(__dirname + '/public/payment-cancelled.html')
})

// Health check endpoint
app.get('/', (req, res) => {
    res.status(200).json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Something went wrong, please try again later.');
});

// Start the server
const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    
    // Start keep-alive only in production
    if (process.env.NODE_ENV === 'production') {
        startKeepAlive();
    }
});

// Keep-alive function
function startKeepAlive() {
    const interval = 14 * 60 * 1000; // 14 minutes (less than Render's 15-minute timeout)
    const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;
    
    // Remove any accidental "https://https://" duplicates
    const cleanUrl = url.replace(/^(https?:\/\/)+/i, 'https://');
    
    console.log(`Starting keep-alive requests to ${cleanUrl} every ${interval/60000} minutes`);
    
    const keepAlive = async () => {
        try {
            const response = await axios.get(cleanUrl);
            console.log(`Keep-alive ping successful: ${response.status}`);
        } catch (error) {
            console.error('Keep-alive ping failed:', error.message);
        }
    };
    
    // Initial call
    keepAlive();
    
    // Set up interval
    setInterval(keepAlive, interval);
}
