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
            // window.location.href = 'event-details.html'; 
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
        conference.querySelector(".price").textContent = "Price: R" + pricesNonMember[index];
        conference.style.display = "block";
    });
});

// ALready a Member Prices
document.getElementById("member").addEventListener("click", function () {
    document.querySelectorAll(".conference").forEach((conference, index) => {
        const pricesMember = [5.00, 669.57, 3000.00, 3080.00, 3752.17, 952.17, 3069.57, 3130.43, 3111.30, 1999.13, 2000, 3600, 1000]; // Member prices for each conference
        conference.querySelector(".price").textContent = "Price: R" + pricesMember[index];
        conference.style.display = "block";
    });
});

document.querySelectorAll('.bookEvent').forEach((button) => {
    button.addEventListener('click', function () {
        const conference = this.closest('.conference');
        const eventName = conference.querySelector('h4').textContent;
        const eventDate = conference.querySelector('p').textContent;
        const price = conference.querySelector('.price').textContent;
        const memberPrice = conference.getAttribute('data-member-price');
        const nonMemberPrice = conference.getAttribute('data-nonmember-price');

        document.getElementById('eventDetails').innerHTML = `
            <p><strong>Event:</strong> ${eventName}</p>
            <p><strong>Date:</strong> ${eventDate}</p>
            <p><strong>Price:</strong> ${price} (Member: ${memberPrice}, Non-Member: ${nonMemberPrice})</p>
        `;

        document.getElementById('bookingModal').style.display = 'flex';

        document.getElementById('bookingForm').dataset.eventName = eventName;
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
    const eventPriceString = this.dataset.eventPrice;

    const eventPrice = parseFloat(eventPriceString.replace(/[^\d.-]/g, ''));

    const bookingData = {
        fullName,
        email,
        phone,
        role,
        eventName,
        eventPrice,
    };

    storeBookingData(bookingData);

    document.getElementById('bookingModal').style.display = 'none';
});


// Function to send booking data to the backend and then redirect to payment gateway
function storeBookingData(data) {
    fetch('/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            if (result.bookingId) {
                console.log('Booking successful! Booking ID:', result.bookingId);
                document.getElementById('bookingIdDisplay').textContent = result.bookingId;
                document.getElementById('successModal').style.display = 'flex';

                document.getElementById('successOk').addEventListener('click', function redirectToPayment() {
                    const payFastUrl = "https://www.payfast.co.za/eng/process";
                    const merchant_id = "24208070";
                    const merchant_key = "i3peel1sar694";
                    const params = new URLSearchParams({
                        merchant_id: merchant_id,
                        merchant_key: merchant_key,
                        amount: data.eventPrice,
                        item_name: data.eventName,
                        item_description: `Booking for ${data.eventName} by ${data.fullName}`,
                        name_first: data.fullName.split(" ")[0] || "",
                        name_last: data.fullName.split(" ").slice(1).join(" ") || "",
                        email_address: data.email,
                        m_payment_id: data.bookingId || "",

                        // ✅ Redirect URLs for local testing
                        return_url: "http://localhost:3001/calendar.html",
                        cancel_url: "http://localhost:3001/payment-cancelled.html",
                        notify_url: "http://localhost:3001/payment-notification"
                    });

                    console.log("Redirecting to:", `${payFastUrl}?${params.toString()}`);
                    window.location.href = `${payFastUrl}?${params.toString()}`;
                });
            } else {
                console.error('Booking failed:', result.message);
                alert('Error processing your booking. Please try again later.');
            }
        })
        .catch(error => {
            console.error('Error saving booking:', error);
            alert('Error processing your booking. Please try again later.');
        });
}
