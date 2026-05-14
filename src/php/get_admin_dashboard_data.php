<?php

require_once 'db_connect.php';
header('Content-Type: application/json');
try {
// 1. Pending Hospital Approvals
    $stmt = $pdo->query("SELECT id, hosp_name, location, approval_status FROM hospitals WHERE approval_status = 'pending' ORDER BY id DESC LIMIT 5");
    $pending_hospitals = $stmt->fetchAll();
// 2. Recent Users (Patients + Hospitals)
    // We combine them for the dashboard view
    $stmt = $pdo->query("
        (SELECT 'Patient' as role, full_name as name, email, created_at, status FROM patients)
        UNION
        (SELECT 'Hospital' as role, hosp_name as name, email, created_at, approval_status as status FROM hospitals)
        ORDER BY created_at DESC LIMIT 5
    ");
    $recent_users = $stmt->fetchAll();
// 3. Registered Hospitals (Approved)
    $stmt = $pdo->query("SELECT id, hosp_name, location, created_at, approval_status FROM hospitals WHERE approval_status = 'approved' ORDER BY hosp_name ASC LIMIT 10");
    $all_hospitals = $stmt->fetchAll();
// 4. Recent System Logs
    $stmt = $pdo->query("SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT 10");
    $recent_logs = $stmt->fetchAll();
    echo json_encode([
        'status' => 'success',
        'data' => [
            'pending_hospitals' => $pending_hospitals,
            'recent_users' => $recent_users,
            'all_hospitals' => $all_hospitals,
            'recent_logs' => $recent_logs
        ]
    ]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
