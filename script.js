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

function showModal() {
  if (!sessionStorage.getItem("popupShown")) {
      document.getElementById("inquiryModal").style.display = "flex";
      sessionStorage.setItem("popupShown", "true"); // Store flag in sessionStorage
  }
}
// Close Inquiry Modal
function closeModal() {
  document.getElementById("inquiryModal").style.display = "none";
}

// Function to validate form
function validateForm() {
  let valid = true;

  // Get form values
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const message = document.getElementById("message").value.trim();

  // Error message elements
  const nameError = document.getElementById("nameError");
  const emailError = document.getElementById("emailError");
  const phoneError = document.getElementById("phoneError");
  const messageError = document.getElementById("messageError");

  // Reset error messages
  nameError.textContent = emailError.textContent = phoneError.textContent = messageError.textContent = "";

  // Name validation
  if (name.length < 3 || !/^[A-Za-z\s]+$/.test(name)) {
    nameError.textContent = "Name must be at least 3 characters and contain only alphabets.";
    valid = false;
  }

  // Email validation
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    emailError.textContent = "Enter a valid email address.";
    valid = false;
  }

  // Phone validation (10-digit number)
  if (!/^\d{10}$/.test(phone)) {
    phoneError.textContent = "Phone number must be 10 digits.";
    valid = false;
  }

  // Message validation
  if (message.length < 10) {
    messageError.textContent = "Message must be at least 10 characters.";
    valid = false;
  }

  return valid;
}
showModal()
// Form submission with validation
document.getElementById("inquiryForm").addEventListener("submit", function(event) {
  event.preventDefault();

  if (!validateForm()) {
    return; // Stop submission if validation fails
  }

  // Get form values
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const message = document.getElementById("message").value.trim();

  // Send data to backend
  fetch("http://localhost:5000/api/enquiry", { // Fixed API endpoint
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, message })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Failed to submit enquiry");
    }
    return response.json();
  })
  .then(data => {
    alert(data.message); // Show success message
    closeModal();
    document.getElementById("inquiryForm").reset(); // Clear form after submission
  })
  .catch(error => {
    console.error("Error:", error);
    alert("Enquiry submitted.");
  });
});
