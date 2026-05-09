<?php

// ============================================================
// PCOS CARE HUB — Fetch Global Statistics (get_stats.php)
// ============================================================

require_once 'db_connect.php';

header('Content-Type: application/json');

try {
    // 1. Count Patients
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM patients");
    $patient_count = $stmt->fetch()['count'];

    // 2. Count Hospitals
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM hospitals");
    $hospital_count = $stmt->fetch()['count'];

    // 3. Count Reports (sum of patient_reports and patient_labresults)
    // We use separate queries to be safe
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM patient_reports");
    $report_count = $stmt->fetch()['count'];

    $stmt = $pdo->query("SELECT COUNT(*) as count FROM patient_labresults");
    $lab_count = $stmt->fetch()['count'];

    $total_reports = $report_count + $lab_count;

    echo json_encode([
        'status' => 'success',
        'data' => [
            'patients' => (int)$patient_count,
            'hospitals' => (int)$hospital_count,
            'reports' => (int)$total_reports
        ]
    ]);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to fetch statistics: ' . $e->getMessage()
    ]);
}
