<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

require_once '../config/database.php';

error_log("login.php was called");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$login = trim($_POST['login'] ?? '');
$password = $_POST['password'] ?? '';

error_log("Login attempt - Login: $login");

if (empty($login) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

try {
    // Check if login is email or username
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? OR username = ?");
    $stmt->execute([$login, $login]);
    $user = $stmt->fetch();

    if (!$user) {
        error_log("User not found: $login");
        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
        exit;
    }

    if (!password_verify($password, $user['password_hash'])) {
        error_log("Invalid password for user: $login");
        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
        exit;
    }

    // Update user status
    $stmt = $pdo->prepare("UPDATE users SET status = 'online' WHERE id = ?");
    $stmt->execute([$user['id']]);

    // Set session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['full_name'] = $user['full_name'];
    $_SESSION['email'] = $user['email'];

    error_log("User logged in successfully: " . $user['username']);
    echo json_encode(['success' => true, 'message' => 'Login successful! Redirecting...']);

} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>