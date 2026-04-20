<?php
header('Content-Type: application/json');
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$username = trim($_POST['username'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$full_name = trim($_POST['full_name'] ?? '');
$confirm_password = $_POST['confirm_password'] ?? '';

// Validation
$errors = [];

if (empty($username)) {
    $errors[] = 'Username is required';
} elseif (strlen($username) < 3) {
    $errors[] = 'Username must be at least 3 characters';
}

if (empty($email)) {
    $errors[] = 'Email is required';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Invalid email format';
}

if (empty($password)) {
    $errors[] = 'Password is required';
} elseif (strlen($password) < 6) {
    $errors[] = 'Password must be at least 6 characters';
}

if ($password !== $confirm_password) {
    $errors[] = 'Passwords do not match';
}

if (empty($full_name)) {
    $errors[] = 'Full name is required';
}

if (!empty($errors)) {
    echo json_encode(['success' => false, 'message' => $errors[0], 'errors' => $errors]);
    exit;
}

// Check if username or email already exists
try {
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
    
    // Auto login after registration
    $_SESSION['user_id'] = $user_id;
    $_SESSION['username'] = $username;
    $_SESSION['full_name'] = $full_name;
    $_SESSION['avatar_color'] = $avatar_color;
    
    echo json_encode(['success' => true, 'message' => 'Registration successful! Redirecting...']);
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>