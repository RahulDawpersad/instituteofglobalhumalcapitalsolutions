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
    const { fullName, email, phone, role, eventName, eventPrice, eventVenue, bookingTime } = req.body;

    const query = `
      INSERT INTO booking (full_name, email, phone, role, event_name, event_price, event_venue, booking_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id;
    `;
    const values = [fullName, email, phone, role, eventName, eventPrice, eventVenue, bookingTime];

    try {
        const result = await pool.query(query, values);
        console.log("Booking ID:", result.rows[0].id);
        // console.log("Booking Time Inserted:", result.rows[0].booking_time);

        // Styled notification message
        const notificationMessage = `
          IGHCS | Institute of Global Human Capital Solutions \n
        🎉 New Booking Received! 🎟️\n
        👤 Name: ${fullName}\n
        📧 Email: ${email}\n
        📞 Phone: ${phone}\n
        🎭 Role: ${role}\n
        🏷️ Event: ${eventName}\n
        🛐 Venue: ${eventVenue}\n
        💰 Price: ${eventPrice} ZAR\n
        ✅ Booking ID: ${result.rows[0].id}\n
        ⏰ Time Booked: ${new Date(result.rows[0].booking_time).toLocaleString()}  // Formatted time
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
                <div style="
                    max-width: 600px;
                    margin: auto;
                    padding: 20px;
                    background-color: #f9f9f9;
                    border-radius: 10px;
                    text-align: left;
                    font-family: Arial, sans-serif;
                    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
                ">
                    <div style="padding: 20px; background-color: #081D48; border-radius: 10px 10px 0 0;">
                        <img src="https://ighcs-hosted-image.netlify.app/igchs-hosted-image.jpg" alt="Company Logo" style="
                            max-width: 120px;
                            display: block;
                            margin: auto;
                            box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                        ">
                    </div>
        
                    <div style="padding: 20px; background-color: #fff; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #003366;">🎉 Hello, ${fullName}!</h2>
                        <p style="font-size: 16px; color: #333;">You have successfully booked your spot for:</p>
                        <h3 style="color: #333;">Event: ${eventName}</h3>
                        <h3 style="font-size: 16px; color: #333;">Price: ${eventPrice} ZAR</h3>
                        <h3 style="color: #333;">Venue: ${eventVenue}</h3>

                        <p style="color: #555; font-size: 15px; margin-top: 20px;">
                            Get ready for an amazing experience. We can't wait to see you there!
                        </p>
        
                        <a href="http://localhost:3001/${eventName.toLowerCase().replace(/\s+/g, '-')}.html" style="
                            display: inline-block;
                            background-color: #003366;
                            color: #fff;
                            padding: 12px 25px;
                            border-radius: 5px;
                            font-size: 16px;
                            text-decoration: none;
                            font-weight: bold;
                            margin-top: 15px;
                            box-shadow: 0 4px 6px rgba(0, 123, 255, 0.3);
                        ">View Event Details</a>
        
                        <p style="color: #777; font-size: 14px; margin-top: 20px;">
                            Best Regards, <br>
                            <strong>IGHCS | Institute of Global Human Capital Solutions</strong>
                        </p>
                    </div>
                </div>
            `,
        };

        // Email to the business (notification)
        let businessMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.BUSINESS_EMAIL, // Your business email
            subject: "🚀 New Event Booking Alert! 🎟️",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                    <!-- Header -->
                    <div style="background-color: #002147; padding: 20px; text-align: center;">
                        <h2 style="color: #ffffff; margin: 0;">New Booking Confirmation</h2>
                    </div>
        
                    <!-- Content -->
                    <div style="padding: 20px; background-color: #f9f9f9;">
                        <p style="font-size: 16px; color: #333;">Hello,</p>
                        <p style="font-size: 16px; color: #333;">You have received a new event booking. Here are the details:</p>
        
                        <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
                            <p style="margin: 10px 0;"><strong> Name:</strong> ${fullName}</p>
                            <p style="margin: 10px 0;"><strong> Email:</strong> ${email}</p>
                            <p style="margin: 10px 0;"><strong> Phone:</strong> ${phone}</p>
                            <p style="margin: 10px 0;"><strong> Event:</strong> ${eventName}</p>
                            <p style="margin: 10px 0;"><strong> Venue:</strong> ${eventVenue}</p>
                            <p style="margin: 10px 0;"><strong> Price:</strong> ${eventPrice} ZAR</p>
                        </div>
        
                        <!-- Call to Action -->
                        <div style="text-align: center; margin-top: 20px;">
                            <a href="mailto:${process.env.BUSINESS_EMAIL}" style="
                                background-color: #002147;
                                color: #ffffff;
                                font-size: 16px;
                                padding: 12px 24px;
                                border-radius: 5px;
                                text-decoration: none;
                                font-weight: bold;
                                display: inline-block;">
                                Respond to Booking
                            </a>
                        </div>
                    </div>
        
                    <!-- Footer -->
                    <div style="text-align: center; padding: 15px; font-size: 12px; color: #777; background-color: #f1f1f1;">
                        <p>🚀 Stay organized and manage your bookings efficiently.</p>
                    </div>
                </div>
            `,
        };
        
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
