<?php
header('Content-Type: application/json');
require_once '../config/database.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? $_POST['action'] ?? null;

switch ($method) {
    case 'GET':
        if ($action === 'get_users') {
            // Get all users except current user
            $stmt = $pdo->prepare("SELECT id, username, full_name, avatar_color, status FROM users WHERE id != ? ORDER BY full_name ASC");
            $stmt->execute([$user_id]);
            echo json_encode(['success' => true, 'users' => $stmt->fetchAll()]);
        } elseif ($action === 'get_messages') {
            $other_user_id = $_GET['other_user_id'] ?? 0;
            
            // Get messages between current user and other user
            $stmt = $pdo->prepare("
                SELECT m.*, u.full_name as sender_name 
                FROM messages m
                JOIN users u ON m.from_user_id = u.id
                WHERE (from_user_id = ? AND to_user_id = ?) 
                   OR (from_user_id = ? AND to_user_id = ?)
                ORDER BY m.created_at ASC
            ");
            $stmt->execute([$user_id, $other_user_id, $other_user_id, $user_id]);
            echo json_encode(['success' => true, 'messages' => $stmt->fetchAll()]);
        }
        break;
        
    case 'POST':
        if ($action === 'send') {
            $data = json_decode(file_get_contents('php://input'), true);
            $to_user_id = $data['to_user_id'] ?? 0;
            $message = $data['message'] ?? '';
            
            if (empty($message)) {
                echo json_encode(['success' => false, 'message' => 'Message cannot be empty']);
                exit;
            }
            
            $stmt = $pdo->prepare("INSERT INTO messages (from_user_id, to_user_id, message, is_read) VALUES (?, ?, ?, 0)");
            $stmt->execute([$user_id, $to_user_id, $message]);
            
            echo json_encode(['success' => true, 'message' => 'Message sent']);
        }
        break;
        
    case 'PUT':
        if ($action === 'mark_read') {
            $data = json_decode(file_get_contents('php://input'), true);
            $other_user_id = $data['other_user_id'] ?? 0;
            
            // Mark messages from other user as read
            $stmt = $pdo->prepare("UPDATE messages SET is_read = 1 WHERE from_user_id = ? AND to_user_id = ? AND is_read = 0");
            $stmt->execute([$other_user_id, $user_id]);
            
            echo json_encode(['success' => true, 'message' => 'Messages marked as read']);
        }
        break;
}
?>