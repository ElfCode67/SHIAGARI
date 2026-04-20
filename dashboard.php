<?php
require_once 'config/database.php';

// Check if user is logged in
if (!isset($_SESSION['user_id']) || !isset($_SESSION['logged_in'])) {
    header('Location: index.php');
    exit;
}

// Update user status to online
$stmt = $pdo->prepare("UPDATE users SET status = 'online', last_active = NOW() WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SHIAGARI · Dashboard</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #0b1626;
            font-family: 'Inter', system-ui, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .loading-container {
            text-align: center;
        }
        .spinner {
            width: 50px;
            height: 50px;
            border: 3px solid #1e293b;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .loading-text {
            color: #94a3b8;
            font-size: 14px;
        }
        .user-info {
            margin-top: 20px;
            color: #e2e8f0;
            font-size: 12px;
        }
    </style>
    <meta http-equiv="refresh" content="2;url=landing/landing.html">
</head>
<body>
    <div class="loading-container">
        <div class="spinner"></div>
        <div class="loading-text">Welcome back, <?php echo htmlspecialchars($_SESSION['full_name']); ?>!</div>
        <div class="loading-text">Redirecting to SHIAGARI dashboard...</div>
        <div class="user-info">
            <i class="fas fa-user"></i> Logged in as @<?php echo htmlspecialchars($_SESSION['username']); ?>
        </div>
    </div>
</body>
</html>