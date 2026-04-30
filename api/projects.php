<?php
header('Content-Type: application/json');
require_once '../config/database.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

// Helper function to sanitize input
function sanitize($input) {
    // Remove leading/trailing whitespace
    $input = trim($input);
    // Convert special characters to HTML entities
    $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
    // Remove any remaining potential XSS vectors
    $input = strip_tags($input);
    return $input;
}

// Helper function to validate status
function validateStatus($status) {
    $allowed = ['active', 'planning', 'hold'];
    return in_array($status, $allowed) ? $status : 'active';
}

switch ($method) {
    case 'GET':
        $stmt = $pdo->prepare("SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$user_id]);
        $projects = $stmt->fetchAll();
        
        foreach ($projects as &$project) {
            $project['name'] = htmlspecialchars($project['name'], ENT_QUOTES, 'UTF-8');
            $project['description'] = htmlspecialchars($project['description'] ?? '', ENT_QUOTES, 'UTF-8');
        }
        
        echo json_encode(['success' => true, 'projects' => $projects]);
        break;
        
    case 'POST':
        $raw_data = file_get_contents('php://input');
        $data = json_decode($raw_data, true);
        
        $name = isset($data['name']) ? sanitize($data['name']) : '';
        $description = isset($data['description']) ? sanitize($data['description']) : '';
        $status = isset($data['status']) ? validateStatus($data['status']) : 'active';
        
        if (empty($name)) {
            echo json_encode(['success' => false, 'message' => 'Project name is required']);
            exit;
        }
        
        if (strlen($name) > 100) {
            echo json_encode(['success' => false, 'message' => 'Project name cannot exceed 100 characters']);
            exit;
        }
        
        if (strlen($description) > 1000) {
            echo json_encode(['success' => false, 'message' => 'Description cannot exceed 1000 characters']);
            exit;
        }
        
        $stmt = $pdo->prepare("INSERT INTO projects (user_id, name, description, status) VALUES (?, ?, ?, ?)");
        $stmt->execute([$user_id, $name, $description, $status]);
        
        echo json_encode([
            'success' => true, 
            'message' => 'Project created',
            'id' => $pdo->lastInsertId()
        ]);
        break;
        
    case 'PUT':
        $raw_data = file_get_contents('php://input');
        $data = json_decode($raw_data, true);
        
        $id = isset($data['id']) ? filter_var($data['id'], FILTER_VALIDATE_INT) : 0;
        $name = isset($data['name']) ? sanitize($data['name']) : '';
        $description = isset($data['description']) ? sanitize($data['description']) : '';
        $status = isset($data['status']) ? validateStatus($data['status']) : 'active';
        
        if ($id <= 0) {
            echo json_encode(['success' => false, 'message' => 'Invalid project ID']);
            exit;
        }
        
        if (empty($name)) {
            echo json_encode(['success' => false, 'message' => 'Project name is required']);
            exit;
        }
        
        $check = $pdo->prepare("SELECT id FROM projects WHERE id = ? AND user_id = ?");
        $check->execute([$id, $user_id]);
        if (!$check->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Project not found or unauthorized']);
            exit;
        }
        
        $stmt = $pdo->prepare("UPDATE projects SET name = ?, description = ?, status = ? WHERE id = ? AND user_id = ?");
        $stmt->execute([$name, $description, $status, $id, $user_id]);
        
        echo json_encode(['success' => true, 'message' => 'Project updated']);
        break;
        
    case 'DELETE':
        $id = isset($_GET['id']) ? filter_var($_GET['id'], FILTER_VALIDATE_INT) : 0;
        
        if ($id <= 0) {
            echo json_encode(['success' => false, 'message' => 'Invalid project ID']);
            exit;
        }
        
        $check = $pdo->prepare("SELECT id FROM projects WHERE id = ? AND user_id = ?");
        $check->execute([$id, $user_id]);
        if (!$check->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Project not found or unauthorized']);
            exit;
        }
        
        $stmt = $pdo->prepare("DELETE FROM projects WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $user_id]);
        
        echo json_encode(['success' => true, 'message' => 'Project deleted']);
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
        break;
}
?>