function loadHtmlContent(pageUrl) {
    fetch(pageUrl)
        .then(response => response.text())
        .then(html => {
            document.getElementById('main-content').innerHTML = html;
        })
        .catch(error => console.error('Error loading the page:', error));
}

function loadDivContent(page) {

    // Show the selected content
    const contentDiv = document.getElementById(page);
    if (contentDiv) {
        document.getElementById('main-content').innerHTML = contentDiv.innerHTML;
        if (page == 'getTrainer') {
            fetchTrainers()
        }
    } else {
        console.warn("Content not found for page:", page);
    }
}

function previewImage(event) {
    const input = event.target;
    const preview = document.getElementById('profilePicPreview');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

async function fetchTrainers() {
    try {
        const response = await fetch('http://localhost:3000/trainer'); // Replace with actual API endpoint
        const trainers = await response.json();
        const tableBody = document.getElementById('trainerTableBody');
        tableBody.innerHTML = '';
        trainers.forEach(trainer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                    <td class="mdl-data-table__cell--non-numeric"><img src="${trainer.profilePic}" width="50" height="50" style="border-radius: 50%;"></td>
                    <td class="mdl-data-table__cell--non-numeric">${trainer.name}</td>
                    <td>${trainer.mobile}</td>
                    <td>${trainer.experience}</td>
                    <td>${trainer.shift}</td>
                `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching trainer data:', error);
    }
}

async function fetchTrainerCount() {
    try {
        const response = await fetch('http://localhost:3000/trainer'); 
        const trainers = await response.json();
        const tableBody = document.getElementById('trainerCount').textContent = trainers.length;
    } catch (error) {
        console.error('Error fetching trainer data:', error);
    }
}
async function fetchPackageCount() {
    try {
        const response = await fetch('http://localhost:3000/package'); // Replace with actual API endpoint
        const package = await response.json();
        const tableBody = document.getElementById('packageCount').textContent = trainers.length;
    } catch (error) {
        console.error('Error fetching trainer data:', error);
    }
}
async function fetchMemberCount() {
    try {
        const response = await fetch('http://localhost:3000/member'); // Replace with actual API endpoint
        const trainers = await response.json();
        const tableBody = document.getElementById('memberCount').textContent = trainers.length;
    } catch (error) {
        console.error('Error fetching trainer data:', error);
    }
}
async function fetchEquipmentCount() {
    try {
        const response = await fetch('http://localhost:3000/equipment'); // Replace with actual API endpoint
        const trainers = await response.json();
        const tableBody = document.getElementById('equipmentCount').textContent = trainers.length;
    } catch (error) {
        console.error('Error fetching trainer data:', error);
    }
}

async function addTrainer() {
    event.preventDefault()
    const name = document.getElementById('name').value;
    const mobile = document.getElementById('mobile').value;
    const experience = document.getElementById('experience').value;
    const shift = document.getElementById('shift').value;
    const profilePic = document.getElementById('profilePicPreview').src;

    if (!name || !mobile || !experience || !shift || profilePic === '') {
        alert('Please fill all fields and upload an image.');
        return;
    }

    const trainerData = { name, mobile, experience, shift, profilePic };

    try {
        await fetch('http://localhost:3000/trainer', { // Replace with actual API endpoint
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trainerData)
        }).then(res => {
            if (res.status == 200) {
                alert("Added successfully")
                loadContent('trainer')
            } else {
                alert("Error occured while adding trainer")
            }
        });
    } catch (error) {
        console.error('Error saving trainer data:', error);
    }

    document.getElementById('trainerForm').reset();
    document.getElementById('profilePicPreview').style.display = 'none';
}

function adminDashboard(){
    // Toggle Sidebar in Mobile View
    document.querySelector(".menu-toggle").addEventListener("click", function () {
        document.querySelector(".sidebar").classList.toggle("show");
    });

    // Logout Functionality
    document.querySelector('.logout').addEventListener('click', function (event) {
        event.preventDefault();

        let confirmLogout = confirm("Are you sure you want to log out?");

        if (confirmLogout) {
            sessionStorage.clear();
            localStorage.clear();
            window.location.href = "dashboard.html"; // Redirect to login page
        }
    });

    // Bar Chart (Attendance)
    const barCtx = document.getElementById('barChart').getContext('2d');
    new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            datasets: [{
                label: 'Attendance',
                data: [10, 15, 12, 18, 20, 17],
                backgroundColor: ['blue', 'green', 'blue', 'green', 'blue', 'green'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Pie Chart (Total Reports)
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: ['Member', 'Trainer', 'Equipment', 'Package'],
            datasets: [{
                data: [2, 3, 2, 1],
                backgroundColor: ['red', 'blue', 'yellow', 'purple']
            }]
        }
    });
}