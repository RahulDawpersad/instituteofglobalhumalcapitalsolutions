document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    document.getElementById("subscribePopup").style.display = "block";
  }, 1000);

  // Close when clicking the "X" button
  document.getElementById("closeBtn").addEventListener("click", function () {
    document.getElementById("subscribePopup").style.display = "none";
  });

  // Close when clicking anywhere outside the popup
  document.addEventListener("click", function (event) {
    const popup = document.getElementById("subscribePopup");
    if (event.target !== popup && !popup.contains(event.target)) {
      popup.style.display = "none";
    }
  });

  // Subscribe button (for future functionality)
  document.getElementById("subscribeBtn").addEventListener("click", function () {
    // alert("Thank you for subscribing!");
    window.location.href="https://email-subscribe-marketing.vercel.app/";
    document.getElementById("subscribePopup").style.display = "none";
  });
});
