<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

require_once '../config/database.php';

// Log that register.php was called
error_log("register.php was called");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get and log POST data
$full_name = trim($_POST['full_name'] ?? '');
$username = trim($_POST['username'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$confirm_password = $_POST['confirm_password'] ?? '';

error_log("Registration attempt - Username: $username, Email: $email");

// Validation
$errors = [];

if (empty($full_name)) {
    $errors[] = 'Full name is required';
}
if (strlen($username) < 3) {
    $errors[] = 'Username must be at least 3 characters';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Valid email is required';
}
if (strlen($password) < 6) {
    $errors[] = 'Password must be at least 6 characters';
}
if ($password !== $confirm_password) {
    $errors[] = 'Passwords do not match';
}

if (!empty($errors)) {
    echo json_encode(['success' => false, 'message' => $errors[0]]);
    exit;
}

try {
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$username, $email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Username or email already exists']);
        exit;
    }

    // Create user
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("
        INSERT INTO users (username, email, password_hash, full_name, status) 
        VALUES (?, ?, ?, ?, 'online')
    ");
    $stmt->execute([$username, $email, $password_hash, $full_name]);

    // Auto-login after registration
    $userId = $pdo->lastInsertId();
    $_SESSION['user_id'] = $userId;
    $_SESSION['username'] = $username;
    $_SESSION['full_name'] = $full_name;

    error_log("User registered successfully - ID: $userId");
    echo json_encode(['success' => true, 'message' => 'Account created successfully! Redirecting...']);

} catch (PDOException $e) {
    error_log("Registration error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>