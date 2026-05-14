<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

try {
    // Fetch ALL hospitals regardless of status
    $stmt = $pdo->query("SELECT id, hosp_name, email, reg_number, location, approval_status, created_at FROM hospitals ORDER BY created_at DESC");
    $hospitals = $stmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'data' => $hospitals
    ]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
