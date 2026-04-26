<?php
header('Content-Type: application/json');
require_once '../config/database.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get all posts with user info and like counts
        $stmt = $pdo->prepare("
            SELECT p.*, u.full_name, u.avatar_color, u.role,
                   (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count,
                   (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND user_id = ?) as user_liked
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        ");
        $stmt->execute([$user_id]);
        $posts = $stmt->fetchAll();
        
        // Convert is_announcement to boolean
        foreach ($posts as &$post) {
            $post['is_announcement'] = (bool)$post['is_announcement'];
        }
        
        echo json_encode(['success' => true, 'posts' => $posts]);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO posts (user_id, content, is_announcement, announcement_title) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $user_id,
            $data['content'],
            $data['is_announcement'] ?? false,
            $data['announcement_title'] ?? null
        ]);
        echo json_encode(['success' => true, 'message' => 'Post created', 'id' => $pdo->lastInsertId()]);
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $post_id = $data['post_id'] ?? 0;
        $action = $data['action'] ?? 'like';
        
        if ($action === 'like') {
            $stmt = $pdo->prepare("INSERT IGNORE INTO post_likes (post_id, user_id) VALUES (?, ?)");
            $stmt->execute([$post_id, $user_id]);
        } else {
            $stmt = $pdo->prepare("DELETE FROM post_likes WHERE post_id = ? AND user_id = ?");
            $stmt->execute([$post_id, $user_id]);
        }
        
        // Update likes count in posts table
        $stmt = $pdo->prepare("UPDATE posts SET likes = (SELECT COUNT(*) FROM post_likes WHERE post_id = ?) WHERE id = ?");
        $stmt->execute([$post_id, $post_id]);
        
        echo json_encode(['success' => true, 'message' => 'Updated']);
        break;
        
    case 'DELETE':
        $id = $_GET['id'] ?? 0;
        
        // Check if user owns the post or is admin
        $stmt = $pdo->prepare("SELECT user_id FROM posts WHERE id = ?");
        $stmt->execute([$id]);
        $post = $stmt->fetch();
        
        if ($post && ($post['user_id'] == $user_id || $_SESSION['role'] === 'admin')) {
            $stmt = $pdo->prepare("DELETE FROM posts WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Post deleted']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        }
        break;
}
?>