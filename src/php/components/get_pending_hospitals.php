<?php

/**
 * PCOS CARE HUB — Get Pending Hospital Applications
 * Returns hospitals from registered_hospitals with approval_status = 'pending'.
 * (self-signup table — separate from the curated `hospitals` public directory)
 */

require_once '../db_connect.php';
session_start();
header('Content-Type: application/json');

// Security Check: Only admins can view pending applications
if (empty($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized access.']);
    exit;
}

try {
    // Fetch pending from registered_hospitals (self-signup)
    $stmt = $pdo->query(
        "SELECT id, hosp_name, email, reg_number, location,
                contact_fname, contact_lname, contact_person,
                phone, hospital_type, specialties, address, created_at
         FROM registered_hospitals
         WHERE approval_status = 'pending'
         ORDER BY created_at DESC"
    );
    $hospitals = $stmt->fetchAll();

    // Attach uploaded documents for each hospital
    $docStmt = $pdo->prepare(
        "SELECT file_name, file_path, file_size, file_type
         FROM hospital_documents
         WHERE hospital_id = ?
         ORDER BY uploaded_at ASC"
    );

    foreach ($hospitals as &$hosp) {
        $docStmt->execute([$hosp['id']]);
        $hosp['documents'] = $docStmt->fetchAll();
        // Normalise contact_person display
        if (empty($hosp['contact_person'])) {
            $hosp['contact_person'] = trim(($hosp['contact_fname'] ?? '') . ' ' . ($hosp['contact_lname'] ?? ''));
        }
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
