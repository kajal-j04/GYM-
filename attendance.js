document.addEventListener("DOMContentLoaded", () => {
    const BASE_URL = "http://localhost:5000"; // Ensure this matches your backend URL
  
    // ===============================
    // MEMBER ATTENDANCE FUNCTIONALITY
    // ===============================
    const emailInput = document.getElementById("emailInput");
    const emailStatus = document.getElementById("emailStatus");
    const clockInBtn = document.getElementById("clockInBtn");
    const clockOutBtn = document.getElementById("clockOutBtn");
    const status = document.getElementById("status");
  
    // Disable member buttons initially
    clockInBtn.disabled = true;
    clockOutBtn.disabled = true;
  
    // Check if member email exists in the registrations schema
    emailInput.addEventListener("input", () => {
      const email = emailInput.value.trim();
      if (!email) {
        emailStatus.textContent = "";
        clockInBtn.disabled = true;
        clockOutBtn.disabled = true;
        return;
      }
  
      // Updated endpoint to check registrations schema
      fetch(`${BASE_URL}/api/check-registration/${email}`)
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
  
    // Member Clock In (writes to attendance collection)
    clockInBtn.addEventListener("click", () => {
      const email = emailInput.value.trim();
      if (!email) return;
  
      fetch(`${BASE_URL}/api/attendance/clock-in`, {
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
  
    // Member Clock Out (writes to attendance collection)
    clockOutBtn.addEventListener("click", () => {
      const email = emailInput.value.trim();
      if (!email) return;
  
      fetch(`${BASE_URL}/api/attendance/clock-out`, {
        method: "PUT", // Use PUT as per backend implementation
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
  
    // ===============================
    // TRAINER ATTENDANCE FUNCTIONALITY
    // ===============================
    const trainerEmailInput = document.getElementById("trainerEmailInput");
    const trainerEmailStatus = document.getElementById("trainerEmailStatus");
    const trainerClockInBtn = document.getElementById("trainerClockInBtn");
    const trainerClockOutBtn = document.getElementById("trainerClockOutBtn");
    const trainerStatus = document.getElementById("trainerStatus");
  
    // Disable trainer buttons initially
    trainerClockInBtn.disabled = true;
    trainerClockOutBtn.disabled = true;
  
    // Check if trainer email exists in the trainers schema
    trainerEmailInput.addEventListener("input", () => {
      const email = trainerEmailInput.value.trim();
      if (!email) {
        trainerEmailStatus.textContent = "";
        trainerClockInBtn.disabled = true;
        trainerClockOutBtn.disabled = true;
        return;
      }
  
      // Updated endpoint to check trainers schema
      fetch(`${BASE_URL}/api/check-trainer/${email}`)
        .then(response => response.json())
        .then(data => {
          if (data.exists) {
            trainerEmailStatus.textContent = `✅ Registered trainer: ${data.name}`;
            trainerEmailStatus.style.color = "green";
            trainerClockInBtn.disabled = false;
          } else {
            trainerEmailStatus.textContent = "❌ Trainer email not found in database";
            trainerEmailStatus.style.color = "red";
            trainerClockInBtn.disabled = true;
            trainerClockOutBtn.disabled = true;
          }
        })
        .catch(error => console.error("Error:", error));
    });
  
    // Trainer Clock In (writes to trainer_attendance collection)
    trainerClockInBtn.addEventListener("click", () => {
      const email = trainerEmailInput.value.trim();
      if (!email) return;
  
      fetch(`${BASE_URL}/api/attendance/trainer-clock-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
        .then(response => response.json())
        .then(data => {
          if (data.message.includes("clocked in")) {
            trainerStatus.textContent = `Clocked In: ${data.time}`;
            trainerClockInBtn.disabled = true;
            trainerClockOutBtn.disabled = false;
          } else {
            alert(data.message);
          }
        })
        .catch(error => {
          console.error("Error:", error);
          alert("Failed to clock in. Please try again.");
        });
    });
  
    // Trainer Clock Out (writes to trainer_attendance collection)
    trainerClockOutBtn.addEventListener("click", () => {
      const email = trainerEmailInput.value.trim();
      if (!email) return;
  
      fetch(`${BASE_URL}/api/attendance/trainer-clock-out`, {
        method: "PUT", // Use PUT per backend implementation
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
        .then(response => response.json())
        .then(data => {
          if (data.message.includes("clocked out")) {
            trainerStatus.textContent = `Clocked Out: ${data.time}`;
            trainerClockOutBtn.disabled = true;
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
  