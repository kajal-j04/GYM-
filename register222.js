document.addEventListener("DOMContentLoaded", async function () {
    console.log("✅ DOM fully loaded!");

    const registerButton = document.getElementById("registerBtn");
    const packageStartDateInput = document.getElementById("package-start-date");

    if (registerButton) {
        registerButton.addEventListener("click", async function (event) {
            event.preventDefault();
            console.log("✅ Register button clicked!");

            if (validateForm()) {
                await registerUser();
            } else {
                console.warn("⚠️ Form validation failed!");
            }
        });
    } else {
        console.error("❌ Register button not found!");
    }

    function validateForm() {
        let isValid = true;
        const inputs = document.querySelectorAll(".ele");

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = "red";
            } else {
                input.style.borderColor = "#ccc";
            }
        });

        return isValid;
    }

    async function registerUser() {
        const formData = {
            gender: document.getElementById("gender").value.trim(),
            name: document.getElementById("name").value.trim(),
            packageStartDate: document.getElementById("package-start-date").value,
            contactNo: document.getElementById("contact-no").value.trim(),
            email: document.getElementById("email").value.trim(),
            plans: document.getElementById("plans").value.trim(),
            height: parseFloat(document.getElementById("height").value),
            weight: parseFloat(document.getElementById("weight").value),
            timeSlot: document.getElementById("time-slot").value.trim(),
        };

        if (Object.values(formData).some(value => !value)) {
            console.error("❌ Missing required fields!", formData);
            alert("All fields are required!");
            return;
        }

        console.log("📩 Sending Form Data:", formData);

        try {
            const response = await fetch("http://localhost:5000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                console.error("❌ Server responded with an error:", response.status);
                alert("❌ Registration failed! Try again later.");
                return;
            }

            const result = await response.json();
            console.log("✅ Server Response:", result);
            alert(result.message);
        } catch (error) {
            console.error("❌ Error submitting form:"+ error);
            alert("❌ Registration failed! Try again later.");
        }
    }

    if (packageStartDateInput) {
        const today = new Date();
        const firstDayCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

        function formatDate(date) {
            return date.toISOString().split("T")[0];
        }

        packageStartDateInput.min = formatDate(firstDayCurrentMonth);
        packageStartDateInput.max = formatDate(lastDayNextMonth);

        packageStartDateInput.addEventListener("keydown", function (event) {
            event.preventDefault();
        });
    }

    // ✅ Autofill Form from URL Parameters
    function autofillFormFromURL() {
        const urlParams = new URLSearchParams(window.location.search);

        document.getElementById("name").value = urlParams.get("name") || "";
        document.getElementById("email").value = urlParams.get("email") || "";
        document.getElementById("contact-no").value = urlParams.get("contactNo") || "";
        document.getElementById("plans").value = urlParams.get("plans") || "";
        document.getElementById("height").value = urlParams.get("height") || "";
        document.getElementById("weight").value = urlParams.get("weight") || "";
        document.getElementById("time-slot").value = urlParams.get("timeSlot") || "";
        document.getElementById("package-start-date").value = urlParams.get("packageStartDate") || "";
        document.getElementById("gender").value = urlParams.get("gender") || "";
    }

    async function fetchPlans() {
        try {
            const response = await fetch('http://localhost:5000/api/packages'); // Replace with your API URL
            const data = await response.json();

            const dropdown = document.getElementById('plans');

            data.forEach(plan => {
                const planName = `${plan.name} (${plan.duration} Month - ${plan.price} Rs)`
                // Check if the option already exists to avoid duplicates
                let exists = Array.from(dropdown.options).some(option => option.textContent === planName);
                if (!exists) {
                    let option = document.createElement('option');
                    option.value = plan.price;
                    option.textContent = planName;
                    dropdown.appendChild(option);
                }
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // ✅ Run autofill when page loads
    autofillFormFromURL();
    fetchPlans();
});
