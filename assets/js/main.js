document.getElementById("subscribeForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    
    const emailInput = document.getElementById("email");
    const message = document.getElementById("message");
    const userEmail = emailInput.value.trim();

    if (!userEmail) {
        message.textContent = "⚠️ Please enter a valid email.";
        return;
    }

    message.textContent = "⏳ Processing your subscription... Please wait.";

    try {
        const response = await fetch("https://ighcs-test-with-database.onrender.com/subscribe", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail }),
        });

        const result = await response.json();

        if (response.ok) {
            message.innerHTML = `<img src="assets/image/valid_icon2.png" alt="Icon" style="width: 30px; height: 30px;"> <p class="subscribe-success-message">You have successfully subscribed to IGHCS, check your emails after 1 minute</p>`;
            emailInput.value = ""; 
        } else {
            throw new Error(result.message || "Unable to create contact, Email is already associated with another Contact.!");
        }
    } catch (error) {
        message.innerHTML = `<img src="assets/image/error-validation.png" alt="Icon" style="width: 30px; height: 30px;"><p class="subscribe-error-message">${error.message}</p>`;
        emailInput.value = ""; 
    }
});



// document.getElementById("subscribeForm").addEventListener("submit", async function (e) {
//     e.preventDefault();
    
//     const emailInput = document.getElementById("email");
//     const message = document.getElementById("message");
//     const userEmail = emailInput.value.trim();

//     if (!userEmail) {
//         message.textContent = "⚠️ Please enter a valid email.";
//         return;
//     }

//     message.textContent = "⏳ Processing your subscription... Please wait.";

//     try {
//         const response = await fetch("https://mysql-database-w8hh.onrender.com/subscribe", {  // <-- USE YOUR BACKEND URL
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ email: userEmail }),
//         });

//         const result = await response.json();

//         if (response.ok) {
//             message.innerHTML = `<img src="assets/image/valid_icon2.png" alt="Icon" style="width: 30px; height: 30px;"> <p class="subscribe-success-message">You have successfully subscribed to IGHCS, check your emails after 1 minute</p>`;
//             emailInput.value = "";  // **Clears the input field**
//         } else {
//             throw new Error(result.message || "Unable to create contact, Email is already associated with another Contact.!");
//         }
//     } catch (error) {
//         message.innerHTML = `<img src="assets/image/error-validation.png" alt="Icon" style="width: 30px; height: 30px;"><p class="subscribe-error-message">${error.message}</p>`;
//         emailInput.value = "";  // **Clears the input field**
//     }
// });






// document.getElementById("subscribeForm").addEventListener("submit", async function (e) {
//     e.preventDefault();
    
//     const emailInput = document.getElementById("email");
//     const message = document.getElementById("message");
//     const userEmail = emailInput.value.trim();

//     if (!userEmail) {
//         message.textContent = "⚠️ Please enter a valid email.";
//         return;
//     }

//     message.textContent = "⏳ Processing your subscription... Please wait.";

//     try {
//         const response = await fetch("/subscribe", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ email: userEmail }),
//         });

//         const result = await response.json();

//         if (response.ok) {
//             message.innerHTML = `<img src="assets/image/valid_icon2.png" alt="Icon" style="width: 30px; height: 30px;"> <p class="subscribe-success-message">You have successfully subscribed to IGHCS, check your emails after 1 minute</p>`;
//             emailInput.value = "";  // **Clears the input field**
//         } else {
//             throw new Error(result.error || "Unable to create contact, email is already associated with another Contact.");
//         }
//     } catch (error) {
//         message.innerHTML = `<img src="assets/image/error-validation.png" alt="Icon" style="width: 30px; height: 30px;"><p class="subscribe-error-message">${error.message}</p>`;
//         emailInput.value = "";  // **Clears the input field**
//     }
// });


