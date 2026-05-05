<?php
header('Content-Type: application/json');
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$full_name = trim($_POST['full_name'] ?? '');
$username = trim($_POST['username'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$confirm_password = $_POST['confirm_password'] ?? '';

// Validation
$errors = [];

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
if (empty($full_name)) {
    $errors[] = 'Full name is required';
}

if (!empty($errors)) {
    echo json_encode(['success' => false, 'message' => $errors[0]]);
    exit;
}

// Check if user exists
try {
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

    echo json_encode(['success' => true, 'message' => 'Account created successfully']);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>