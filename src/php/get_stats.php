<?php

// ============================================================
// PCOS CARE HUB — Fetch Global Statistics (get_stats.php)
// ============================================================

require_once 'db_connect.php';
require_once __DIR__ . '/utils/Logger.php';

header('Content-Type: application/json');

try {
    \App\Utils\Logger::log('system', 'info', 'Real-time system statistics fetched', 'StatsEngine');
    // 1. Count Patients
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM patients");
    $patient_count = $stmt->fetch()['count'];

    // 2. Count Approved Hospitals (is_verified = 1 / approval_status = 'approved')
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM hospitals WHERE is_verified = 1 AND approval_status = 'approved'");
    $hospital_count = $stmt->fetch()['count'];

    // 3. Count Reports (sum of patient_reports and patient_labresults)
    // We use separate queries to be safe
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM patient_reports");
    $report_count = $stmt->fetch()['count'];

    $stmt = $pdo->query("SELECT COUNT(*) as count FROM patient_labresults");
    $lab_count = $stmt->fetch()['count'];

    $total_reports = $report_count + $lab_count;

    // 4. Count Admins
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM admin_users");
    $admin_count = $stmt->fetch()['count'];

    // 5. Count Pending Hospitals
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM hospitals WHERE approval_status = 'pending'");
    $pending_count = $stmt->fetch()['count'];

    echo json_encode([
        'status' => 'success',
        'data' => [
            'patients' => (int)$patient_count,
            'hospitals' => (int)$hospital_count,
            'reports' => (int)$total_reports,
            'admins' => (int)$admin_count,
            'pending_hospitals' => (int)$pending_count
        ]
    ]);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to fetch statistics: ' . $e->getMessage()
    ]);
}
