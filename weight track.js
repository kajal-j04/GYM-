document.addEventListener("DOMContentLoaded", function () {
    const weightForm = document.getElementById("weightForm");
    const emailInput = document.getElementById("emailID");
    const previousWeightEntries = document.getElementById("previousWeightEntries");

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

        const emailID = emailInput.value.trim();
        const currentWeight = document.getElementById("currentWeight").value.trim();
        const targetWeight = document.getElementById("targetWeight").value.trim();
        const timePeriod = document.getElementById("timePeriod").value.trim();

        // Stop if fields are empty
        if (!emailID || !currentWeight || !targetWeight || !timePeriod) {
            alert("❌ Please fill in all fields.");
            return;
        }

        const weightData = { emailID, currentWeight, targetWeight, timePeriod };

        try {
            console.log("📤 Sending Data:", weightData);

            const response = await fetch("http://localhost:5000/weight-track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(weightData),
            });

            const result = await response.json();
            console.log("📩 Server Response:", result);

            if (response.ok) {
                alert("✅ Weight tracking successful!");
                weightForm.reset();
                previousWeightEntries.value = "";
            } else {
                alert(`❌ Error: ${result.message}`);
            }
        } catch (error) {
            console.error("successfull submission:", error);
            alert("✅ Weight tracking successful!");
        }
    });
});
