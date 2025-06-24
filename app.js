require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const axios = require('axios');

const app = express();
// Get port from environment or use 3000 for local development
const port = process.env.PORT || 3000;


// Configuration - replace with your actual credentials
const config = {
    email: {
        service: process.env.EMAIL_SERVICE,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        from: process.env.EMAIL_FROM
    },
    pushover: {
        token: process.env.PUSHOVER_TOKEN,
        user: process.env.PUSHOVER_USER
    },
    brevo: {
        apiKey: process.env.BREVO_API_KEY
    }
};

// Middleware
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve Public Folder (CSS, JS, Images)
app.use(express.static(path.join(__dirname, "public")));

// Serve Assets Folder (Fonts, Videos)
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Email transporter
const transporter = nodemailer.createTransport({
    service: config.email.service,
    auth: {
        user: config.email.user,
        pass: config.email.pass
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'calendar.html'));
});

// PayFast ITN (Instant Transaction Notification) endpoint
app.post('/send-post-payment-notifications', async (req, res) => {
    try {
        const bookingDetails = req.body;

        // Verify payment with Yoco API if needed
        // (In production, you should verify the payment with Yoco's API)

        // Send confirmation emails
        await sendConfirmationEmails(bookingDetails);

        // Send Pushover notification
        await sendPushoverNotification(bookingDetails);

        res.json({ success: true, message: 'Notifications sent successfully' });
    } catch (error) {
        console.error('Error sending post-payment notifications:', error);
        res.status(500).json({ success: false, message: 'Failed to send notifications' });
    }
});

async function decompressBookingData(compressed) {
    // Reconstruct the full booking details
    const bookingDetails = {
        event: {
            title: compressed.e,
            date: compressed.ed || '', // Add these if you included them
            time: compressed.et || '',
            venue: compressed.ev || ''
        },
        bookingRef: compressed.r,
        ticketQuantity: compressed.q,
        total: compressed.a,
        bookingType: compressed.t === 'i' ? 'individual' : 'company'
    };

    // Add formatted date
    if (bookingDetails.event.date) {
        const eventDate = new Date(bookingDetails.event.date);
        bookingDetails.formattedDate = eventDate.toLocaleDateString('en-ZA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } else {
        bookingDetails.formattedDate = 'Date not specified';
    }

    if (compressed.t === 'i') {
        bookingDetails.customer = {
            firstName: compressed.f,
            lastName: compressed.l,
            email: compressed.m,
            phone: compressed.p
        };
    } else {
        bookingDetails.company = {
            name: compressed.n,
            email: compressed.m,
            phone: compressed.p,
            vatNumber: compressed.v || null // Add VAT number
        };

        // In a real implementation, you might want to store the full delegate details
        // in your database before the payment and retrieve them here
    }

    return bookingDetails;
}

// Generate PayFast signature
function generatePayfastSignature(data, passphrase) {
    // Create parameter string
    let pfOutput = '';
    const keys = Object.keys(data).sort();

    keys.forEach(key => {
        if (key !== 'signature' && data[key] !== '') {
            pfOutput += `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}&`;
        }
    });

    // Add passphrase
    pfOutput += `passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`;

    // Create MD5 hash
    return crypto.createHash('md5').update(pfOutput).digest('hex');
}

// Send confirmation emails
async function sendConfirmationEmails(bookingDetails) {
    try {
        if (bookingDetails.bookingType === 'individual') {
            // Send email to individual customer
            await sendIndividualEmail(bookingDetails);

            // Send business notification
            await sendBusinessNotification(bookingDetails);
        } else {
            // Send email to company
            await sendCompanyEmail(bookingDetails);

            // Send emails to all delegates
            await sendDelegateEmails(bookingDetails);

            // Send business notification
            await sendBusinessNotification(bookingDetails);
        }
    } catch (error) {
        console.error('Error sending confirmation emails:', error);
    }
}

// Send email to individual customer
async function sendIndividualEmail(bookingDetails) {
    const eventDate = new Date(bookingDetails.event.date);
    const formattedDate = eventDate.toLocaleDateString('en-ZA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
        `EVENT:${bookingDetails.event.title}|NAME:${bookingDetails.customer.firstName} ${bookingDetails.customer.lastName}|REF:${bookingDetails.bookingRef}|DATE:${bookingDetails.formattedDate}`
    )}&size=200`;

    const emailContent = `
        <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; background-color: #f7f7f7; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
                    .header { text-align: center; padding-bottom: 20px; }
                    .header h1 { color: #2C3E50; font-size: 24px; }
                    .content { line-height: 1.6; }
                    .content p { font-size: 16px; color: #555; }
                    .highlight { font-weight: bold; color: #2ecc71; }
                    .ticket-section { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
                    .ticket-qr { margin: 15px auto; max-width: 200px; }
                    .ticket-qr img { width: 100%; height: auto; border: 1px solid #ced4da; padding: 5px; background: white; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Booking Confirmation</h1>
                        <p>Thank you for booking with us!</p>
                    </div>
                    <div class="content">
                        <p>Hello <strong>${bookingDetails.customer.firstName} ${bookingDetails.customer.lastName}</strong>,</p>
                        <p>Your booking for <strong>${bookingDetails.event.title}</strong> has been confirmed.</p>
                        <p><span class="highlight">Event:</span> ${bookingDetails.event.title}</p>
                        <p><span class="highlight">Date:</span> ${formattedDate} at ${bookingDetails.event.time}</p>
                        <p><span class="highlight">Tickets:</span> ${bookingDetails.ticketQuantity}</p>
                        <p><span class="highlight">Total:</span> R ${bookingDetails.total.toLocaleString('en-ZA')}</p>
                        <p><span class="highlight">Booking Reference:</span> ${bookingDetails.bookingRef}</p>
                    </div>
                    <div class="ticket-section">
                        <h3>Your Event Ticket</h3>
                        <div class="ticket-qr">
                            <img src="${qrCodeUrl}" alt="Event Ticket QR Code" />
                        </div>
                        <p>Scan this QR code at the event entrance for quick check-in</p>
                        <p class="highlight">Booking Reference: ${bookingDetails.bookingRef}</p>
                    </div>
                </div>
            </body>
        </html>
    `;

    await transporter.sendMail({
        from: config.email.from,
        to: bookingDetails.customer.email,
        subject: `Booking Confirmed for ${bookingDetails.event.title}`,
        html: emailContent
    });
}

// Send email to company
async function sendCompanyEmail(bookingDetails) {
    const eventDate = new Date(bookingDetails.event.date);
    const formattedDate = eventDate.toLocaleDateString('en-ZA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const emailContent = `
        <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; background-color: #f7f7f7; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
                    .header { text-align: center; padding-bottom: 20px; }
                    .header h1 { color: #2C3E50; font-size: 24px; }
                    .content { line-height: 1.6; }
                    .content p { font-size: 16px; color: #555; }
                    .highlight { font-weight: bold; color: #2ecc71; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Company Booking Confirmation</h1>
                        <p>Thank you for booking with us!</p>
                    </div>
                    <div class="content">
                        <p>Hello <strong>${bookingDetails.company.name}</strong>,</p>
                        <p>Your company booking for <strong>${bookingDetails.event.title}</strong> has been confirmed.</p>
                        <p><span class="highlight">Event:</span> ${bookingDetails.event.title}</p>
                          <div class="detail-row">
                <span class="detail-label">Date & Time</span>
                ${formattedDate} at ${bookingDetails.event.time}
            </div>
                        <p><span class="highlight">Tickets:</span> ${bookingDetails.ticketQuantity}</p>
                        <p><span class="highlight">Total:</span> R ${bookingDetails.total.toLocaleString('en-ZA')}</p>
                        <p><span class="highlight">Booking Reference:</span> ${bookingDetails.bookingRef}</p>
                        <p><span class="highlight">Delegates:</span> ${bookingDetails.delegates.length}</p>
                    </div>
                </div>
            </body>
        </html>
    `;

    await transporter.sendMail({
        from: config.email.from,
        to: bookingDetails.company.email,
        subject: `Company Booking Confirmed for ${bookingDetails.event.title}`,
        html: emailContent
    });
}

// Send emails to delegates
async function sendDelegateEmails(bookingDetails) {
    const eventDate = new Date(bookingDetails.event.date);
    const formattedDate = eventDate.toLocaleDateString('en-ZA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    for (const delegate of bookingDetails.delegates) {
        const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
            `EVENT:${bookingDetails.event.title}|NAME:${delegate.firstName} ${delegate.lastName}|ID:${delegate.id}|REF:${bookingDetails.bookingRef}`
        )}&size=200`;

        const emailContent = `
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; background-color: #f7f7f7; }
                        .container { max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
                        .header { text-align: center; padding-bottom: 20px; }
                        .header h1 { color: #2C3E50; font-size: 24px; }
                        .content { line-height: 1.6; }
                        .content p { font-size: 16px; color: #555; }
                        .highlight { font-weight: bold; color: #2ecc71; }
                        .ticket-section { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
                        .ticket-qr { margin: 15px auto; max-width: 200px; }
                        .ticket-qr img { width: 100%; height: auto; border: 1px solid #ced4da; padding: 5px; background: white; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Delegate Confirmation</h1>
                            <p>Thank you for registering!</p>
                        </div>
                        <div class="content">
                            <p>Hello <strong>${delegate.firstName} ${delegate.lastName}</strong>,</p>
                            <p>Your delegate registration for <strong>${bookingDetails.event.title}</strong> has been confirmed.</p>
                            <p><span class="highlight">Event:</span> ${bookingDetails.event.title}</p>
                            <div class="detail-row">
                <span class="detail-label">Date & Time</span>
                ${formattedDate} at ${bookingDetails.event.time}
            </div>
                            <p><span class="highlight">Booking Reference:</span> ${bookingDetails.bookingRef}</p>
                            <p><span class="highlight">Delegate ID:</span> ${delegate.id}</p>
                        </div>
                        <div class="ticket-section">
                            <h3>Your Event Ticket</h3>
                            <div class="ticket-qr">
                                <img src="${qrCodeUrl}" alt="Event Ticket QR Code" />
                            </div>
                            <p>Scan this QR code at the event entrance for quick check-in</p>
                            <p class="highlight">Delegate ID: ${delegate.id}</p>
                        </div>
                    </div>
                </body>
            </html>
        `;

        await transporter.sendMail({
            from: config.email.from,
            to: delegate.email,
            subject: `Delegate Confirmation for ${bookingDetails.event.title}`,
            html: emailContent
        });
    }
}

// Send business notification
async function sendBusinessNotification(bookingDetails) {
    const eventDate = new Date(bookingDetails.event.date);
    const formattedDate = eventDate.toLocaleDateString('en-ZA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    let emailContent = `
        <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f7f7f7; }
                    .container { max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { background-color: #2C3E50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { padding: 20px; }
                    .highlight-box { background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #3498db; }
                    .detail-row { margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
                    .detail-label { font-weight: bold; color: #2C3E50; display: block; margin-bottom: 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>NEW BOOKING: ${bookingDetails.event.title}</h2>
                        <p>${bookingDetails.bookingType} Registration</p>
                    </div>
                    <div class="content">
                        <div class="highlight-box">
                            <strong>Booking Reference:</strong> ${bookingDetails.bookingRef}<br>
                            <strong>Total Amount:</strong> R ${bookingDetails.total.toLocaleString('en-ZA')}<br>
                            <strong>Tickets:</strong> ${bookingDetails.ticketQuantity}
                        </div>
                        
                        <div>
                            <h3>Event Details</h3>
                            <div class="detail-row">
                                <span class="detail-label">Event Name</span>
                                ${bookingDetails.event.title}
                            </div>
                           
                            <div class="detail-row">
                <span class="detail-label">Date & Time</span>
                ${formattedDate} at ${bookingDetails.event.time}
            </div>
                            <div class="detail-row">
                                <span class="detail-label">Venue</span>
                                ${bookingDetails.event.venue}
                            </div>
                            
                            <h3 style="margin-top: 20px;">${bookingDetails.bookingType} Details</h3>
    `;

    if (bookingDetails.bookingType === 'individual') {
        emailContent += `
            <div class="detail-row">
                <span class="detail-label">Customer Name</span>
                ${bookingDetails.customer.firstName} ${bookingDetails.customer.lastName}
            </div>
            <div class="detail-row">
                <span class="detail-label">Customer Email</span>
                ${bookingDetails.customer.email}
            </div>
            <div class="detail-row">
                <span class="detail-label">Customer Phone</span>
                ${bookingDetails.customer.phone}
            </div>
        `;
    } else {
        emailContent += `
            <div class="detail-row">
                <span class="detail-label">Company Name</span>
                ${bookingDetails.company.name}
            </div>
            <div class="detail-row">
                <span class="detail-label">Company Email</span>
                ${bookingDetails.company.email}
            </div>
            <div class="detail-row">
                <span class="detail-label">Company Phone</span>
                ${bookingDetails.company.phone}
            </div>
            <div class="detail-row">
                <span class="detail-label">VAT Number</span>
                ${bookingDetails.company.vatNumber || 'Not provided'}
            </div>
            <div class="detail-row">
                <span class="detail-label">Number of Delegates</span>
                ${bookingDetails.delegates.length}
            </div>
            <div class="detail-row">
                <span class="detail-label">Delegate List</span>
                <div>
                    ${bookingDetails.delegates.map(d => `${d.firstName} ${d.lastName} (${d.email})`).join('<br>')}
                </div>
            </div>
        `;
    }

    emailContent += `
                        </div>
                    </div>
                </div>
            </body>
        </html>
    `;

    await transporter.sendMail({
        from: config.email.from,
        to: 'designxfolio@gmail.com',
        subject: `New ${bookingDetails.bookingType} Booking for ${bookingDetails.event.title}`,
        html: emailContent
    });
}

// Send Pushover notification
async function sendPushoverNotification(bookingDetails) {
    try {
        let message;

        if (bookingDetails.bookingType === 'individual') {
            message = `New Individual Booking:
Event: ${bookingDetails.event.title}
Customer: ${bookingDetails.customer.firstName} ${bookingDetails.customer.lastName}
Email: ${bookingDetails.customer.email}
Phone: ${bookingDetails.customer.phone}
Tickets: ${bookingDetails.ticketQuantity}
Total: R ${bookingDetails.total.toLocaleString('en-ZA')}
Ref: ${bookingDetails.bookingRef}`;
        } else {
            message = `New Company Booking:
Event: ${bookingDetails.event.title}
Company: ${bookingDetails.company.name}
Contact: ${bookingDetails.company.email}
Phone: ${bookingDetails.company.phone}
Delegates: ${bookingDetails.delegates.length}
Tickets: ${bookingDetails.ticketQuantity}
Total: R ${bookingDetails.total.toLocaleString('en-ZA')}
Ref: ${bookingDetails.bookingRef}`;
        }

        const formData = new FormData();
        formData.append('token', config.pushover.token);
        formData.append('user', config.pushover.user);
        formData.append('message', message);
        formData.append('title', 'New Booking Notification');
        formData.append('sound', 'cashregister');

        await axios.post('https://api.pushover.net/1/messages.json', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    } catch (error) {
        console.error('Error sending Pushover notification:', error);
    }
}

app.post('/send-post-payment-notifications', async (req, res) => {
    try {
        const bookingDetails = req.body;

        // Send confirmation emails
        await sendConfirmationEmails(bookingDetails);

        // Send Pushover notification
        await sendPushoverNotification(bookingDetails);

        res.json({ success: true, message: 'Notifications sent successfully' });
    } catch (error) {
        console.error('Error sending post-payment notifications:', error);
        res.status(500).json({ success: false, message: 'Failed to send notifications' });
    }
});

// Start server with error handling
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Error: Port ${port} is already in use`);
    } else {
        console.error('Server startup error:', error);
    }
    process.exit(1);
});

module.exports = app;
