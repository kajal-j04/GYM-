document.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.getElementById("emailInput");
    const emailStatus = document.getElementById("emailStatus");
    const clockInBtn = document.getElementById("clockInBtn");
    const clockOutBtn = document.getElementById("clockOutBtn");
    const status = document.getElementById("status");

    // Backend Base URL
    const BASE_URL = "http://localhost:3000"; // Ensure this matches your backend URL

    // Disable buttons initially
    clockInBtn.disabled = true;
    clockOutBtn.disabled = true;

    // Check if email exists in the "registrations" collection
    emailInput.addEventListener("input", () => {
        const email = emailInput.value.trim();
        if (!email) {
            emailStatus.textContent = "";
            clockInBtn.disabled = true;
            clockOutBtn.disabled = true;
            return;
        }

        fetch(`${BASE_URL}/api/check-registration/${email}`)  // ✅ Use full backend URL
            .then(response => response.json())
            .then(data => {
                if (data.exists) {
                    emailStatus.textContent = `✅ Registered user: ${data.name}`;
                    emailStatus.style.color = "green";
                    clockInBtn.disabled = false;
                } else {
                    emailStatus.textContent = "❌ Email not found in database";
                    emailStatus.style.color = "red";
                    clockInBtn.disabled = true;
                    clockOutBtn.disabled = true;
                }
            })
            .catch(error => console.error("Error:", error));
    });

    // Clock In
    clockInBtn.addEventListener("click", () => {
        const email = emailInput.value.trim();
        if (!email) return;

        fetch(`${BASE_URL}/api/attendance/clock-in`, {  // ✅ Use full backend URL
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message.includes("Clocked in")) {
                status.textContent = `Clocked In: ${data.time}`;
                clockInBtn.disabled = true;
                clockOutBtn.disabled = false;
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Failed to clock in. Please try again.");
        });
    });

    // Clock Out
    clockOutBtn.addEventListener("click", () => {
        const email = emailInput.value.trim();
        if (!email) return;

        fetch(`${BASE_URL}/api/attendance/clock-out`, {  // ✅ Use full backend URL
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message.includes("Clocked out")) {
                status.textContent = `Clocked Out: ${data.time}`;
                clockOutBtn.disabled = true;
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Failed to clock out. Please try again.");
        });
    });
});
