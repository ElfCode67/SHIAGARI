<?php
header('Content-Type: application/json');
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request']);
    exit;
}

$username = trim($_POST['username'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$full_name = trim($_POST['full_name'] ?? '');
$confirm_password = $_POST['confirm_password'] ?? '';

// Validation
if (empty($username) || strlen($username) < 3) {
    echo json_encode(['success' => false, 'message' => 'Username must be at least 3 characters']);
    exit;
}
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Valid email required']);
    exit;
}
if (empty($password) || strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
    exit;
}
if ($password !== $confirm_password) {
    echo json_encode(['success' => false, 'message' => 'Passwords do not match']);
    exit;
}

// Check if user exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
$stmt->execute([$username, $email]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Username or email already exists']);
    exit;
}

// Create user
$password_hash = password_hash($password, PASSWORD_DEFAULT);
$avatar_color = sprintf('#%06X', mt_rand(0, 0xFFFFFF));

$stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash, full_name, avatar_color, status) VALUES (?, ?, ?, ?, ?, 'online')");
$stmt->execute([$username, $email, $password_hash, $full_name, $avatar_color]);

$user_id = $pdo->lastInsertId();

// Auto login
$_SESSION['user_id'] = $user_id;
$_SESSION['username'] = $username;
$_SESSION['full_name'] = $full_name;
$_SESSION['logged_in'] = true;

echo json_encode(['success' => true, 'message' => 'Registration successful!']);
?>