document.addEventListener('DOMContentLoaded', function () {
    // Sample event data
    const events = [
        {
            id: 1,
            title: "Tech Innovation Summit 2023",
            category: "technology",
            date: "2023-11-15",
            time: "09:00",
            location: "johannesburg",
            venue: "Sandton Convention Centre",
            price: 2499,
            description: "Join industry leaders as we explore the latest trends in technology innovation and digital transformation.",
            image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80"
        },
        {
            id: 2,
            title: "African Business Leaders Forum",
            category: "business",
            date: "2023-11-22",
            time: "08:30",
            location: "cape-town",
            venue: "CTICC",
            price: 1899,
            description: "Network with top executives and gain insights into the future of African business landscape.",
            image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
        },
        {
            id: 3,
            title: "Finance & Investment Conference",
            category: "finance",
            date: "2023-12-05",
            time: "10:00",
            location: "johannesburg",
            venue: "The Maslow Hotel",
            price: 2999,
            description: "Expert analysis on investment opportunities and financial market trends in emerging economies.",
            image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1511&q=80"
        },
        {
            id: 4,
            title: "Healthcare Innovation Symposium",
            category: "healthcare",
            date: "2023-12-12",
            time: "08:00",
            location: "pretoria",
            venue: "CSIR International Convention Centre",
            price: 1799,
            description: "Exploring cutting-edge technologies and practices transforming healthcare delivery.",
            image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
        },
        {
            id: 5,
            title: "Digital Education Workshop",
            category: "education",
            date: "2023-11-28",
            time: "13:00",
            location: "online",
            venue: "Virtual Event",
            price: 999,
            description: "Learn how to leverage digital tools for effective teaching and learning experiences.",
            image: "https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1472&q=80"
        },
        {
            id: 6,
            title: "Renewable Energy Summit",
            category: "business",
            date: "2024-01-18",
            time: "09:30",
            location: "durban",
            venue: "Durban ICC",
            price: 2199,
            description: "Exploring sustainable energy solutions for Africa's growing energy demands.",
            image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1472&q=80"
        }
    ];

    // DOM Elements
    const eventsContainer = document.getElementById('eventsContainer');
    const categoryFilter = document.getElementById('category');
    const locationFilter = document.getElementById('location');
    const dateFilter = document.getElementById('date');
    const resetFiltersBtn = document.getElementById('resetFilters');
    const bookingModal = document.getElementById('bookingModal');
    const closeModal = document.querySelector('.close-modal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const bookNowBtn = document.getElementById('bookNowBtn');
    const bookingForm = document.getElementById('bookingForm');
    const bookingTypeRadios = document.querySelectorAll('input[name="bookingType"]');
    const individualFields = document.getElementById('individualFields');
    const companyFields = document.getElementById('companyFields');
    const addDelegateBtn = document.getElementById('addDelegateBtn');
    const delegatesContainer = document.getElementById('delegatesContainer');
    const paymentMethod = document.getElementById('paymentMethod');
    const creditCardFields = document.getElementById('creditCardFields');
    const nextStepBtns = document.querySelectorAll('.next-step');
    const prevStepBtns = document.querySelectorAll('.prev-step');
    const steps = document.querySelectorAll('.step');
    const formSteps = document.querySelectorAll('.form-step');

    // New state variables
    // Updated delegate handling functions
    let allDelegates = [];
    let currentPage = 1;
    const delegatesPerPage = 10;
    let delegateCount = 0;

    let yocoInitialized = false;
    let yocoInstance = null;
    let processingPayment = false;

    // Current booking state
    let currentEvent = null;
    let currentStep = 1;
    // let delegateCount = 0;

    // Initialize the page
    renderEvents(events);
    setupEventListeners();

    // Functions
    function renderEvents(eventsToRender) {
        const eventsContainer = document.getElementById('eventsContainer');
        if (!eventsContainer) return; // Exit if container doesn't exist

        eventsContainer.innerHTML = '';

        if (eventsToRender.length === 0) {
            eventsContainer.innerHTML = '<p class="no-events">No events match your filters. Please try different criteria.</p>';
            return;
        }

        eventsToRender.forEach(event => {
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString('en-ZA', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.innerHTML = `
<div class="event-image">
<img src="${event.image}" alt="${event.title}">
</div>
<div class="event-details">
<span class="event-category">${event.category.charAt(0).toUpperCase() + event.category.slice(1)}</span>
<h3 class="event-title">${event.title}</h3>
<div class="event-meta">
<span><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
<span><i class="far fa-clock"></i> ${event.time}</span>
</div>
<div class="event-meta">
<span><i class="fas fa-map-marker-alt"></i> ${event.venue}</span>
</div>
<p class="event-description">${event.description}</p>
<p class="event-price">R ${event.price.toLocaleString('en-ZA')}</p>
<div class="event-actions">
<button class="btn btn-secondary">More Info</button>
<button class="btn btn-primary book-btn" data-id="${event.id}">Book Now</button>
</div>
</div>
`;

            eventsContainer.appendChild(eventCard);
        });

        // Add event listeners to book buttons
        document.querySelectorAll('.book-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const eventId = parseInt(this.getAttribute('data-id'));
                currentEvent = events.find(event => event.id === eventId);
                openBookingModal();
            });
        });
    }

    function setupEventListeners() {
        // Filter event listeners
        categoryFilter.addEventListener('change', filterEvents);
        locationFilter.addEventListener('change', filterEvents);
        dateFilter.addEventListener('change', filterEvents);
        resetFiltersBtn.addEventListener('click', resetFilters);

        document.getElementById('proceedToPayment').addEventListener('click', function (e) {
            e.preventDefault();

            // Validate the current step first
            if (!validateStep3()) {
                return false;
            }

            // Get the selected payment method
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

            // Complete the booking and redirect to Payfast
            completeBooking(paymentMethod);
        });

        // Modal event listeners
        closeModal.addEventListener('click', closeBookingModal);
        closeModalBtn.addEventListener('click', closeBookingModal);
        window.addEventListener('click', (e) => {
            if (e.target === bookingModal) {
                closeBookingModal();
            }
        });

        // Booking type toggle
        bookingTypeRadios.forEach(radio => {
            radio.addEventListener('change', function () {
                if (this.value === 'individual') {
                    individualFields.style.display = 'block';
                    companyFields.style.display = 'none';
                } else {
                    individualFields.style.display = 'none';
                    companyFields.style.display = 'block';
                }
            });
        });

        // Add delegate button
        addDelegateBtn.addEventListener('click', addDelegateFields);

        // Payment method toggle
        // paymentMethod.addEventListener('change', function () {
        //     if (this.value === 'credit-card') {
        //         creditCardFields.style.display = 'block';
        //     } else {
        //         creditCardFields.style.display = 'none';
        //     }
        // });

        // Form navigation - modified to handle async validation
        nextStepBtns.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const nextStep = parseInt(this.getAttribute('data-next'));
                navigateToStep(nextStep);
            });
        });

        prevStepBtns.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const prevStep = parseInt(this.getAttribute('data-prev'));
                currentStep = prevStep;
                navigateToStep(prevStep);
            });
        });


    }

    function filterEvents() {
        const category = categoryFilter.value;
        const location = locationFilter.value;
        const dateRange = dateFilter.value;

        let filteredEvents = [...events];

        // Filter by category
        if (category !== 'all') {
            filteredEvents = filteredEvents.filter(event => event.category === category);
        }

        // Filter by location
        if (location !== 'all') {
            filteredEvents = filteredEvents.filter(event => event.location === location);
        }

        // Filter by date range
        if (dateRange !== 'all') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            filteredEvents = filteredEvents.filter(event => {
                const eventDate = new Date(event.date);

                switch (dateRange) {
                    case 'this-month':
                        return eventDate.getMonth() === today.getMonth() &&
                            eventDate.getFullYear() === today.getFullYear();
                    case 'next-month':
                        let nextMonth = today.getMonth() + 1;
                        let year = today.getFullYear();
                        if (nextMonth > 11) {
                            nextMonth = 0;
                            year++;
                        }
                        return eventDate.getMonth() === nextMonth &&
                            eventDate.getFullYear() === year;
                    case 'next-3-months':
                        const threeMonthsLater = new Date(today);
                        threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
                        return eventDate >= today && eventDate <= threeMonthsLater;
                    default:
                        return true;
                }
            });
        }

        renderEvents(filteredEvents);
    }

    function resetFilters() {
        categoryFilter.value = 'all';
        locationFilter.value = 'all';
        dateFilter.value = 'all';
        filterEvents();
    }

    function openBookingModal() {
        // Add modal-open class to body
        document.body.classList.add('modal-open');

        if (!currentEvent) return;

        // Reset form
        bookingForm.reset();
        delegatesContainer.innerHTML = '';
        delegateCount = 0;
        allDelegates = [];
        currentStep = 1;

        // Set event details in modal
        document.getElementById('modalTitle').textContent = `Book: ${currentEvent.title}`;
        document.getElementById('modalEventName').textContent = currentEvent.title;

        const eventDate = new Date(currentEvent.date);
        const formattedDate = eventDate.toLocaleDateString('en-ZA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('modalEventDate').textContent = `${formattedDate} at ${currentEvent.time}`;
        document.getElementById('modalEventLocation').textContent = currentEvent.venue;
        document.getElementById('modalEventPrice').textContent = `R ${currentEvent.price.toLocaleString('en-ZA')} per ticket`;
        document.getElementById('modalEventImage').src = currentEvent.image;

        // Set default values
        document.getElementById('ticketQuantity').value = 1;
        document.querySelector('input[name="bookingType"][value="individual"]').checked = true;
        individualFields.style.display = 'block';
        companyFields.style.display = 'none';
        // paymentMethod.value = '';
        // creditCardFields.style.display = 'none';

        // Reset steps
        steps.forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.getAttribute('data-step')) === 1) {
                step.classList.add('active');
            }
        });

        formSteps.forEach(step => {
            step.style.display = 'none';
            if (step.id === 'step1') {
                step.style.display = 'block';
            }
        });

        // Show modal
        bookingModal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        ensurePaginationElements();
    }

   function closeBookingModal() {
    document.body.classList.remove('modal-open');
    bookingModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    sessionStorage.removeItem('paymentProcessing');
    sessionStorage.removeItem('paymentCompleted');
}

    // Add individual delegate with proper numbering
    function addDelegateFields() {
        // First, save all current delegate values
        saveCurrentDelegateValues();

        // Then add new delegate
        const newDelegate = {
            name: '',
            email: '',
            phone: '',
            displayNumber: allDelegates.length + 1
        };

        allDelegates.push(newDelegate);
        delegateCount = allDelegates.length;

        updateDelegateCount();

        // If new delegate would be on a new page, go to that page
        const totalPages = Math.ceil(allDelegates.length / delegatesPerPage);
        if (totalPages > currentPage) {
            currentPage = totalPages;
        }

        renderDelegatesPage();

        // Focus the name field of the new delegate
        const newDelegateId = `delegateName${newDelegate.displayNumber}`;
        setTimeout(() => {
            const input = document.getElementById(newDelegateId);
            if (input) input.focus();
        }, 100);
    }

    function saveCurrentDelegateValues() {
        // Get all currently rendered delegate fields
        const delegateElements = document.querySelectorAll('.delegate-fields');

        delegateElements.forEach(element => {
            const displayNumber = element.getAttribute('data-index');
            const delegate = allDelegates.find(d => d.displayNumber == displayNumber);

            if (delegate) {
                delegate.name = document.getElementById(`delegateName${displayNumber}`)?.value || '';
                delegate.email = document.getElementById(`delegateEmail${displayNumber}`)?.value || '';
                delegate.phone = document.getElementById(`delegatePhone${displayNumber}`)?.value || '';
            }
        });
    }


    // Optimized CSV processing
    function handleBulkUpload(file) {
        const reader = new FileReader();
        document.getElementById('uploadStatus').textContent = "Processing file...";
        document.getElementById('uploadStatus').className = 'upload-processing';

        reader.onload = function (e) {
            try {
                const content = e.target.result;
                const lines = content.split('\n').filter(line => line.trim() !== '');

                if (lines.length < 2) {
                    throw new Error('CSV file is empty or has no data rows');
                }

                const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                const requiredHeaders = ['name', 'email', 'phone'];

                if (!requiredHeaders.every(h => headers.includes(h))) {
                    throw new Error('CSV file must contain columns: Name, Email, Phone');
                }

                // Process in chunks to avoid UI freeze
                const chunkSize = 100;
                const newDelegates = [];
                let processed = 0;

                const processChunk = (start) => {
                    const end = Math.min(start + chunkSize, lines.length);

                    for (let i = start; i < end; i++) {
                        if (i === 0) continue; // Skip header

                        const values = lines[i].split(',');
                        const delegate = {
                            name: values[headers.indexOf('name')]?.trim() || '',
                            email: values[headers.indexOf('email')]?.trim() || '',
                            phone: values[headers.indexOf('phone')]?.trim() || '',
                            displayNumber: newDelegates.length + 1
                        };

                        if (delegate.name && delegate.email && delegate.phone) {
                            newDelegates.push(delegate);
                        }
                    }

                    processed = end;
                    document.getElementById('uploadStatus').textContent =
                        `Processing... ${Math.min(processed, lines.length - 1)} of ${lines.length - 1} records`;

                    if (processed < lines.length) {
                        setTimeout(() => processChunk(processed), 0);
                    } else {
                        finalizeUpload(newDelegates);
                    }
                };

                processChunk(1); // Start processing after header

            } catch (error) {
                document.getElementById('uploadStatus').textContent = error.message;
                document.getElementById('uploadStatus').className = 'upload-error';
                console.error('Error processing file:', error);
            }
        };

        reader.onerror = () => {
            document.getElementById('uploadStatus').textContent = 'Error reading file';
            document.getElementById('uploadStatus').className = 'upload-error';
        };

        reader.readAsText(file);
    }

    // 3. Update finalizeUpload to reset to first page
    function finalizeUpload(newDelegates) {
        if (newDelegates.length === 0) {
            document.getElementById('uploadStatus').textContent = 'No valid delegates found in the file';
            document.getElementById('uploadStatus').className = 'upload-error';
            return;
        }

        // Add delegates with proper numbering
        const startNumber = allDelegates.length > 0 ?
            Math.max(...allDelegates.map(d => d.displayNumber)) + 1 : 1;

        newDelegates.forEach((delegate, index) => {
            delegate.displayNumber = startNumber + index;
        });

        allDelegates = [...allDelegates, ...newDelegates];
        delegateCount = allDelegates.length;

        // Reset to first page and update UI
        currentPage = 1;
        updateDelegateCount();
        renderDelegatesPage();

        document.getElementById('uploadStatus').textContent =
            `Successfully added ${newDelegates.length} delegates (Total: ${allDelegates.length})`;
        document.getElementById('uploadStatus').className = 'upload-success';
    }

    function renderDelegatesPage() {
        delegatesContainer.innerHTML = '';

        // Calculate the range of delegates to show
        const startIndex = (currentPage - 1) * delegatesPerPage;
        const endIndex = Math.min(startIndex + delegatesPerPage, allDelegates.length);

        // Create document fragment for efficient DOM updates
        const fragment = document.createDocumentFragment();

        // Only show delegates for current page
        for (let i = startIndex; i < endIndex; i++) {
            const delegate = allDelegates[i];
            const delegateFields = createDelegateElement(delegate);
            fragment.appendChild(delegateFields);
        }

        delegatesContainer.appendChild(fragment);
        updatePaginationControls();
    }

    function createDelegateElement(delegate) {
        const delegateFields = document.createElement('div');
        delegateFields.className = 'delegate-fields';
        delegateFields.setAttribute('data-index', delegate.displayNumber);

        delegateFields.innerHTML = `
<h4>Delegate #${delegate.displayNumber}</h4>
<button type="button" class="btn btn-icon remove-delegate" title="Remove delegate">
<i class="fas fa-times"></i>
</button>
<div class="form-group">
<label for="delegateName${delegate.displayNumber}">Full Name:</label>
<input type="text" id="delegateName${delegate.displayNumber}" 
value="${delegate.name}" required>
</div>
<div class="form-group">
<label for="delegateEmail${delegate.displayNumber}">Email:</label>
<input type="email" id="delegateEmail${delegate.displayNumber}" 
value="${delegate.email}" required>
</div>
<div class="form-group">
<label for="delegatePhone${delegate.displayNumber}">Phone Number:</label>
<input type="tel" id="delegatePhone${delegate.displayNumber}" 
value="${delegate.phone}" required>
</div>
`;

        delegateFields.querySelector('.remove-delegate').addEventListener('click', () => {
            removeDelegate(delegate.displayNumber);
        });

        return delegateFields;
    }

    // New function to remove a delegate
    // Improved delegate removal with proper renumbering
    function removeDelegate(displayNumber) {
        // Remove from allDelegates array
        allDelegates = allDelegates.filter(d => d.displayNumber !== displayNumber);

        // Renumber remaining delegates to maintain sequence
        allDelegates.forEach((delegate, index) => {
            delegate.displayNumber = index + 1;
        });

        // Update counts and UI
        delegateCount = allDelegates.length;
        updateDelegateCount();

        // Adjust page if we removed the last item on the page
        const totalPages = Math.ceil(allDelegates.length / delegatesPerPage);
        if (currentPage > totalPages) {
            currentPage = Math.max(1, totalPages);
        }

        renderDelegatesPage();
    }

    function updatePaginationControls() {
        try {
            const paginationDiv = document.querySelector('.delegates-pagination');
            const prevPageBtn = document.getElementById('prevPage');
            const nextPageBtn = document.getElementById('nextPage');
            const pageInfo = document.getElementById('pageInfo');

            if (!paginationDiv || !prevPageBtn || !nextPageBtn || !pageInfo) {
                throw new Error('Pagination elements missing');
            }

            const totalPages = Math.ceil(allDelegates.length / delegatesPerPage);

            paginationDiv.style.display = totalPages > 1 ? 'flex' : 'none';
            prevPageBtn.disabled = currentPage <= 1;
            nextPageBtn.disabled = currentPage >= totalPages;
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

        } catch (error) {
            console.error('Pagination error:', error);
            // Attempt to recreate elements if missing
            ensurePaginationElements();
        }
    }

    // Ensure pagination elements exist
    function ensurePaginationElements() {
        if (!document.querySelector('.delegates-pagination')) {
            const paginationDiv = document.createElement('div');
            paginationDiv.className = 'delegates-pagination';
            paginationDiv.textContent = `
<button id="prevPage" class="btn btn-secondary" disabled>
<i class="fas fa-chevron-left"></i>
</button>
<span id="pageInfo">Page 1 of 1</span>
<button id="nextPage" class="btn btn-secondary">
<i class="fas fa-chevron-right"></i>
</button>
`;
            delegatesContainer.insertAdjacentElement('afterend', paginationDiv);
        }
    }

    // Enhanced updateDelegateCount function
    function updateDelegateCount() {
        const delegateCountInput = document.getElementById('delegateCount');
        delegateCountInput.value = allDelegates.length;
        delegateCount = allDelegates.length;
    }

    // Add these event listeners to setupEventListeners()
    document.getElementById('uploadDelegateBtn').addEventListener('click', function () {
        document.getElementById('delegateFile').click();
    });

    document.getElementById('delegateFile').addEventListener('change', function (e) {
        if (e.target.files.length > 0) {
            handleBulkUpload(e.target.files[0]);
        }
    });

    document.getElementById('downloadTemplate').addEventListener('click', function (e) {
        e.preventDefault();

        if (allDelegates.length > 0) {
            // Export current delegates
            let csvContent = "Name,Email,Phone\n";
            allDelegates.forEach(delegate => {
                csvContent += `"${delegate.name}","${delegate.email}","${delegate.phone}"\n`;
            });

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.setAttribute('hidden', '');
            a.setAttribute('href', url);
            a.setAttribute('download', `delegates_export_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            // Download empty template
            const csvContent = "Name,Email,Phone\nJohn Doe,john@example.com,0821234567\nJane Smith,jane@example.com,0839876543";
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.setAttribute('hidden', '');
            a.setAttribute('href', url);
            a.setAttribute('download', 'delegates_template.csv');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    });
    document.getElementById('prevPage').addEventListener('click', function () {
        if (currentPage > 1) {
            currentPage--;
            renderDelegatesPage();
        }
    });

    document.getElementById('nextPage').addEventListener('click', function () {
        const totalPages = Math.ceil(allDelegates.length / delegatesPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderDelegatesPage();
        }
    });


    function navigateToStep(step) {
        // Validate current step before proceeding
        let isValid = true;

        if (currentStep === 1) {
            isValid = validateStep1();
        } else if (currentStep === 2) {
            isValid = validateStep2();
        } else if (currentStep === 3) {
            isValid = validateStep3();
        }

        if (!isValid) {
            return false;
        }

        // Update current step
        currentStep = step;

        // Update step indicators
        steps.forEach(stepElement => {
            stepElement.classList.remove('active');
            if (parseInt(stepElement.getAttribute('data-step')) <= currentStep) {
                stepElement.classList.add('active');
            }
        });

        // Show/hide form steps
        formSteps.forEach(formStep => {
            formStep.style.display = 'none';
            if (formStep.id === `step${currentStep}`) {
                formStep.style.display = 'block';
            }
        });

        // Special handling for specific steps
        if (currentStep === 3) {
            updatePaymentSummary();
        } else if (currentStep === 4) {
            completeBooking();
        }

        if (currentStep === 4) {
            document.body.style.overflow = 'auto'; // Re-enable scrolling
            bookingModal.scrollTop = 0; // Scroll to top of modal
        }

        return true;
    }

    function validateStep1() {
        const ticketQuantity = parseInt(document.getElementById('ticketQuantity').value);

        if (isNaN(ticketQuantity) || ticketQuantity < 1) {
            alert('Please enter a valid number of tickets');
            return false;
        }

        return true;
    }

    function validateStep2() {
        const bookingType = document.querySelector('input[name="bookingType"]:checked').value;

        if (bookingType === 'individual') {
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();

            if (!firstName || !lastName || !email || !phone) {
                alert('Please fill in all individual details');
                return false;
            }

            if (!validateEmail(email)) {
                alert('Please enter a valid email address');
                return false;
            }
        } else {
            const companyName = document.getElementById('companyName').value.trim();
            const companyEmail = document.getElementById('companyEmail').value.trim();
            const companyPhone = document.getElementById('companyPhone').value.trim();
            const delegateCount = parseInt(document.getElementById('delegateCount').value);

            if (!companyName || !companyEmail || !companyPhone) {
                alert('Please fill in all company details');
                return false;
            }

            if (!validateEmail(companyEmail)) {
                alert('Please enter a valid company email address');
                return false;
            }

            // Validate each visible delegate (only those on current page)
            const visibleDelegates = document.querySelectorAll('.delegate-fields');
            for (let i = 0; i < visibleDelegates.length; i++) {
                const delegateId = visibleDelegates[i].getAttribute('data-index');
                const name = document.getElementById(`delegateName${delegateId}`)?.value.trim();
                const email = document.getElementById(`delegateEmail${delegateId}`)?.value.trim();
                const phone = document.getElementById(`delegatePhone${delegateId}`)?.value.trim();

                if (!name || !email || !phone) {
                    alert(`Please fill in all details for delegate #${delegateId}`);
                    return false;
                }

                if (!validateEmail(email)) {
                    alert(`Please enter a valid email address for delegate #${delegateId}`);
                    return false;
                }
            }
        }
        return true;
    }

    function validateStep3() {
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');

        if (!paymentMethod) {
            alert('Please select a payment method');
            return false;
        }

        return true;
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validateCreditCard(number) {
        // Simple validation - in a real app you'd use a more robust solution
        const re = /^[0-9]{13,16}$/;
        return re.test(number.replace(/\s+/g, ''));
    }

    function validateExpiryDate(date) {
        const re = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
        if (!re.test(date)) return false;

        const [_, month, year] = date.match(re);
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;

        // If year is less than current year, or same year but month has passed
        if (parseInt(year) < currentYear ||
            (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
            return false;
        }

        return true;
    }

    function validateCVV(cvv) {
        const re = /^[0-9]{3,4}$/;
        return re.test(cvv);
    }

    function updatePaymentSummary() {
        if (!currentEvent) return;

        const ticketQuantity = parseInt(document.getElementById('ticketQuantity').value);
        const subtotal = currentEvent.price * ticketQuantity;
        const vat = subtotal * 0.15; // 15% VAT
        const total = subtotal + vat;

        document.getElementById('summaryEventName').textContent = currentEvent.title;
        document.getElementById('summaryTicketCount').textContent = `${ticketQuantity} x R ${currentEvent.price.toLocaleString('en-ZA')}`;
        document.getElementById('summarySubtotal').textContent = `R ${subtotal.toLocaleString('en-ZA')}`;
        document.getElementById('summaryVAT').textContent = `R ${vat.toLocaleString('en-ZA')}`;
        document.getElementById('summaryTotal').textContent = `R ${total.toLocaleString('en-ZA')}`;
    }


    // In your script.js, replace the completeBooking function with this:

    function completeBooking(paymentMethod) {
        // Disable the button immediately
        const payButton = document.getElementById('proceedToPayment');
        const bookingRef = 'EC-' + Math.random().toString(36).substr(2, 8).toUpperCase();
        //Store that we're processing payment
        sessionStorage.setItem('paymentProcessing', 'true');
        payButton.disabled = true;


        // Set basic confirmation details
        document.getElementById('bookingReference').textContent = bookingRef;
        document.getElementById('confirmationEventName').textContent = currentEvent.title;

        const eventDate = new Date(currentEvent.date);
        const formattedDate = eventDate.toLocaleDateString('en-ZA', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        document.getElementById('confirmationEventDate').textContent = `${formattedDate} at ${currentEvent.time}`;

        const ticketQuantity = parseInt(document.getElementById('ticketQuantity').value);
        const subtotal = currentEvent.price * ticketQuantity;
        const vat = subtotal * 0.15;
        const total = subtotal + vat;
        document.getElementById('confirmationTotal').textContent = `R ${total.toLocaleString('en-ZA')}`;

        // Prepare booking details
        const bookingDetails = {
            event: {
                title: currentEvent.title,
                date: currentEvent.date,
                time: currentEvent.time,
                venue: currentEvent.venue
            },
            bookingRef,
            ticketQuantity,
            total: calculateTotal(),
            bookingType: document.querySelector('input[name="bookingType"]:checked').value
        };

        if (bookingDetails.bookingType === 'individual') {
            bookingDetails.customer = {
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim()
            };
        } else {
            bookingDetails.company = {
                name: document.getElementById('companyName').value.trim(),
                email: document.getElementById('companyEmail').value.trim(),
                phone: document.getElementById('companyPhone').value.trim(),
                vatNumber: document.getElementById('vatNumber').value.trim()
            };
            bookingDetails.delegatesCount = document.querySelectorAll('.delegate-fields').length;
        }

        // Store full details in sessionStorage
        sessionStorage.setItem('currentBooking', JSON.stringify({
            ...bookingDetails,
            delegates: bookingDetails.bookingType === 'company' ? getDelegateDetails() : null
        }));

        // Process payment with Yoco
        processYocoPayment(bookingDetails);
    }

    function calculateTotal() {
        const ticketQuantity = parseInt(document.getElementById('ticketQuantity').value);
        const subtotal = currentEvent.price * ticketQuantity;
        return subtotal + (subtotal * 0.15); // Including VAT
    }

    function compressBookingData(bookingDetails) {
        // Create a minimal version of the data
        const compressed = {
            e: bookingDetails.event.title.substring(0, 30), // Shortened event title
            ed: bookingDetails.event.date || 'Date not specified', // Ensure event date is not undefined
            et: bookingDetails.event.time || 'Time not specified', // Ensure event time is not undefined
            ev: bookingDetails.event.venue, // Add event venue
            r: bookingDetails.bookingRef,
            t: bookingDetails.bookingType === 'individual' ? 'i' : 'c',
            q: bookingDetails.ticketQuantity,
            a: bookingDetails.total // Ensure this is always included
        };

        // Add customer or company details
        if (bookingDetails.bookingType === 'individual') {
            compressed.f = bookingDetails.customer.firstName.substring(0, 20);
            compressed.l = bookingDetails.customer.lastName.substring(0, 20);
            compressed.m = bookingDetails.customer.email;
            compressed.p = bookingDetails.customer.phone;
        } else {
            compressed.n = bookingDetails.company.name.substring(0, 30);
            compressed.m = bookingDetails.company.email;
            compressed.p = bookingDetails.company.phone;
            compressed.v = bookingDetails.company.vatNumber || ''; // Add VAT number
            compressed.d = bookingDetails.delegatesCount;
        }

        return JSON.stringify(compressed);
    }


    function getDelegateDetails() {
        const delegates = [];
        const delegateInputs = document.querySelectorAll('.delegate-fields');

        delegateInputs.forEach((input, index) => {
            const name = input.querySelector(`#delegateName${index + 1}`).value.trim().split(' ');
            const firstName = name[0];
            const lastName = name.slice(1).join(' ');
            const email = input.querySelector(`#delegateEmail${index + 1}`).value;

            delegates.push({
                firstName,
                lastName,
                email,
                id: 'DEL-' + Math.random().toString(36).substr(2, 8).toUpperCase()
            });
        });

        return delegates;
    }


    function processYocoPayment(bookingDetails) {
        // Hide your modal temporarily
        bookingModal.style.display = 'none';
        // Prevent multiple clicks
        if (processingPayment) return;
        processingPayment = true;

        // Check if Yoco SDK is available
        if (typeof window.YocoSDK === 'undefined') {
            console.error('Yoco SDK not loaded');
            alert('Payment system not available. Please try again later.');
            processingPayment = false;
            bookingModal.style.display = 'block';
            return;
        }

        // Initialize Yoco SDK only once
        if (!yocoInitialized) {
            try {
                yocoInstance = new window.YocoSDK({
                    publicKey: 'pk_test_b41e1e5679m3Vb815064'
                });
                yocoInitialized = true;
            } catch (error) {
                console.error('Failed to initialize Yoco SDK:', error);
                alert('Failed to initialize payment system. Please try again later.');
                processingPayment = false;
                bookingModal.style.display = 'block';
                return;
            }
        }

        const paymentRequest = {
            amountInCents: Math.round(bookingDetails.total * 100),
            currency: 'ZAR',
            name: bookingDetails.bookingType === 'individual'
                ? `${bookingDetails.customer.firstName} ${bookingDetails.customer.lastName}`
                : bookingDetails.company.name,
            description: `Booking for ${bookingDetails.event.title}`,
            callback: function (result) {
                sessionStorage.removeItem('paymentProcessing');

                // Show modal again before handling result
                bookingModal.style.display = 'block';
                document.body.style.overflow = 'hidden';

                if (result.error) {
                    console.error('Payment error:', result.error);
                    alert('Payment failed: ' + result.error.message);
                    document.getElementById('proceedToPayment').disabled = false;
                } else {
                    console.log('Payment successful:', result);
                    sessionStorage.setItem('paymentCompleted', 'true');

                    const fullBookingDetails = JSON.parse(sessionStorage.getItem('currentBooking'));
                    fullBookingDetails.paymentReference = result.id;
                    fullBookingDetails.paymentDate = new Date().toISOString();
                    sessionStorage.setItem('currentBooking', JSON.stringify(fullBookingDetails));

                    // Move to confirmation step
                    currentStep = 4;
                    navigateToStep(4);
                    sendPostPaymentNotifications(fullBookingDetails);
                }
                processingPayment = false;
            }
        };

        // Show Yoco payment form
        try {
            yocoInstance.showPopup(paymentRequest);
        } catch (error) {
            console.error('Error showing Yoco popup:', error);
            alert('Error processing payment. Please try again.');
            processingPayment = false;
            bookingModal.style.display = 'block';
        }
    }

    // Add this function to send notifications after payment
    function sendPostPaymentNotifications(bookingDetails) {
        fetch('/send-post-payment-notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingDetails)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Notifications sent:', data);
            })
            .catch(error => {
                console.error('Error sending notifications:', error);
            });
    }

    // Generate QR Code Functionality
    function generateQRCode(text) {
        // Using Google Charts API for QR code generation
        const size = '200x200';
        const encoding = 'UTF-8';
        return `https://chart.googleapis.com/chart?cht=qr&chs=${size}&chl=${encodeURIComponent(text)}&choe=${encoding}`;
    }


    // The sendEmail function must be updated to accept 'formattedDate' in the body object
    function sendEmail({ to, subject, body }) {
        // Check if this is a business notification email
        const isBusinessNotification = body.isBusinessNotification;
        // Check if this is a company email (no QR code)
        const isCompanyEmail = !!body.companyName && !body.isDelegateEmail;

        // Generate QR code ONLY for non-company, non-business emails (delegates/individuals)
        let qrCodeSection = '';
        if (!isCompanyEmail && !isBusinessNotification && body.qrCodeData) {
            const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(body.qrCodeData)}&size=200`;
            qrCodeSection = `
<div class="ticket-section">
<h3>Your Event Ticket</h3>
<div class="ticket-qr">
<img src="${qrCodeUrl}" alt="Event Ticket QR Code" />
</div>
<p class="ticket-note">
Scan this QR code at the event entrance for quick check-in
</p>
<p class="highlight">Booking Reference: ${body.bookingRef}</p>
${body.delegateId ? `<p class="highlight">Delegate ID: ${body.delegateId}</p>` : ''}
</div>`;
        }

        let emailContent;

        if (isBusinessNotification) {
            // BUSINESS NOTIFICATION EMAIL TEMPLATE (to DesignX)
            emailContent = `
<html>
<head>
<style>
body { 
font-family: Arial, sans-serif; 
line-height: 1.6;
color: #333;
margin: 0;
padding: 0;
background-color: #f7f7f7;
}
.container { 
max-width: 600px; 
margin: 20px auto; 
padding: 20px;
background-color: #fff;
border-radius: 8px;
box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.header { 
background-color: #2C3E50;
color: white;
padding: 20px; 
text-align: center;
border-radius: 8px 8px 0 0;
}
.content { 
padding: 20px; 
}
.footer { 
margin-top: 20px; 
padding-top: 20px; 
border-top: 1px solid #eee; 
font-size: 12px; 
color: #777; 
text-align: center;
}
.booking-details { 
margin-top: 20px;
background: #f9f9f9;
padding: 15px;
border-radius: 5px;
border: 1px solid #eee;
}
.detail-row { 
margin-bottom: 10px; 
padding-bottom: 10px;
border-bottom: 1px solid #eee;
}
.detail-row:last-child {
border-bottom: none;
margin-bottom: 0;
padding-bottom: 0;
}
.detail-label { 
font-weight: bold; 
color: #2C3E50;
display: block;
margin-bottom: 5px;
}
.delegate-list {
margin-top: 10px;
padding-left: 20px;
}
.highlight-box {
background: #e8f4fd;
padding: 15px;
border-radius: 5px;
margin: 15px 0;
border-left: 4px solid #3498db;
}
.button {
display: inline-block;
padding: 10px 20px;
background-color: #3498db;
color: white;
text-decoration: none;
border-radius: 5px;
margin-top: 15px;
}
@media (max-width: 600px) {
.container {
    margin: 10px;
    padding: 10px;
}
}
</style>
</head>
<body>
<div class="container">
<div class="header">
<h2>NEW BOOKING: ${body.eventName}</h2>
<p>${body.bookingType} Registration</p>
</div>
<div class="content">
<div class="highlight-box">
    <strong>Booking Reference:</strong> ${body.bookingRef}<br>
    <strong>Total Amount:</strong> R ${body.totalAmount.toLocaleString('en-ZA')}<br>
    <strong>Tickets:</strong> ${body.ticketQuantity}
</div>

<div class="booking-details">
    <h3>Event Details</h3>
    <div class="detail-row">
        <span class="detail-label">Event Name</span>
        ${body.eventName}
    </div>
    <div class="detail-row">
        <span class="detail-label">Date & Time</span>
        ${body.eventDate} at ${body.eventTime}
    </div>
    <div class="detail-row">
        <span class="detail-label">Venue</span>
        ${body.eventVenue}
    </div>
    
    <h3 style="margin-top: 20px;">${body.bookingType} Details</h3>
    ${body.bookingType === 'Individual' ? `
        <div class="detail-row">
            <span class="detail-label">Customer Name</span>
            ${body.customerName}
        </div>
        <div class="detail-row">
            <span class="detail-label">Customer Email</span>
            ${body.customerEmail}
        </div>
        <div class="detail-row">
            <span class="detail-label">Customer Phone</span>
            ${body.customerPhone}
        </div>
    ` : `
        <div class="detail-row">
            <span class="detail-label">Company Name</span>
            ${body.companyName}
        </div>
        <div class="detail-row">
            <span class="detail-label">Company Email</span>
            ${body.companyEmail}
        </div>
        <div class="detail-row">
            <span class="detail-label">Company Phone</span>
            ${body.companyPhone}
        </div>
        <div class="detail-row">
            <span class="detail-label">VAT Number</span>
            ${body.vatNumber || 'Not provided'}
        </div>
        <div class="detail-row">
            <span class="detail-label">Number of Delegates</span>
            ${body.delegateCount}
        </div>
        <div class="detail-row">
            <span class="detail-label">Delegate List</span>
            <div class="delegate-list">
                ${body.delegates}
            </div>
        </div>
    `}
</div>

<a href="mailto:${body.bookingType === 'Individual' ? body.customerEmail : body.companyEmail}" class="button">
    Contact ${body.bookingType === 'Individual' ? 'Customer' : 'Company'}
</a>
</div>
<div class="footer">
<p>This is an automated notification from DesignX Event Management System</p>
<p>© ${new Date().getFullYear()} DesignX. All rights reserved.</p>
</div>
</div>
</body>
</html>
`;
        } else {
            // CUSTOMER EMAIL TEMPLATE (individual or company delegate)
            emailContent = `
<html>
<head>
<style>
body {
font-family: Arial, sans-serif;
color: #333;
margin: 0;
padding: 0;
background-color: #f7f7f7;
}
.container {
max-width: 600px;
margin: 0 auto;
background-color: #fff;
padding: 20px;
border-radius: 8px;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.header {
text-align: center;
padding-bottom: 20px;
}
.header h1 {
color: #2C3E50;
font-size: 24px;
}
.header p {
color: #95a5a6;
font-size: 14px;
}
.content {
line-height: 1.6;
}
.content p {
font-size: 16px;
color: #555;
}
.content .highlight {
font-weight: bold;
color: #2ecc71;
}
.footer {
text-align: center;
font-size: 12px;
color: #aaa;
padding-top: 20px;
}
.footer a {
color: #3498db;
text-decoration: none;
}
.ticket-section {
background: #f8f9fa;
border: 1px solid #dee2e6;
border-radius: 8px;
padding: 20px;
margin: 20px 0;
text-align: center;
}
.ticket-qr {
margin: 15px auto;
max-width: 200px;
}
.ticket-qr img {
width: 100%;
height: auto;
border: 1px solid #ced4da;
padding: 5px;
background: white;
}
.ticket-note {
color: #6c757d;
font-size: 14px;
margin-top: 10px;
}
.enable-images {
background: #fff3cd;
color: #856404;
padding: 10px;
border-radius: 4px;
margin-bottom: 15px;
font-size: 14px;
}
@media (max-width: 600px) {
.container {
    width: 100%;
    padding: 10px;
}
}
</style>
</head>
<body>
<div class="container">
<div class="header">
<h1>${body.isDelegateEmail ? 'Delegate' : 'Booking'} Confirmation</h1>
<p>Thank you for booking with us!</p>
</div>
<div class="content">
${body.companyName
                    ? `<p>Hello <strong>${body.companyName}</strong>,</p>
       <p>Your company booking for <strong>${currentEvent.title}</strong> has been confirmed.</p>
       <p><span class="highlight">Delegates:</span> ${body.delegateCount}</p>
       ${body.delegates || ''}`
                    : `<p>Hello <strong>${body.firstName} ${body.lastName}</strong>,</p>
       <p>${body.isDelegateEmail ? 'Your delegate registration' : 'Your booking'} for <strong>${currentEvent.title}</strong> has been confirmed.</p>`
                }
<p><span class="highlight">Event:</span> ${currentEvent.title}</p>
<p><span class="highlight">Date:</span> ${body.formattedDate} at ${currentEvent.time}</p>
<p><span class="highlight">Tickets:</span> ${body.ticketQuantity}</p>
${!body.isDelegateEmail ? `<p><span class="highlight">Total:</span> R ${body.total.toLocaleString('en-ZA')}</p>` : ''}
<p><span class="highlight">Booking Reference:</span> ${body.bookingRef}</p>
${body.delegateId ? `<p><span class="highlight">Delegate ID:</span> ${body.delegateId}</p>` : ''}
</div>

${qrCodeSection}

<div class="footer">
<p>If you have any questions, contact <a href="mailto:designxfolio@gmail.com">DesignX Support</a>.</p>
<p>&copy; ${new Date().getFullYear()} DesignX Events. All rights reserved.</p>
</div>
</div>
</body>
</html>
`;
        }

        const emailData = {
            sender: { email: "designxfolio@gmail.com", name: "DesignX Events" },
            to: [{ email: to }],
            subject: subject,
            htmlContent: emailContent
        };
    }

    ``

    function validateQRCode(scannedData) {
        try {
            // Parse the scanned data into key-value pairs
            const dataLines = scannedData.split('\n');
            const qrData = {};

            dataLines.forEach(line => {
                const [key, value] = line.split(':');
                if (key && value) {
                    qrData[key.trim()] = value.trim();
                }
            });

            // Basic validation checks
            if (!qrData['IGHCS-TICKET']) {
                return { valid: false, message: "Invalid ticket format" };
            }

            if (qrData['VALID'] !== 'TRUE') {
                return { valid: false, message: "Ticket marked as invalid" };
            }

            if (new Date(qrData['DATE']) < new Date()) {
                return { valid: false, message: "Event date has passed" };
            }

            // Here you would typically check against your database
            // const isValidInDB = await checkBookingInDatabase(qrData['REF']);
            // if (!isValidInDB) {...}

            return {
                valid: true,
                message: "Ticket is valid",
                details: {
                    event: qrData['EVENT'],
                    name: qrData['NAME'],
                    bookingRef: qrData['REF'],
                    date: qrData['DATE'],
                    type: qrData['TYPE'],
                    delegateId: qrData['DELEGATE-ID'],
                    tickets: qrData['TICKETS']
                }
            };

        } catch (error) {
            return { valid: false, message: "Error processing ticket" };
        }
    }

    function sendPushoverNotification(message) {
        // Pushover API credentials
        const pushoverToken = 'azevoku82g82r3kd7vtqutixkhiatg'; // Replace with your Pushover application token
        const pushoverUser = 'un93rpjf7ouqa4af8ewxkvdd37dhau';   // Replace with your Pushover user/group key

        // Pushover API endpoint
        const url = 'https://api.pushover.net/1/messages.json';

        // Notification data
        const formData = new FormData();
        formData.append('token', pushoverToken);
        formData.append('user', pushoverUser);
        formData.append('message', message);
        formData.append('title', 'New Booking Notification');
        formData.append('sound', 'cashregister'); // Optional notification sound

        // Send the notification
        fetch(url, {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                console.log('Pushover notification sent:', data);
            })
            .catch(error => {
                console.error('Error sending Pushover notification:', error);
            });
    }

    // Add this to help debug validation issues
    function logValidationErrors() {
        if (currentStep === 2) {
            const bookingType = document.querySelector('input[name="bookingType"]:checked').value;
            console.log('Current booking type:', bookingType);

            if (bookingType === 'individual') {
                console.log('First name:', document.getElementById('firstName').value);
                console.log('Last name:', document.getElementById('lastName').value);
                console.log('Email:', document.getElementById('email').value);
                console.log('Phone:', document.getElementById('phone').value);
            } else {
                console.log('Company name:', document.getElementById('companyName').value);
                console.log('Company email:', document.getElementById('companyEmail').value);
                console.log('Company phone:', document.getElementById('companyPhone').value);

                const delegates = document.querySelectorAll('.delegate-fields');
                console.log('Number of delegates:', delegates.length);

                delegates.forEach(delegate => {
                    const id = delegate.getAttribute('data-index');
                    console.log(`Delegate ${id} name:`, document.getElementById(`delegateName${id}`).value);
                    console.log(`Delegate ${id} email:`, document.getElementById(`delegateEmail${id}`).value);
                    console.log(`Delegate ${id} phone:`, document.getElementById(`delegatePhone${id}`).value);
                });
            }
        }
    }

    // Call this in validateStep2() when validation fails
    // logValidationErrors();
    // Add this to your DOMContentLoaded or initialization
    document.addEventListener('yocoModalClosed', function () {
        if (!sessionStorage.getItem('paymentCompleted')) {
            document.getElementById('proceedToPayment').disabled = false;
        }
        sessionStorage.removeItem('paymentProcessing');
    });
});
