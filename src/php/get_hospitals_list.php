<?php

require_once 'db_connect.php';
header('Content-Type: application/json');
try {
    // Unified query: Fetch approved hospitals from registered_hospitals
    // Note: registered_hospitals uses 'about_desc' instead of 'description'
    $stmt = $pdo->query("
        SELECT h.id, h.hosp_name, h.location, h.about_desc as description, h.specialties, h.hospital_type, h.avatar, h.phone,
               COALESCE(AVG(r.rating), 0) as avg_rating, 
               COUNT(DISTINCT r.id) as review_count 
        FROM registered_hospitals h 
        LEFT JOIN hospital_reviews r ON h.id = r.hospital_id 
        WHERE h.approval_status = 'approved' AND h.is_verified = 1
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
