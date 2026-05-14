<?php

require_once 'db_connect.php';
header('Content-Type: application/json');
try {
    // 1. Pending Hospital Approvals (from staging table)
    $stmt = $pdo->query("SELECT id, hosp_name, location, approval_status FROM registered_hospitals WHERE approval_status = 'pending' ORDER BY id DESC LIMIT 5");
    $pending_hospitals = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Recent Users (Patients + Registered Hospitals)
    $stmt = $pdo->query("
        (SELECT 'Patient' as role, full_name COLLATE utf8mb4_unicode_ci as name, email COLLATE utf8mb4_unicode_ci as email, created_at, 'active' as status FROM patients)
        UNION
        (SELECT 'Hospital' as role, hosp_name COLLATE utf8mb4_unicode_ci as name, email COLLATE utf8mb4_unicode_ci as email, created_at, approval_status as status FROM registered_hospitals)
        ORDER BY created_at DESC LIMIT 5
    ");
    $recent_users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. All Approved Hospitals (unified view)
    $stmt = $pdo->query("
        SELECT id, hosp_name, location, created_at, approval_status 
        FROM registered_hospitals 
        WHERE approval_status = 'approved' 
        ORDER BY hosp_name ASC LIMIT 10
    ");
    $all_hospitals = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. Recent System Logs
    $stmt = $pdo->query("SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT 10");
    $recent_logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

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
