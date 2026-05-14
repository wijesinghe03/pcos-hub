<?php

session_start();
/**
 * PCOS CARE HUB — Get Hospitals Full (Admin Use)
 * Returns ALL hospitals from both tables:
 *   - hospitals          → curated public directory (manually added by admin)
 *   - registered_hospitals → self-signup via form (OTP verified, may be pending/approved/rejected)
 */

require_once 'db_connect.php';
header('Content-Type: application/json');
require_once 'utils/AuthHelper.php';
\App\Utils\AuthHelper::requireAdmin();
try {
// 1. Public directory hospitals (admin-curated)
    $stmtPublic = $pdo->query("SELECT id, hosp_name, email, reg_number, location, phone, address,
                contact_person, hospital_type, specialties,
                approval_status, is_verified, created_at,
                'directory' AS source
         FROM hospitals
         ORDER BY created_at DESC");
    $publicHospitals = $stmtPublic->fetchAll(PDO::FETCH_ASSOC);
// 2. Self-registered hospitals (via signup form)
    $stmtReg = $pdo->query("SELECT id, hosp_name, email, reg_number, location, phone, address,
                contact_person, hospital_type, specialties,
                approval_status, is_verified, created_at,
                'registered' AS source
         FROM registered_hospitals
         WHERE approval_status != 'approved'
         ORDER BY created_at DESC");
    $registeredHospitals = $stmtReg->fetchAll(PDO::FETCH_ASSOC);
// 3. Combine into a single flat list
    $allHospitals = array_merge($publicHospitals, $registeredHospitals);
    echo json_encode([
        'status' => 'success',
        'count'  => count($allHospitals),
        'data'   => $allHospitals
    ]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
