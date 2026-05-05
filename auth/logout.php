<?php
header('Content-Type: application/json');
require_once '../config/database.php';

if (isset($_SESSION['user_id'])) {
    // Update status to offline
    $stmt = $pdo->prepare("UPDATE users SET status = 'offline' WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
}

// Destroy session
$_SESSION = [];
session_destroy();

echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
?>