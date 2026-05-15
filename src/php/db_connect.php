<?php

// ============================================================
// PCOS CARE HUB — Database Connection (db_connect.php)
// ============================================================

// If we are in a test environment, skip the real connection
// The $pdo object will be provided by the test bootstrap.
if (defined('TEST_ENVIRONMENT') && TEST_ENVIRONMENT === true) {
    return;
}

$host = 'localhost';
$db   = 'pcos_hub';
$user = 'root';
$pass = '';
// Default XAMPP password is empty
$charset = 'utf8mb4';
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    \PDO::ATTR_ERRMODE            => \PDO::ERRMODE_EXCEPTION,
    \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
    \PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new \PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // For development, we'll output the error
    if (!headers_sent()) {
        header('Content-Type: application/json');
    }
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}
