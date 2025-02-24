document.addEventListener("DOMContentLoaded", function () {
    const trackButton = document.querySelector(".clkbtn");

    trackButton.addEventListener("click", async function (event) {
        event.preventDefault();

        // Get form values
        const memberId = document.getElementById("member-id").value.trim();
        const weightGain = document.getElementById("weight-gain").value.trim();
        const weightLoss = document.getElementById("weight-loss").value.trim();
        const previousWeight = document.getElementById("previous-weight").value.trim();
        const createdDate = document.getElementById("created-date").value.trim();

        // Validate required fields
        if (!memberId || !previousWeight || !createdDate) {
            alert("Member ID, Previous Weight, and Created Date are required!");
            return;
        }

        // Prepare data object
        const weightData = {
            memberId,
            weightGain: weightGain ? parseFloat(weightGain) : 0,
            weightLoss: weightLoss ? parseFloat(weightLoss) : 0,
            previousWeight: parseFloat(previousWeight),
            createdDate,
        };

        try {
            // Send data to backend API
            const response = await fetch("http://localhost:5000/track-weight", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(weightData),
            });

            const result = await response.json();

            if (response.ok) {
                alert("Weight tracking successful!");
                // Optionally reset form
                document.querySelector(".register-box").reset();
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to track weight. Please try again.");
        }
    });
});
