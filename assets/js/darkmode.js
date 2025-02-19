const toggleBtn = document.getElementById("mode-toggle");
const body = document.body;
const icon = document.getElementById("toggle-icon");

// Load saved mode
if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-mode");
    icon.classList.replace("fa-moon", "fa-sun");
}

// Toggle Theme
toggleBtn.addEventListener("click", () => {
    body.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
        icon.classList.replace("fa-moon", "fa-sun");
    } else {
        localStorage.setItem("theme", "light");
        icon.classList.replace("fa-sun", "fa-moon");
    }
});