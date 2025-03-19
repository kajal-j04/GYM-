document.addEventListener("DOMContentLoaded", function () {
    const scheduleBtn = document.getElementById("scheduleBtn");
    const submitBtn = document.querySelector(".clkbtn");
    const formSection = document.querySelector(".form-section");

    scheduleBtn.addEventListener("click", function () {
        formSection.style.display = "block";
    });

    submitBtn.addEventListener("click", async function (event) {
        event.preventDefault();

        submitBtn.disabled = true;
        submitBtn.innerText = "Submitting...";

        const fullName = document.getElementById("full_name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const timeSlot = document.getElementById("time_slot").value;
        const duration = document.getElementById("duration").value;
        const goal = document.getElementById("goal").value;
        const sessionType = document.querySelector("input[name='session_type']:checked");
        const workoutTypes = Array.from(document.querySelectorAll("input[type='checkbox']:checked")).map(cb => cb.value);
        const workoutDays = Array.from(document.querySelectorAll(".checkbox-group input[type='checkbox']:checked")).map(cb => cb.value);

        if (!sessionType || workoutTypes.length === 0 || workoutDays.length === 0) {
            showError("❌ Please fill in all required fields.");
            return;
        }

        const scheduleData = {
            name: fullName,
            email: email,
            phone: phone,
            timeSlot: timeSlot,
            duration: duration,
            goal: goal,
            sessionType: sessionType.value,
            workoutType: workoutTypes,
            workoutDays: workoutDays,
        };

        try {
            const response = await fetch("http://127.0.0.1:5000/schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(scheduleData),
            });

            const result = await response.json();

            if (!response.ok) {
                showError(result.message || "❌ Failed to submit schedule.");
            } else {
                alert("✅ Schedule successfully created!\n📩 A confirmation email has been sent.");
                document.getElementById("scheduleForm").reset();
                window.location.href = "dashboard.html";
            }
        } catch (error) {
            console.error("❌ Error submitting schedule:", error);
            showError("❌ An error occurred. Please try again.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = "Submit";
        }
    });

    function showError(message) {
        alert(message);
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit";
    }
});
