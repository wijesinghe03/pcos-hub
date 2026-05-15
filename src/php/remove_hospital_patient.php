<?php

// ============================================================
// PCOS CARE HUB — Remove Patient from Hospital API
// Deletes associations between a patient and the logged-in hospital
// ============================================================

header('Content-Type: application/json');
require_once 'db_connect.php';
session_start();

$hospitalId = $_SESSION['hospital_id'] ?? null;
$patientId = $_POST['patient_id'] ?? null;

if (!$hospitalId) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized hospital session.']);
    exit;
}

if (!$patientId) {
    echo json_encode(['status' => 'error', 'message' => 'Patient ID is required.']);
    exit;
}

try {
    // Get hospital name to delete by name (as used in other scripts)
    $stmt = $pdo->prepare("SELECT hosp_name FROM registered_hospitals WHERE id = ? LIMIT 1");
    $stmt->execute([$hospitalId]);
    $hospital = $stmt->fetch();

    if (!$hospital) {
        echo json_encode(['status' => 'error', 'message' => 'Hospital not found.']);
        exit;
    }

    $hospitalName = $hospital['hosp_name'];

    $pdo->beginTransaction();

    // Remove appointments
    $stmt = $pdo->prepare("DELETE FROM patient_appointments WHERE patient_id = ? AND (hospital_name = ? OR hospital_name = 'Selected Hospital')");
    $stmt->execute([$patientId, $hospitalName]);

    // Remove reports
    $stmt = $pdo->prepare("DELETE FROM patient_reports WHERE patient_id = ? AND (hospital_name = ? OR hospital_name = 'Selected Hospital')");
    $stmt->execute([$patientId, $hospitalName]);

    // Remove lab results
    $stmt = $pdo->prepare("DELETE FROM patient_labresults WHERE patient_id = ? AND (hospital_name = ? OR hospital_name = 'Selected Hospital')");
    $stmt->execute([$patientId, $hospitalName]);

    $pdo->commit();

    echo json_encode(['status' => 'success', 'message' => 'Patient removed from hospital records.']);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
