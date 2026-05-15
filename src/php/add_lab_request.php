<?php

// ============================================================
// PCOS CARE HUB — Add Lab Request API
// ============================================================

require_once __DIR__ . '/db_connect.php';
session_start();
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid method.']);
    exit;
}

$hospitalId = $_SESSION['hospital_id'] ?? null;
$hospitalName = 'City Hospital Colombo';

if ($hospitalId) {
    try {
        $stmt = $pdo->prepare("SELECT hosp_name FROM registered_hospitals WHERE id = ? LIMIT 1");
        $stmt->execute([$hospitalId]);
        $row = $stmt->fetch();
        if ($row) {
            $hospitalName = $row['hosp_name'];
        }
    } catch (\Exception $e) { }
}

$patient_id = $_POST['patient_id'] ?? '';
$test_name = $_POST['test_name'] ?? '';
$test_type = $_POST['test_type'] ?? 'General';
$report_date = $_POST['report_date'] ?? date('Y-m-d');

if (stripos($patient_id, 'P-') === 0) {
    $patient_id = (int)substr($patient_id, 2);
}

if (!$patient_id || !$test_name) {
    echo json_encode(['status' => 'error', 'message' => 'Patient ID and Test Name are required.']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id FROM patients WHERE id = ?");
    $stmt->execute([(int)$patient_id]);
    if (!$stmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'Patient not found.']);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO patient_labresults 
        (patient_id, report_id, test_name, test_type, hospital_name, doctor_name, report_date, file_path, status, results_data) 
        VALUES (?, NULL, ?, ?, ?, 'Staff', ?, '', 'pending', '{}')
    ");
    $stmt->execute([$patient_id, $test_name, $test_type, $hospitalName, $report_date]);

    echo json_encode([
        'status' => 'success',
        'message' => 'Lab request registered successfully!',
        'id' => $pdo->lastInsertId()
    ]);

} catch (\Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
