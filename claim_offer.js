document.getElementById("claimForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message");
    
    if (!name || !email) {
        message.textContent = "Please fill in all fields.";
        message.style.color = "red";
        return;
    }

    try {
        console.log("Sending request with data:", { name, email }); // Log request data

        const response = await fetch("http://localhost:5000/claim-offer", { // Ensure full URL
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email })
        });

        const result = await response.json();
        console.log("Received response:", result); // Log response

        if (result.success) {
            message.textContent = "Offer claimed successfully!";
            message.style.color = "green";
        } else {
            message.textContent = result.message;
            message.style.color = "red";
        }
    } catch (error) {
        console.error("Fetch error:", error);
        message.textContent = "An error occurred. Please try again later.";
        message.style.color = "red";
    }
});
