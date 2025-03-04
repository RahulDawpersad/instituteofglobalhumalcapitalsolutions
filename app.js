require("dotenv").config(); // Load environment variables
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require('axios');
const nodemailer = require("nodemailer");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // Serves static files like index.html and calendar.html

// PostgreSQL Connection (using environment variables)
const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    ssl: { rejectUnauthorized: false }
});

// Pushover configuration
PUSHOVER_USER_KEY = "un93rpjf7ouqa4af8ewxkvdd37dhau";
PUSHOVER_API_TOKEN = "azevoku82g82r3kd7vtqutixkhiatg";


pool.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to PostgreSQL database.");
    }
});

app.get("/calendar", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "calendar.html"));
});


app.post("/book", async (req, res) => {
    const { fullName, email, phone, role, eventName, eventPrice } = req.body;

    const query = `
      INSERT INTO booking (full_name, email, phone, role, event_name, event_price)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;
    `;
    const values = [fullName, email, phone, role, eventName, eventPrice];

    try {
        const result = await pool.query(query, values);
        console.log("Booking ID:", result.rows[0].id);

        // Styled notification message
        const notificationMessage = `
        🎉 *New Booking Received!* 🎟️\n
        👤 *Name:* ${fullName}\n
        📧 *Email:* ${email}\n
        📞 *Phone:* ${phone}\n
        🎭 *Role:* ${role}\n
        🏷️ *Event:* ${eventName}\n
        💰 *Price:* R${eventPrice}\n
        ✅ *Booking ID:* ${result.rows[0].id}
        `;

        // Send Pushover notification
        const pushoverPayload = new URLSearchParams();
        pushoverPayload.append("token", PUSHOVER_API_TOKEN);
        pushoverPayload.append("user", PUSHOVER_USER_KEY);
        pushoverPayload.append("message", notificationMessage);
        pushoverPayload.append("title", "🎟️ New Booking Alert!");
        pushoverPayload.append("priority", "1");
        pushoverPayload.append("sound", "cashregister");

        axios.post("https://api.pushover.net/1/messages.json", pushoverPayload)
            .then(response => {
                console.log("✅ Pushover notification sent:", response.data);
            })
            .catch(error => {
                console.error("❌ Error sending Pushover notification:", error);
            });

        // Set up email transporter
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Email to the user (confirmation)
        let userMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "🎟️ Conference Booking Confirmation",
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #007BFF;">Hello ${fullName},</h2>
                    <p>Thank you for booking the event: <strong>${eventName}</strong>.</p>
                    <p><b>Price:</b> <span style="color: #28a745;">R${eventPrice}</span></p>
                    <p>We look forward to seeing you!</p>
                    <br>
                    <p style="color: #555;">Best Regards,</p>
                    <p><strong>Your Company</strong></p>
                </div>
            `,
        };

        // let userMailOptions = {
        //     from: process.env.EMAIL_USER,
        //     to: email,
        //     subject: "Conference Booking Confirmation",
        //     text: `Hello ${fullName},\n\nThank you for booking the event '${eventName}'.\nPrice: R${eventPrice}\nWe look forward to seeing you!\n\nBest Regards,\nYour Company`,
        // };

        // Email to the business (notification)
        let businessMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.BUSINESS_EMAIL, // Your business email
            subject: "🚀 New Event Booking Alert! 🎟️",
            html: `
                <div style="background-color: #111; color: #fff; font-family: Arial, sans-serif; padding: 20px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); max-width: 500px; margin: auto;">
                    <h2 style="color: #00D1FF; text-align: center;">🔥 New Booking Received! 🔥</h2>
                    
                    <div style="border: 1px solid #444; padding: 15px; border-radius: 8px; background-color: #222;">
                        <p><strong style="color: #00FFB3;">👤 Name:</strong> ${fullName}</p>
                        <p><strong style="color: #FFD700;">📧 Email:</strong> ${email}</p>
                        <p><strong style="color: #FF4C4C;">📞 Phone:</strong> ${phone}</p>
                        <p><strong style="color: #ADFF2F;">🎭 Event:</strong> ${eventName}</p>
                        <p><strong style="color: #FF69B4;">💰 Price:</strong> <span style="color: #FF4C4C; font-size: 18px;">R${eventPrice}</span></p>
                    </div>
        
                    <p style="text-align: center; margin-top: 15px;">
                        <span style="color: #bbb;">🚀 Stay on top of your bookings in real time!</span>
                    </p>
                </div>
            `,
        };

        // let businessMailOptions = {
        //     from: process.env.EMAIL_USER,
        //     to: process.env.BUSINESS_EMAIL, // Your business email
        //     subject: "New Event Booking",
        //     text: `A new booking has been made.\n\nUser: ${fullName}\nEmail: ${email}\nPhone: ${phone}\nEvent: ${eventName}\nPrice: R${eventPrice}`,
        // };

        // Send both emails
        await transporter.sendMail(userMailOptions);
        await transporter.sendMail(businessMailOptions);

        console.log("✅ Emails sent successfully!");

        res.status(200).send({ message: "Booking successful! Confirmation email sent.", bookingId: result.rows[0].id });
    } catch (error) {
        console.error("❌ Error processing booking:", error);
        res.status(500).send({ message: "Error processing your booking. Please try again later." });
    }
});
module.exports = app;
