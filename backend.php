<?php
// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "gym_database";

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Handle the POST request
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $action = $_POST['action'];

    if ($action == 'login') {
        $email = $_POST['email'];
        $password = $_POST['password'];

        // Query to verify login credentials
        $sql = "SELECT * FROM users WHERE email = ? AND password = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $email, $password);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            echo json_encode(['status' => 'success', 'message' => 'Login successful!']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid email or password.']);
        }
    } elseif ($action == 'signup') {
        $name = $_POST['name'];
        $email = $_POST['email'];
        $password = $_POST['password'];
        $confirm_password = $_POST['confirm_password'];

        // Check if passwords match
        if ($password != $confirm_password) {
            echo json_encode(['status' => 'error', 'message' => 'Passwords do not match.']);
            exit;
        }

        // Check if the email already exists
        $sql = "SELECT * FROM users WHERE email = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            echo json_encode(['status' => 'error', 'message' => 'Email already registered.']);
        } else {
            // Insert the new user into the database
            $sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("sss", $name, $email, $password);

            if ($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Signup successful!']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Signup failed. Please try again.']);
            }
        }
    }
}

$conn->close();
?>
