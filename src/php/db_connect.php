<?php
// ============================================================
// PCOS CARE HUB — Database Connection (db_connect.php)
// ============================================================

$host = 'localhost';
$db   = 'pcos_hub';
$user = 'root';
$pass = ''; // Default XAMPP password is empty
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     // For production, you should log the error and show a generic message
     // For development, we'll output the error
     header('Content-Type: application/json');
     echo json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $e->getMessage()]);
     exit;
}
?>
