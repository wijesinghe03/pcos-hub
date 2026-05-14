<?php

/**
 * PCOS CARE HUB — Get Hospital Session Data (get_hospital_session.php)
 * Returns the current logged-in hospital's profile from registered_hospitals.
 * Used by hospital-dashboard.html and other hospital pages to populate UI.
 */

require_once __DIR__ . '/../../src/php/db_connect.php';
session_start();
header('Content-Type: application/json');

// Check session
if (empty($_SESSION['hospital_id'])) {
    echo json_encode(['status' => 'unauthenticated', 'message' => 'No hospital session found.']);
    exit;
}

$hospitalId = (int)$_SESSION['hospital_id'];

try {
    $stmt = $pdo->prepare("
        SELECT id, hosp_name, username, email, phone, address, location,
               contact_fname, contact_lname, contact_person,
               hospital_type, specialties, reg_number,
               approval_status, is_verified, avatar, status, created_at
        FROM registered_hospitals
        WHERE id = ?
        LIMIT 1
    ");
    $stmt->execute([$hospitalId]);
    $hospital = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$hospital) {
        echo json_encode(['status' => 'error', 'message' => 'Hospital record not found.']);
        exit;
    }

    echo json_encode([
        'status'   => 'success',
        'hospital' => $hospital
    ]);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
