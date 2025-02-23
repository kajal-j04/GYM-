document.addEventListener("DOMContentLoaded", function () {
    // Get elements
    const scheduleBtn = document.getElementById("schedule");
    const submitBtn = document.querySelector(".clkbtn");
    const formSection = document.querySelector(".form-section");

    // Show the form when the "Schedule" button is clicked
    scheduleBtn.addEventListener("click", function () {
        formSection.style.display = "block"; // Show the form
    });

    // Form submission handling
    submitBtn.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent form submission to handle validation manually

        // Get input values
        const classId = document.getElementById("class_id").value;
        const className = document.getElementById("class_name").value;
        const trainerId = document.getElementById("trainer_id").value;
        const schedule = document.getElementById("schedule").value;
        const maxCapacity = document.getElementById("max_capacity").value;

        // Validate class ID (must be a number)
        if (!classId || isNaN(classId) || classId <= 0) {
            alert("Please enter a valid Class ID.");
            return;
        }

        // Validate class name (cannot be empty)
        if (!className) {
            alert("Class Name is required.");
            return;
        }

        // Validate trainer ID (must be a number)
        if (!trainerId || isNaN(trainerId) || trainerId <= 0) {
            alert("Please enter a valid Trainer ID.");
            return;
        }

        // Validate schedule (cannot be empty)
        if (!schedule) {
            alert("Please enter a valid schedule (Date and Time).");
            return;
        }

        // Validate max capacity (must be a positive number)
        if (!maxCapacity || isNaN(maxCapacity) || maxCapacity <= 0) {
            alert("Please enter a valid Max Capacity.");
            return;
        }

        // Create an object to represent the schedule data
        const scheduleData = {
            classId: classId,
            className: className,
            trainerId: trainerId,
            schedule: schedule,
            maxCapacity: maxCapacity
        };

        // Log the data to the console (or you can send this to a server)
        console.log("Schedule Data Submitted: ", scheduleData);

        // Optionally, reset the form after successful submission
        document.querySelector(".Schedule-box").reset();

        // Show success message
        alert("Schedule successfully created!");

        // Hide the form after submission
        formSection.style.display = "none";
    });
});
