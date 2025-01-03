
function validateNumber(event) {
    const key = event.key; // Get the key that was pressed

    // Allow backspace, delete, arrows, and control keys like Tab
    if (key === "Backspace" || key === "Delete" || key === "ArrowLeft" || key === "ArrowRight" || key === "Tab" || key === "Enter") {
        return; // Do nothing, let the action happen
    }

    // Check if the pressed key is a valid number (0-9)
    if (!/^[0-9]$/.test(key)) {
        event.preventDefault(); // If it's not a number, prevent the input
    }
}

function showAlert(message, type) {
    document.getElementById("alertModal").style.display = "flex";
    document.getElementById("alertType").textContent = type;
    document.getElementById("alertMessage").textContent = message
    if(type==="ERROR"){
        document.getElementById("okBtn").style.backgroundColor="#d32f2f"
    } else {
        document.getElementById("okBtn").style.backgroundColor="#45a049"
    }
}

// Function to close the alert
function closeAlert() {
    document.getElementById("alertModal").style.display = "none";
    const msg = document.getElementById("alertMessage").textContent;
    if(msg === "Signup successful!"){
        window.location.href = './login_index.html';
    }
    if(msg === "Login successful!"){
        window.location.href = './dashboard.html';
    }
}

function toggleTheme() {
    if (document.body.classList.contains("light-theme")) {
        document.body.classList.remove("light-theme");
        document.body.classList.add("dark-theme");
        document.getElementById("themeIcon").textContent = "🌞"; // Sun icon for dark theme
        localStorage.setItem("theme", "dark"); // Save the theme to localStorage
    } else {
        document.body.classList.remove("dark-theme");
        document.body.classList.add("light-theme");
        document.getElementById("themeIcon").textContent = "🌙"; // Moon icon for light theme
        localStorage.setItem("theme", "light"); // Save the theme to localStorage
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const loginBtn = document.querySelector('.login');
    const signupBtn = document.querySelector('.signup');
    const loginBox = document.querySelector('.login-box');
    const signupBox = document.querySelector('.signup-box');

    // Close the alert if the user clicks outside of the modal content
    window.onclick = function (event) {
        if (event.target == document.getElementById("alertModal")) {
            closeAlert();
        }
    }

    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-theme");
        document.getElementById("themeIcon").textContent = "🌞"; // Sun icon for dark theme
    } else {
        document.body.classList.add("light-theme");
        document.getElementById("themeIcon").textContent = "🌙"; // Moon icon for light theme
    }

    function validateEmail(email) {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return emailPattern.test(email);
    }
    function validateString(str) {
        if(str.length>20) return false;
        const pattern = /^[A-Za-z]+(\s[A-Za-z]+)*$/; // Only alphabets, spaces allowed between words
        return pattern.test(str);
    }
    function validatePhone(str) {
        if (str.length < 10) {
            return false;
        }
        return true;
    }
    function validateDate(date) {
        var currDate = new Date().toLocaleDateString("en-CA");
        if (date < currDate) {
            return false;
        }
        return true;
    }

    // Switch to Login form
    loginBtn.addEventListener('click', function () {
        loginBox.style.display = 'flex';
        signupBox.style.display = 'none';
    });

    // Switch to Signup form
    signupBtn.addEventListener('click', function () {
        signupBox.style.display = 'flex';
        loginBox.style.display = 'none';
    });

    // Handle Login form submission
    document.querySelector('.login-box .clkbtn').addEventListener('click', function () {
        const email = document.querySelector('.login-box .email').value;
        const password = document.querySelector('.login-box .password').value;

        fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })
            .then(response => response.json())
            .then(data => {
                const msg = data.message
                if(msg === "Login successful!")
                    showAlert(msg,"SUCCESS");
                else 
                    showAlert(msg,"ERROR");
            })
            .catch(err => {
                console.error(err);
                showAlert('Error logging in!',"ERROR");
            });
    });

    // Handle Signup form submission
    document.querySelector('.signup-box .clkbtn').addEventListener('click', function () {
        const name = document.querySelector('.signup-box .name').value;
        const email = document.querySelector('.signup-box .email').value;
        const password = document.querySelector('.signup-box .password').value;
        const confirmPassword = document.querySelector('.signup-box .confirm-password')?.value; // Using optional chaining
        const phoneNo = document.querySelector('.signup-box .phone-no').value;
        const date = document.querySelector('.signup-box .date').value;
        if (!validateEmail(email)) {
            showAlert("Please enter a valid email address.","ERROR");
            return;
        }
        if (!validateString(name)) {
            showAlert("Please enter valid alphabets with less than 20 charcters","ERROR");
            return;
        }
        if (!validatePhone(phoneNo)) {
            showAlert("Please enter a valid 10 digit phoneNo.","ERROR");
            return;
        }
        if (!validateDate(date)) {
            showAlert("Date should be greater than current date","ERROR");
            return;
        }

        // Check if the confirmPassword field exists and if passwords match
        if ((!password || !confirmPassword) || password !== confirmPassword) {
            showAlert("Passwords do not match!","ERROR");
            return; // Exit the function if passwords don't match
        }

        fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, confirmPassword, phoneNo, date }),
        })
            .then(response => response.json())
            .then(data => {
                const msg = data.message
                if(msg === "Signup successful!")
                    showAlert(msg,"SUCCESS");
                else 
                    showAlert(msg,"ERROR");
            })
            .catch(err => {
                showAlert(err.message,"ERROR");
            });
    });

    var login = document.getElementById("login");
    var signup = document.getElementById("signup");
    var slider = document.getElementsByClassName("slider")[0];
    var loginActive = true;

    login.addEventListener('click', () => {
        slider.classList.add("slide-left");
        setTimeout(() => {
            slider.classList.remove("slide-right")
        }, 100)
    })

    signup.addEventListener('click', () => {
        slider.classList.add("slide-right")
        setTimeout(() => {
            slider.classList.remove("slide-left")
        }, 100)
    })

});
