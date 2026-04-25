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
        $stmt = $pdo->prepare("SELECT * FROM epics WHERE user_id = ? ORDER BY start_quarter ASC, created_at DESC");
        $stmt->execute([$user_id]);
        echo json_encode(['success' => true, 'epics' => $stmt->fetchAll()]);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO epics (user_id, name, color, start_quarter, duration, description) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $user_id,
            $data['name'],
            $data['color'],
            $data['start_quarter'],
            $data['duration'],
            $data['description'] ?? ''
        ]);
        echo json_encode(['success' => true, 'message' => 'Epic created', 'id' => $pdo->lastInsertId()]);
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? 0;
        $stmt = $pdo->prepare("UPDATE epics SET name = ?, color = ?, start_quarter = ?, duration = ?, description = ? WHERE id = ? AND user_id = ?");
        $stmt->execute([
            $data['name'],
            $data['color'],
            $data['start_quarter'],
            $data['duration'],
            $data['description'] ?? '',
            $id,
            $user_id
        ]);
        echo json_encode(['success' => true, 'message' => 'Epic updated']);
        break;
        
    case 'DELETE':
        $id = $_GET['id'] ?? 0;
        $stmt = $pdo->prepare("DELETE FROM epics WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $user_id]);
        echo json_encode(['success' => true, 'message' => 'Epic deleted']);
        break;
}
?>