<?php
// Database configuration
$host = 'localhost';
$dbname = 'shiagari_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Generate CSRF token if not exists and user is logged in
if (isset($_SESSION['user_id']) && empty($_SESSION['api_csrf_token'])) {
    $_SESSION['api_csrf_token'] = bin2hex(random_bytes(32));
}
?>