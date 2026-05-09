<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

try {
    $stmt = $pdo->query("
        SELECT h.*, 
               COALESCE(AVG(r.rating), 0) as avg_rating, 
               COUNT(r.id) as review_count 
        FROM hospitals h 
        LEFT JOIN hospital_reviews r ON h.id = r.hospital_id 
        WHERE h.approval_status = 'approved'
        GROUP BY h.id
        ORDER BY h.hosp_name ASC
    ");
    $hospitals = $stmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'data' => $hospitals
    ]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
