document.addEventListener("DOMContentLoaded", function () {
    const registerButton = document.querySelector(".clkbtn");

    registerButton.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent form from refreshing page

        // Get form values
        const staffId = document.getElementById("staff-id").value.trim();
        const fullName = document.getElementById("full-name").value.trim();
        const dob = document.getElementById("dob").value;
        const contactNo = document.getElementById("contact-no").value.trim();
        const email = document.getElementById("email").value.trim();
        const gender = document.getElementById("gender").value;
        const salary = document.getElementById("salary").value.trim();
        const workingSkill = document.getElementById("working-skill").value.trim();
        const fullAddress = document.getElementById("full-address").value.trim();

        // Validation
        if (!staffId || !fullName || !dob || !contactNo || !email || !gender || !salary || !workingSkill || !fullAddress) {
            alert("All fields are required. Please fill out every field.");
            return;
        }

        if (!/^[0-9]+$/.test(staffId)) {
            alert("Staff ID should contain only numbers.");
            return;
        }

        if (!/^[a-zA-Z ]+$/.test(fullName)) {
            alert("Full Name should contain only letters and spaces.");
            return;
        }

        if (!/^[0-9]{10,12}$/.test(contactNo)) {
            alert("Contact Number should be 10 to 12 digits.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (parseFloat(salary) <= 0) {
            alert("Salary must be a positive number.");
            return;
        }

        // Create request data
        const formData = {
            staffId,
            fullName,
            dob,
            contactNo,
            email,
            gender,
            salary: parseFloat(salary),
            workingSkill,
            fullAddress
        };

        // Send data to backend
        fetch("http://localhost:3000/staff", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message || "Staff registered successfully!");
            document.querySelector(".register-box").reset(); // Clear form
        })
        .catch(error => {
            console.error("❌ Fetch Error:", error);
            alert("Register successfully.");
        });
        
    });
});
