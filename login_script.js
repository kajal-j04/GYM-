
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
document.addEventListener('DOMContentLoaded', function () {
    const loginBtn = document.querySelector('.login');
    const signupBtn = document.querySelector('.signup');
    const loginBox = document.querySelector('.login-box');
    const signupBox = document.querySelector('.signup-box');

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
            alert(data.message);
            if (data.message === 'Login successful!') {
                window.location.href = './dashboard.html'; // Redirect after successful login
            }
        })
        .catch(err => {
            console.error(err);
            alert('Error logging in!');
        });
    });
    function validateEmail(email) {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return emailPattern.test(email);
    }
    function validateString(str) {
        const pattern = /^[A-Za-z]+(\s[A-Za-z]+)*$/; // Only alphabets, spaces allowed between words
        return pattern.test(str);
    }
    function validatePhone(str) {
        if(str.length<10){
            return false;
        }
        return true;
    }
    
    // Handle Signup form submission
    document.querySelector('.signup-box .clkbtn').addEventListener('click', function () {
        const name = document.querySelector('.signup-box .name').value;
        const email = document.querySelector('.signup-box .email').value;
        const password = document.querySelector('.signup-box .password').value;
        const confirmPassword = document.querySelector('.signup-box .confirm-password')?.value; // Using optional chaining
        const phoneNo = document.querySelector('.signup-box .phone-no').value;
        if (!validateEmail(email)) {
            alert("Please enter a valid email address.");
            return;
        }  
        if (!validateString(name)) {
            alert("Please enter a valid name.");
            return;
        }  
        if (!validatePhone(phoneNo)) {
            alert("Please enter a valid 10 digit phoneNo.");
            return;
        }  

        // Check if the confirmPassword field exists and if passwords match
        if ( password !== confirmPassword) {
            alert("Passwords do not match!");
            return; // Exit the function if passwords don't match
        }

        fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password,confirmPassword, phoneNo}),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.message === 'Signup successful!') {
                window.location.href = './login_index.html'; // Redirect to login page after successful signup
            }
        })
        .catch(err => {
            console.error(err);
            alert('Error signing up!');
        });
    });

    var login = document.getElementById("login");
    var signup = document.getElementById("signup");
    var slider = document.getElementsByClassName("slider")[0];
    var loginActive = true;

    login.addEventListener('click',()=>{
        slider.classList.add("slide-left");
        setTimeout(()=>{
            slider.classList.remove("slide-right")
        },100)
    })

    signup.addEventListener('click',()=>{
        slider.classList.add("slide-right")
        setTimeout(()=>{
            slider.classList.remove("slide-left")
        },100)
    })

});
