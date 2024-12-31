document.addEventListener('DOMContentLoaded', function () {
    const loginBtn = document.querySelector('.login');
    const signupBtn = document.querySelector('.signup');
    const loginBox = document.querySelector('.login-box');
    const signupBox = document.querySelector('.signup-box');

    // Switch to Login form
    loginBtn.addEventListener('click', function () {
        loginBox.style.display = 'block';
        signupBox.style.display = 'none';
    });

    // Switch to Signup form
    signupBtn.addEventListener('click', function () {
        signupBox.style.display = 'block';
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
                window.location.href = '/Users/SURESH/my-project/dashboard.html'; // Redirect after successful login
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
    
    // Handle Signup form submission
    document.querySelector('.signup-box .clkbtn').addEventListener('click', function () {
        const name = document.querySelector('.signup-box .name').value;
        const email = document.querySelector('.signup-box .email').value;
        const password = document.querySelector('.signup-box .password').value;
        const confirmPassword = document.querySelector('.signup-box .confirm-password')?.value; // Using optional chaining
        if (!validateEmail(email)) {
            alert("Please enter a valid email address.");
            return;
        }  
        if (!validateString(name)) {
            alert("Please enter a valid name.");
            return;
        }  
        console.log("Password:", password);  // Debugging password value
        console.log("Confirm Password:", confirmPassword); // Debugging confirmPassword value

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
            body: JSON.stringify({ name, email, password,confirmPassword}),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.message === 'Signup successful!') {
                window.location.href = '/Users/SURESH/my-project/login_index.html'; // Redirect to login page after successful signup
            }
        })
        .catch(err => {
            console.error(err);
            alert('Error signing up!');
        });
    });
});
