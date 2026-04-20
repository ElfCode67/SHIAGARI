<?php
header('Content-Type: application/json');
require_once '../config/database.php');

if (isset($_SESSION['user_id']) && isset($_SESSION['logged_in'])) {
    echo json_encode(['logged_in' => true, 'user' => [
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'full_name' => $_SESSION['full_name'],
        'role' => $_SESSION['role'],
        'avatar_color' => $_SESSION['avatar_color']
    ]]);
} else {
    echo json_encode(['logged_in' => false]);
}
?>