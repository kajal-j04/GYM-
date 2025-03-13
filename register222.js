document.addEventListener("DOMContentLoaded", function () {
    // Select the registration button and all form input elements (with class "ele")
    const submitBtn = document.querySelector(".clkbtn");
    const formInputs = document.querySelectorAll(".ele");

    // Registration form submission handling
    submitBtn.addEventListener("click", async function (event) {
        event.preventDefault(); // Prevent default form submission

        // Get input values from the registration form
        const memberId = document.getElementById("member-id").value.trim();
        const gender = document.getElementById("gender").value;
        const name = document.getElementById("name").value.trim();
        const dob = document.getElementById("dob").value;
        const contactNo = document.getElementById("contact-no").value.trim();
        const email = document.getElementById("email").value.trim();
        const plans = document.getElementById("Plans").value;
        const totalAmount = document.getElementById("total-amount").value.trim();
        const height = document.getElementById("height").value.trim();
        const weight = document.getElementById("weight").value.trim();
        const timeSlot = document.getElementById("time-slot").value;

        // Basic validation checks
        if (memberId === "") {
            alert("Please enter your Member ID.");
            return;
        }
        if (name.length < 3) {
            alert("Please enter a valid name (at least 3 characters).");
            return;
        }
        if (!/^\d{10}$/.test(contactNo)) {
            alert("Please enter a valid 10-digit contact number.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }
        if (plans === "") {
            alert("Please select a plan.");
            return;
        }

        // Create an object to store the registration data
        const registrationData = {
            memberId: memberId,
            gender: gender,
            name: name,
            dob: dob,
            contactNo: contactNo,
            email: email,
            plans: plans,
            totalAmount: parseFloat(totalAmount) || 0,
            height: parseFloat(height) || 0,
            weight: parseFloat(weight) || 0,
            timeSlot: timeSlot,
        };

        try {
            // Send registration data to backend using fetch
            const response = await fetch("http://localhost:3000/Register222", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(registrationData),
            });

            if (response.ok) {
                alert("Registration successful!");
                resetForm();
                // Optionally, redirect the user after successful registration:
                // window.location.href = "dashboard.html";
            } else {
                const result = await response.json();
                alert("Error: " + result.message);
            }
        } catch (error) {
            console.error("Error submitting registration:", error);
            alert("Failed to connect to server. Please try again later.");
        }
    });

    // Function to reset the form inputs after successful registration
    function resetForm() {
        formInputs.forEach(input => {
            input.value = "";
            input.style.borderColor = "#ccc";
        });
    }
});
