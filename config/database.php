<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// PostgreSQL Database configuration
$host = 'localhost';
$port = '5432';
$dbname = 'shiagari_db';
$user = 'postgres';
$password = 'postgres'; // CHANGE THIS to your actual PostgreSQL password

try {
    $pdo = new PDO(
        "pgsql:host=$host;port=$port;dbname=$dbname",
        $user,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
    
    // Test connection
    $stmt = $pdo->query("SELECT 1 as test");
    error_log("PostgreSQL connected successfully");
    
} catch (PDOException $e) {
    error_log("PostgreSQL Connection failed: " . $e->getMessage());
    die(json_encode([
        'success' => false, 
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]));
}

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>