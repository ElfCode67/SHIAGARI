<?php
require_once '../config/database.php';

// Update user status to offline before logout
if (isset($_SESSION['user_id'])) {
    $stmt = $pdo->prepare("UPDATE users SET status = 'offline' WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
}

// Destroy session
$_SESSION = array();
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time()-3600, '/');
}
session_destroy();

// Redirect to login page
header('Location: ../index.php');
exit;
?>