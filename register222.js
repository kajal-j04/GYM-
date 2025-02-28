document.addEventListener("DOMContentLoaded", function () {
    const registerButton = document.querySelector(".clkbtn");
    const formInputs = document.querySelectorAll(".ele");

    registerButton.addEventListener("click", async function (event) {
        event.preventDefault();
        
        if (validateForm()) {
            const formData = collectFormData();
            try {
                const response = await fetch("http://localhost:3000/register222", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });
                
                const result = await response.json();
                if (response.ok) {
                    alert("Registration successful!");
                    resetForm();
                } else {
                    alert("Error: " + result.message);
                }
            } catch (error) {
                console.error("Error submitting form:", error);
                alert("Failed to connect to server. Please try again later.");
            }
        }
    });

    function validateForm() {
        let isValid = true;
        
        formInputs.forEach(input => {
            if (input.value.trim() === "") {
                isValid = false;
                input.style.borderColor = "red";
            } else {
                input.style.borderColor = "#ccc";
            }
        });

        // Validate contact number
        const contactNo = document.getElementById("contact-no");
        if (!/^[0-9]{10}$/.test(contactNo.value)) {
            isValid = false;
            contactNo.style.borderColor = "red";
            alert("Please enter a valid 10-digit contact number.");
        }

        // Validate email
        const email = document.getElementById("email");
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.value)) {
            isValid = false;
            email.style.borderColor = "red";
            alert("Please enter a valid email address.");
        }

        return isValid;
    }

    function collectFormData() {
        return {
            memberId: document.getElementById("member-id").value,
            gender: document.getElementById("gender").value,
            name: document.getElementById("name").value,
            dob: document.getElementById("dob").value,
            contactNo: document.getElementById("contact-no").value,
            email: document.getElementById("email").value,
            address: document.getElementById("full-address").value,
            plans: document.getElementById("plans").value,
            totalAmount: parseFloat(document.getElementById("total-amount").value) || 0,
            height: parseFloat(document.getElementById("height").value) || 0,
            weight: parseFloat(document.getElementById("weight").value) || 0,
            timeSlot: document.getElementById("time-slot").value,
        };
    }

    function resetForm() {
        formInputs.forEach(input => {
            input.value = "";
            input.style.borderColor = "#ccc";
        });
    }
});