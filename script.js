document.querySelector(".mobile-btn").addEventListener("click", function () {
  document.querySelector(".menu").classList.toggle("active");
});

// Popup Functionality
function openPopup() {
  document.getElementById("popup").style.display = "block";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

// Close popup when clicking outside of it
window.onclick = function(event) {
  var popup = document.getElementById("popup");
  if (event.target === popup) {
    closePopup();
  }
};
function closeModal() {
  document.getElementById("inquiryModal").style.display = "none";
}

document.getElementById("inquiryForm").addEventListener("submit", function(event) {
  event.preventDefault();
  

  // Get form values
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const message = document.getElementById("message").value;

  // Send data to backend
  fetch("http://localhost:3000/enquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, message })
  })
  .then(response => response.json())
  .then(data => {
    alert(data.message); // Show success message
    if (data.redirect) {
      window.location.href = data.redirect; // Redirect to dashboard
    }
    closeModal();
  })
  .catch(error => console.error("Error:", error));
});