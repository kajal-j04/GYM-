document.addEventListener("DOMContentLoaded", function () {
    const weightForm = document.getElementById("weightForm");
    const toggleFormBtn = document.getElementById("toggleFormBtn");
    const formSection = document.getElementById("formSection");
    const emailInput = document.getElementById("emailID");
    const previousWeightEntries = document.getElementById("previousWeightEntries");

    // Toggle Form Visibility
    toggleFormBtn.addEventListener("click", function () {
        formSection.style.display = formSection.style.display === "none" || formSection.style.display === "" ? "block" : "none";
    });

    // Fetch Previous Weight History on Email Blur
    emailInput.addEventListener("blur", async function () {
        const emailID = emailInput.value.trim();
        if (emailID) {
            try {
                const response = await fetch(`http://localhost:5000/weight-history/${emailID}`);
                const data = await response.json();

                if (response.ok && data.length > 0) {
                    previousWeightEntries.value = data.map(entry => 
                        `Date: ${entry.createdDate.split('T')[0]}, Current Weight: ${entry.currentWeight} kg, Target Weight: ${entry.targetWeight} kg`
                    ).join("\n");
                } else {
                    previousWeightEntries.value = "No previous records found.";
                }
            } catch (error) {
                console.error("❌ Error fetching weight history:", error);
                previousWeightEntries.value = "Failed to fetch past entries.";
            }
        }
    });

    // Handle Form Submission
    weightForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const fullName = document.getElementById("fullName").value.trim();
        const emailID = emailInput.value.trim();
        const currentWeight = document.getElementById("currentWeight").value.trim();
        const targetWeight = document.getElementById("targetWeight").value.trim();
        const timePeriod = document.getElementById("timePeriod").value.trim();

        // Validation
        if (fullName.length < 3) {
            alert("Full Name must be at least 3 characters.");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailID)) {
            alert("Please enter a valid email.");
            return;
        }

        if (isNaN(currentWeight) || currentWeight <= 0) {
            alert("Current Weight must be greater than 0.");
            return;
        }

        if (isNaN(targetWeight) || targetWeight <= 0) {
            alert("Target Weight must be greater than 0.");
            return;
        }

        if (!timePeriod) {
            alert("Please select a time period.");
            return;
        }

        const weightData = {
            fullName,
            emailID,
            currentWeight: parseFloat(currentWeight),
            targetWeight: parseFloat(targetWeight),
            timePeriod,
        };
 
        try {
            const response = await fetch("http://localhost:3000/weight-track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(weightData),
            });

            const result = await response.json();

            if (response.ok) {
                alert("✅ Weight tracking successful!");
                weightForm.reset();
                previousWeightEntries.value = ""; // Clear previous entries

                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1000);
            } else {
                alert(`❌ Error: ${result.message}`);
            }
        } catch (error) {
            console.error("❌ Error:", error);
            alert("Failed to track weight. Please try again.");
        }
    });
});
