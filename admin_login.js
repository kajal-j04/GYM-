
document.addEventListener("DOMContentLoaded", function () {
    let loginForm = document.getElementById("loginForm");
    let usernameField = document.getElementById("loginUsername");
    let passwordField = document.getElementById("loginPassword");
    let userError = document.getElementById("loginUserError");
    let passError = document.getElementById("loginPassError");

    // Ensure all elements exist before adding event listeners
    if (loginForm && usernameField && passwordField && userError && passError) {
        loginForm.addEventListener("submit", async function(event) {
            event.preventDefault();

            let username = usernameField.value.trim();
            let password = passwordField.value.trim();

            // Validation messages
            userError.textContent = username === "" ? "Username is required!" : "";
            passError.textContent = password === "" ? "Password is required!" : "";

            if (username && password) {
                try {
                    const response = await fetch("http://localhost:5000/admin-login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username, password })
                    });

                    if (!response.ok) throw new Error("Server error! Try again later.");

                    const result = await response.json();
                    
                    if (result.success) {
                        alert("Login Successful!");
                        window.location.assign("admin_panel.html");
                    } else {
                        alert(result.message || "Invalid credentials!");
                    }
                } catch (error) {
                    alert("Error: " + error.message);
                }
            }
        });
    }

    // Forgot Password Function (Defined Outside Event Listener)
    window.forgotPassword = function () {
        alert("Password reset instructions have been sent to your email.");
    };
});

