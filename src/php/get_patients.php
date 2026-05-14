<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT id, full_name, email, created_at, status FROM patients ORDER BY created_at DESC");
    $patients = $stmt->fetchAll();
    
    echo json_encode([
        'status' => 'success',
        'data' => $patients
    ]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
