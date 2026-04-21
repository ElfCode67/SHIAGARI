<?php
require_once 'config/database.php';

if (!isset($_SESSION['user_id']) || !isset($_SESSION['logged_in'])) {
    header('Location: index.php');
    exit;
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Loading SHIAGARI...</title>
    <meta http-equiv="refresh" content="1;url=landing/landing.html">
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #0b1626;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            font-family: 'Inter', sans-serif;
        }
        .loader {
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
        @keyframes spin { to { transform: rotate(360deg); } }
        .text { color: #94a3b8; font-size: 14px; }
    </style>
</head>
<body>
    <div class="loader">
        <div class="spinner"></div>
        <div class="text">Welcome back, <?php echo htmlspecialchars($_SESSION['full_name'] ?? 'User'); ?>!</div>
        <div class="text">Loading SHIAGARI...</div>
    </div>
</body>
</html>