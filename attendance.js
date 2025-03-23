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

  // Disable buttons initially
  clockInBtn.disabled = true;
  clockOutBtn.disabled = true;

  // ✅ Check if member email exists in the registrations collection
  emailInput.addEventListener("input", async () => {
    const email = emailInput.value.trim();
    if (!email) {
      emailStatus.textContent = "";
      clockInBtn.disabled = true;
      clockOutBtn.disabled = true;
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/check-registration/${email}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      if (data.success && data.user) {
        emailStatus.textContent = `✅ Registered user: ${data.user.name}`;
        emailStatus.style.color = "green";
        clockInBtn.disabled = false;
        clockOutBtn.disabled = true;
      } else {
        emailStatus.textContent = "❌ Email not found in database";
        emailStatus.style.color = "red";
        clockInBtn.disabled = true;
        clockOutBtn.disabled = true;
      }
    } catch (error) {
      console.error("❌ Error fetching user:", error);
      emailStatus.textContent = "❌ Error checking email";
      emailStatus.style.color = "red";
    }
  });

  // ✅ Member Clock In
  clockInBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    if (!email) return alert("⚠️ Please enter a valid email!");

    try {
      const response = await fetch(`${BASE_URL}/api/attendance/clock-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        status.textContent = `✅ Clocked In: ${data.time}`;
        clockInBtn.disabled = true;
        clockOutBtn.disabled = false;
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("❌ Error clocking in:", error);
      alert("❌ Failed to clock in. Please try again.");
    }
  });

  // ✅ Member Clock Out (Updated to use PUT)
  clockOutBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    if (!email) return alert("⚠️ Please enter a valid email!");

    try {
      const response = await fetch(`${BASE_URL}/api/attendance/clock-out`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        status.textContent = `✅ Clocked Out: ${data.time}`;
        clockOutBtn.disabled = true;
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("❌ Error clocking out:", error);
      alert("❌ Failed to clock out. Please try again.");
    }
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

  // ✅ Check if trainer email exists in the trainers collection
  trainerEmailInput.addEventListener("input", async () => {
    const email = trainerEmailInput.value.trim();
    if (!email) {
      trainerEmailStatus.textContent = "";
      trainerClockInBtn.disabled = true;
      trainerClockOutBtn.disabled = true;
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/check-trainer/${email}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      if (data.success && data.user) {
        trainerEmailStatus.textContent = `✅ Registered trainer: ${data.user.name}`;
        trainerEmailStatus.style.color = "green";
        trainerClockInBtn.disabled = false;
        trainerClockOutBtn.disabled = true;
      } else {
        trainerEmailStatus.textContent = "❌ Trainer email not found in database";
        trainerEmailStatus.style.color = "red";
        trainerClockInBtn.disabled = true;
        trainerClockOutBtn.disabled = true;
      }
    } catch (error) {
      console.error("❌ Error fetching trainer:", error);
      trainerEmailStatus.textContent = "❌ Error checking email";
      trainerEmailStatus.style.color = "red";
    }
  });

  // ✅ Trainer Clock In
  trainerClockInBtn.addEventListener("click", async () => {
    const email = trainerEmailInput.value.trim();
    if (!email) return alert("⚠️ Please enter a valid email!");

    try {
      const response = await fetch(`${BASE_URL}/api/attendance/trainer-clock-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        trainerStatus.textContent = `✅ Clocked In: ${data.time}`;
        trainerClockInBtn.disabled = true;
        trainerClockOutBtn.disabled = false;
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("❌ Error clocking in trainer:", error);
      alert("❌ Failed to clock in. Please try again.");
    }
  });

  // ✅ Trainer Clock Out (Updated to use PUT)
  trainerClockOutBtn.addEventListener("click", async () => {
    const email = trainerEmailInput.value.trim();
    if (!email) return alert("⚠️ Please enter a valid email!");

    try {
      const response = await fetch(`${BASE_URL}/api/attendance/trainer-clock-out`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        trainerStatus.textContent = `✅ Clocked Out: ${data.time}`;
        trainerClockOutBtn.disabled = true;
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("❌ Error clocking out trainer:", error);
      alert("❌ Failed to clock out. Please try again.");
    }
  });
});
