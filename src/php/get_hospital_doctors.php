<?php

// ============================================================
// PCOS CARE HUB — Get Hospital Doctors (Public API)
// ============================================================

require_once __DIR__ . '/db_connect.php';
header('Content-Type: application/json');

$hospitalId = isset($_GET['hospital_id']) ? (int)$_GET['hospital_id'] : 0;

if (!$hospitalId) {
    echo json_encode(['status' => 'error', 'message' => 'Hospital ID is required.']);
    exit;
}

// Ensure table columns exist
try {
    $pdo->exec("ALTER TABLE hospital_doctors ADD COLUMN IF NOT EXISTS status ENUM('active','inactive') DEFAULT 'active'");
} catch (Exception $e) {
}


try {
    $stmt = $pdo->prepare("SELECT id, doctor_name, specialization, qualification, experience, avatar, consultation_fee, availability_json FROM hospital_doctors WHERE hospital_id = ? AND status = 'active' ORDER BY doctor_name ASC");
    $stmt->execute([$hospitalId]);
    $doctors = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'data' => $doctors]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
