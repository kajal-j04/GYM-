document.addEventListener("DOMContentLoaded", function () {
    const scheduleBtn = document.getElementById("scheduleBtn");
    const submitBtn = document.querySelector(".clkbtn");
    const formSection = document.querySelector(".form-section");
    const form = document.querySelector(".Schedule-box");

    // Show the form when the "Schedule" button is clicked
    scheduleBtn.addEventListener("click", function () {
        formSection.style.display = "block";
    });

    // Form submission handling
    submitBtn.addEventListener("click", async function (event) {
        event.preventDefault(); // Prevent default form submission

        // Get input values
        const fullName = document.getElementById("full_name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const timeSlot = document.getElementById("time_slot").value;
        const duration = document.getElementById("duration").value;
        const goal = document.getElementById("goal").value;
        const sessionType = document.querySelector("input[name='session_type']:checked");

        // Get selected workout types
        const workoutTypes = document.querySelectorAll("input[type='checkbox']:checked");
        const selectedWorkoutTypes = Array.from(workoutTypes).map(cb => cb.value);

        // Get selected workout days
        const workoutDays = document.querySelectorAll(".checkbox-group input[type='checkbox']:checked");
        const selectedWorkoutDays = Array.from(workoutDays).map(cb => cb.value);

        // Validation checks
        if (fullName.length < 3) {
            alert("Please enter a valid full name (at least 3 characters).");
            return;
        }

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (!phone.match(/^\d{10}$/)) {
            alert("Please enter a valid 10-digit phone number.");
            return;
        }

        if (selectedWorkoutTypes.length === 0) {
            alert("Please select at least one workout type.");
            return;
        }

        if (!sessionType) {
            alert("Please select a session type (Group or Individual).");
            return;
        }

        if (selectedWorkoutDays.length === 0) {
            alert("Please select at least one preferred workout day.");
            return;
        }

        // Create an object to store the form data
        const scheduleData = {
            name: fullName,
            email: email,
            phone: phone,
            timeSlot: timeSlot,
            duration: duration,
            goal: goal,
            sessionType: sessionType.value,
            workoutType: selectedWorkoutTypes,
            workoutDays: selectedWorkoutDays,
        };

        try {
            // Send data to backend using fetch
            const response = await fetch("http://localhost:5000/schedule", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(scheduleData),
            });

            if (response.ok) {
                alert("Schedule successfully created!");
                window.location.href = "dashboard.html"; // ✅ Redirect to dashboard.html
            } else {
                alert("Failed to submit schedule. Try again!");
            }
        } catch (error) {
            console.error("Error submitting schedule:", error);
            alert("Server error. Try again later!");
        }
    });
});
