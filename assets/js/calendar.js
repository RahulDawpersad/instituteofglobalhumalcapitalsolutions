// Combined filtering: checkboxes and select dropdownfunction 
function filterConferences() {
    const selectedCheckboxFilters = Array.from(document.querySelectorAll('.filter:checked')).map(el => el.value);
    const selectedEvent = document.getElementById('eventSelect').value;
    const conferences = document.querySelectorAll('.conference');

    conferences.forEach(conf => {
        const role = conf.getAttribute('data-role');
        const location = conf.getAttribute('data-location');
        const eventName = conf.querySelector('h4').textContent.trim();

        let matchesCheckbox = selectedCheckboxFilters.length === 0 ||
            selectedCheckboxFilters.includes(role) ||
            selectedCheckboxFilters.includes(location);

        let matchesSelect = (selectedEvent === "all" || eventName === selectedEvent);

        if (matchesCheckbox && matchesSelect) {
            conf.classList.remove("hidden");
        } else {
            conf.classList.add("hidden");
        }
    });
}

// Functionality to hover over the conference event to redirect the user to another webpage that tells the user more above the conference event
document.querySelectorAll('.conference').forEach(conference => {
    conference.addEventListener('click', function (event) {
        // Prevent click event from firing if the button is clicked
        if (event.target.tagName.toLowerCase() !== 'button') {
            console.log("Redirecting to event details...");
            // Add redirection logic here
            let eventTitle = this.querySelector("h4").innerText;
            let eventFileName = eventTitle.toLowerCase().replace(/\s+/g, "-") + ".html"; // Convert title to URL format
            window.location.href = eventFileName;
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const filters = document.querySelectorAll('.filter');
    filters.forEach(filter => {
        filter.addEventListener('change', filterConferences);
    });

    document.getElementById('eventSelect').addEventListener('change', filterConferences);
});

function filterConferences() {
    const selectedFilters = Array.from(document.querySelectorAll('.filter:checked')).map(el => el.value);
    const conferences = document.querySelectorAll('.conference');
    conferences.forEach(conf => {
        const role = conf.getAttribute('data-role');
        const location = conf.getAttribute('data-location');
        if (selectedFilters.length === 0 || selectedFilters.includes(role) || selectedFilters.includes(location)) {
            conf.style.display = 'block';
        } else {
            conf.style.display = 'none';
        }
    });
}

// Non Member Prices
document.getElementById("nonMember").addEventListener("click", function () {
    document.querySelectorAll(".conference").forEach((conference, index) => {
        const pricesNonMember = [5.00, 770.00, 3600.00, 3695.65, 4500.00, 1050.43, 3686.96, 3756.52, 3732.17, 2350.43, 2400, 4320, 1350]; // Non-member prices for each conference
        conference.querySelector(".price").innerHTML = `${pricesNonMember[index]} ZAR`;
        conference.style.display = "block";
    });
});

// ALready a Member Prices
document.getElementById("member").addEventListener("click", function () {
    document.querySelectorAll(".conference").forEach((conference, index) => {
        const pricesMember = [5.00, 669.57, 3000.00, 3080.00, 3752.17, 952.17, 3069.57, 3130.43, 3111.30, 1999.13, 2000, 3600, 1000]; // Member prices for each conference
        conference.querySelector(".price").innerHTML = `${pricesMember[index]} ZAR`;
        conference.style.display = "block";
    });
});

document.querySelectorAll('.bookEvent').forEach((button) => {
    button.addEventListener('click', function () {
        const conference = this.closest('.conference');
        const eventName = conference.querySelector('h4').textContent;
        const eventVenue = conference.querySelector('.venue').textContent;
        const eventDate = conference.querySelector('p').textContent;
        const price = conference.querySelector('.price').textContent;
        const memberPrice = conference.getAttribute('data-member-price');
        const nonMemberPrice = conference.getAttribute('data-nonmember-price');

        document.getElementById('eventDetails').innerHTML = `
            <p><strong>Event:</strong> ${eventName}</p>
            <p><strong>Date:</strong> ${eventDate}</p>
            <p><strong>Venue:</strong> ${eventVenue}</p>
            <p><strong>Price:</strong> ${price} (Member: ${memberPrice}, Non-Member: ${nonMemberPrice})</p>
        `;

        document.getElementById('bookingModal').style.display = 'flex';

        document.getElementById('bookingForm').dataset.eventName = eventName;
        document.getElementById('bookingForm').dataset.eventVenue = eventVenue;
        document.getElementById('bookingForm').dataset.eventPrice = price;
    });
});

// Close modal when clicking the X button
document.querySelector('.close-modal').addEventListener('click', function () {
    document.getElementById('bookingModal').style.display = 'none';
});

// Close modal when clicking outside the modal content
window.addEventListener('click', function (event) {
    const modal = document.getElementById('bookingModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

document.getElementById('bookingForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const role = document.getElementById('role').value;
    const eventName = this.dataset.eventName;
    const eventVenue = this.dataset.eventVenue;
    const eventPriceString = this.dataset.eventPrice;
    const eventPrice = parseFloat(eventPriceString.replace(/[^\d.-]/g, ''));

    // Get the current date and time
    const bookingTime = new Date().toISOString(); // Stores in 'YYYY-MM-DDTHH:MM:SSZ' format

    const bookingData = {
        fullName,
        email,
        phone,
        role,
        eventName,
        eventVenue,
        eventPrice,
        bookingTime, // New field added
    };

    storeBookingData(bookingData);

    document.getElementById('bookingModal').style.display = 'none';
});



function storeBookingData(data) {
    const successModal = document.getElementById('successModal');
    const bookingIdDisplay = document.getElementById('bookingIdDisplay');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const successOk = document.getElementById('successOk');

    // ✅ Show modal immediately with "Processing..." text
    bookingIdDisplay.textContent = "Processing...";
    loadingSpinner.style.display = "inline-block";  // Show dots animation
    successModal.style.display = 'flex';

    // ✅ Hide "OK" button initially
    successOk.style.display = 'none';

    // ✅ Send booking request
    fetch('/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            if (result.bookingId) {
                console.log('Booking successful! Booking ID:', result.bookingId);

                // ✅ Update Booking ID
                bookingIdDisplay.textContent = `Your Booking ID is ${result.bookingId}`;
                loadingSpinner.style.display = "none";  

                // ✅ Store booking details
                localStorage.setItem('latestBookingId', result.bookingId);
                localStorage.setItem('bookingData', JSON.stringify({
                    bookingId: result.bookingId,
                    eventName: data.eventName,
                    eventPrice: data.eventPrice,
                    fullName: data.fullName,
                    email: data.email
                }));

                // ✅ Show "OK" button & attach event listener
                successOk.style.display = 'block';
                successOk.classList.add('successOk')
                successOk.onclick = () => redirectToPayment(data);
            } else {
                console.error('Booking failed:', result.message);
                bookingIdDisplay.textContent = "Error!";
                loadingSpinner.style.display = "none";
                alert('Error processing your booking. Please try again later.');
            }
        })
        .catch(error => {
            console.error('Error saving booking:', error);
            bookingIdDisplay.textContent = "Error!";
            loadingSpinner.style.display = "none";
            alert('Error processing your booking. Please try again later.');
        });
}

// ✅ Function to handle payment redirection
function redirectToPayment(data) {
    const payFastUrl = "https://www.payfast.co.za/eng/process";
    const merchant_id = "24208070";
    const merchant_key = "i3peel1sar694";
    const bookingId = localStorage.getItem('latestBookingId') || "";

    const params = new URLSearchParams({
        merchant_id: merchant_id,
        merchant_key: merchant_key,
        amount: data.eventPrice,
        item_name: data.eventName,
        item_description: `Booking for ${data.eventName} by ${data.fullName}`,
        name_first: data.fullName.split(" ")[0] || "",
        name_last: data.fullName.split(" ").slice(1).join(" ") || "",
        email_address: data.email,
        m_payment_id: bookingId,

        // ✅ Redirect URLs
        return_url: "http://localhost:3001/calendar.html",
        cancel_url: "https://ighcs-test-with-database.onrender.com/payment-cancelled.html",
        notify_url: "http://localhost:3001/payment-notification"
    });

    console.log("Redirecting to:", `${payFastUrl}?${params.toString()}`);
    window.location.href = `${payFastUrl}?${params.toString()}`;
}



// function storeBookingData(data) {
//     const successModal = document.getElementById('successModal');
//     const bookingIdDisplay = document.getElementById('bookingIdDisplay');
//     const loadingSpinner = document.querySelector('.loading-spinner');
//     const successOk = document.getElementById('successOk');

//     // ✅ Show modal immediately with "Processing..." text
//     bookingIdDisplay.textContent = "Processing...";
//     loadingSpinner.style.display = "inline-block";  // Show dots animation
//     successModal.style.display = 'flex';

//     // ✅ Hide "OK" button initially
//     successOk.style.display = 'none';

//     // ✅ Send booking request
//     fetch('/book', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data)
//     })
//         .then(response => response.json())
//         .then(result => {
//             if (result.bookingId) {
//                 console.log('Booking successful! Booking ID:', result.bookingId);

//                 // ✅ Update Booking ID
//                 bookingIdDisplay.textContent = `Your Booking ID is ${result.bookingId}`;
//                 loadingSpinner.style.display = "none";  

//                 // ✅ Store booking details
//                 localStorage.setItem('latestBookingId', result.bookingId);
//                 localStorage.setItem('bookingData', JSON.stringify({
//                     bookingId: result.bookingId,
//                     eventName: data.eventName,
//                     eventPrice: data.eventPrice,
//                     fullName: data.fullName,
//                     email: data.email
//                 }));

//                 // ✅ Show "OK" button & attach event listener
//                 successOk.style.display = 'block';
//                 successOk.classList.add('successOk')
//                 successOk.onclick = () => redirectToPayment(data);
//             } else {
//                 console.error('Booking failed:', result.message);
//                 bookingIdDisplay.textContent = "Error!";
//                 loadingSpinner.style.display = "none";
//                 alert('Error processing your booking. Please try again later.');
//             }
//         })
//         .catch(error => {
//             console.error('Error saving booking:', error);
//             bookingIdDisplay.textContent = "Error!";
//             loadingSpinner.style.display = "none";
//             alert('Error processing your booking. Please try again later.');
//         });
// }

// // ✅ Function to handle payment redirection
// function redirectToPayment(data) {
//     const payFastUrl = "https://www.payfast.co.za/eng/process";
//     const merchant_id = "24208070";
//     const merchant_key = "i3peel1sar694";
//     const bookingId = localStorage.getItem('latestBookingId') || "";

//     const params = new URLSearchParams({
//         merchant_id: merchant_id,
//         merchant_key: merchant_key,
//         amount: data.eventPrice,
//         item_name: data.eventName,
//         item_description: `Booking for ${data.eventName} by ${data.fullName}`,
//         name_first: data.fullName.split(" ")[0] || "",
//         name_last: data.fullName.split(" ").slice(1).join(" ") || "",
//         email_address: data.email,
//         m_payment_id: bookingId,

//         // ✅ Redirect URLs
//         return_url: "http://localhost:3001/calendar.html",
//         cancel_url: "http://localhost:3001/payment-cancelled.html",
//         notify_url: "http://localhost:3001/payment-notification"
//     });

//     console.log("Redirecting to:", `${payFastUrl}?${params.toString()}`);
//     window.location.href = `${payFastUrl}?${params.toString()}`;
// }

