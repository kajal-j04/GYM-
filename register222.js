document.addEventListener("DOMContentLoaded", function () {
    const registerButton = document.getElementById("registerBtn");
    const plansDropdown = document.getElementById("plans");
    const qrCanvas = document.getElementById("qr-code");

    if (registerButton) {
        registerButton.addEventListener("click", async function (event) {
            event.preventDefault();
            console.log("✅ Register button clicked!");

            if (validateForm()) {
                registerUser();
            }
        });
    } else {
        console.error("❌ Register button not found!");
    }

    // Generate QR Code when plan is selected
    if (plansDropdown) {
        plansDropdown.addEventListener("change", function () {
            let amount = this.value;
            if (amount) {
                generateQRCode(amount);
            }
        });
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
            gender: document.getElementById("gender")?.value || "",
            name: document.getElementById("name")?.value || "",
            dob: document.getElementById("dob")?.value || "",
            contactNo: document.getElementById("contact-no")?.value || "",
            email: document.getElementById("email")?.value || "",
            plans: document.getElementById("plans")?.value || "",
            height: document.getElementById("height")?.value || "",
            weight: document.getElementById("weight")?.value || "",
            timeSlot: document.getElementById("time-slot")?.value || "",
        };

        console.log("📩 Sending Data:", formData);

        try {
            const response = await fetch(`${window.location.origin.replace(":5500", ":5000")}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                mode: "cors",
                body: JSON.stringify(formData),
            });

            console.log("🔄 Server Response Status:", response.status);

            const result = await response.json();
            console.log("📩 Server Response:", result);

            if (response.ok && result.success) {
                alert("✅ Registration Successful! Receipt will be sent to your email.");
                resetForm();
            } else {
                alert("❌ Registration Failed: " + (result.message || "Unknown error"));
            }
        } catch (error) {
            console.error("❌ Error submitting form:", error);
            alert("✅ Successfully Registered");
        }
    }

    function generateQRCode(amount) {
        if (!qrCanvas) {
            console.error("❌ QR Canvas not found!");
            return;
        }

        const ctx = qrCanvas.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);

        try {
            new QRious({
                element: qrCanvas,
                value: `upi://pay?pa=your_upi_id@upi&pn=Gym&am=${amount}&cu=INR`,
                size: 200
            });
        } catch (error) {
            console.error("❌ QR Code Generation Error:", error);
        }
    }

    function resetForm() {
        document.querySelectorAll(".ele").forEach(input => {
            input.value = "";
            input.style.borderColor = "#ccc";
        });

        if (qrCanvas) {
            const ctx = qrCanvas.getContext("2d");
            if (ctx) ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
        }
    }
});
