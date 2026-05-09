<?php

/**
 * PCOS CARE HUB — Get Pending Hospital Applications
 * Returns all hospitals with approval_status = 'pending', including their uploaded documents.
 */

require_once '../db_connect.php';
header('Content-Type: application/json');

try {
    // Fetch pending hospitals
    $stmt = $pdo->query(
        "SELECT id, hosp_name, email, reg_number, location, contact_person,
                phone, hospital_type, specialties, address, created_at
         FROM hospitals
         WHERE approval_status = 'pending'
         ORDER BY created_at DESC"
    );
    $hospitals = $stmt->fetchAll();

    // Attach documents for each hospital
    $docStmt = $pdo->prepare(
        "SELECT file_name, file_path, file_size, file_type
         FROM hospital_documents
         WHERE hospital_id = ?
         ORDER BY uploaded_at ASC"
    );

    foreach ($hospitals as &$hosp) {
        $docStmt->execute([$hosp['id']]);
        $hosp['documents'] = $docStmt->fetchAll();
    }
    unset($hosp);

    echo json_encode([
        'status' => 'success',
        'count'  => count($hospitals),
        'data'   => $hospitals
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Failed to load applications: ' . $e->getMessage()
    ]);
}
