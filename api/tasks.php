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
        $project_id = $_GET['project_id'] ?? 'project1';
        $stmt = $pdo->prepare("SELECT * FROM tasks WHERE user_id = ? AND project_id = ? ORDER BY created_at DESC");
        $stmt->execute([$user_id, $project_id]);
        echo json_encode(['success' => true, 'tasks' => $stmt->fetchAll()]);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO tasks (user_id, project_id, name, category, status, progress) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $user_id,
            $data['project_id'],
            $data['name'],
            $data['category'],
            $data['status'],
            $data['progress'] ?? 0
        ]);
        echo json_encode(['success' => true, 'message' => 'Task created', 'id' => $pdo->lastInsertId()]);
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? 0;
        
        if (isset($data['status'])) {
            $stmt = $pdo->prepare("UPDATE tasks SET status = ?, progress = ? WHERE id = ? AND user_id = ?");
            $progress = $data['status'] === 'finished' ? 100 : ($data['progress'] ?? 0);
            $stmt->execute([$data['status'], $progress, $id, $user_id]);
        } elseif (isset($data['progress'])) {
            $newProgress = $data['progress'];
            $newStatus = $newProgress >= 100 ? 'finished' : ($newProgress > 0 ? 'inprogress' : 'notstarted');
            $stmt = $pdo->prepare("UPDATE tasks SET progress = ?, status = ? WHERE id = ? AND user_id = ?");
            $stmt->execute([$newProgress, $newStatus, $id, $user_id]);
        }
        
        echo json_encode(['success' => true, 'message' => 'Task updated']);
        break;
        
    case 'DELETE':
        $id = $_GET['id'] ?? 0;
        $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $user_id]);
        echo json_encode(['success' => true, 'message' => 'Task deleted']);
        break;
}
?>