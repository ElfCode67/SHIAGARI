<?php
require_once '../config/database.php';

if (isset($_SESSION['user_id'])) {
    $stmt = $pdo->prepare("UPDATE users SET status = 'offline' WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
}

$_SESSION = array();
session_destroy();
header('Location: ../index.php');
exit;
?>