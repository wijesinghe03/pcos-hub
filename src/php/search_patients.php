<?php

// ============================================================
// PCOS CARE HUB — Hospital Patient Search API (Robust)
// ============================================================

require_once __DIR__ . '/db_connect.php';
session_start();
header('Content-Type: application/json');

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

$searchId = $_GET['id'] ?? '';
$searchName = $_GET['name'] ?? '';
$statusFilter = $_GET['status'] ?? '';
$exact = isset($_GET['exact']) && $_GET['exact'] === 'true';

try {
    $sql = "
        SELECT DISTINCT p.id, p.full_name, p.username, p.email, p.phone, p.status, p.nic, p.created_at,
               (SELECT MAX(appointment_date) FROM patient_appointments WHERE patient_id = p.id AND (hospital_name = ? OR hospital_name = 'Selected Hospital')) as last_visit,
               (SELECT COUNT(*) FROM patient_reports WHERE patient_id = p.id AND (hospital_name = ? OR hospital_name = 'Selected Hospital')) as report_count
        FROM patients p
        WHERE p.id IN (
            SELECT patient_id FROM patient_appointments WHERE hospital_name = ? OR hospital_name = 'Selected Hospital'
            UNION
            SELECT patient_id FROM patient_reports WHERE hospital_name = ? OR hospital_name = 'Selected Hospital'
            UNION
            SELECT patient_id FROM patient_labresults WHERE hospital_name = ? OR hospital_name = 'Selected Hospital'
            UNION
            SELECT patient_id FROM consultations WHERE hospital_name = ?
        )
    ";
    
    $params = [$hospitalName, $hospitalName, $hospitalName, $hospitalName, $hospitalName, $hospitalName];

    if (!empty($searchId)) {
        $cleanId = ltrim(strtoupper($searchId), 'P-');
        if ($exact) {
            $sql .= " AND p.id = ?";
            $params[] = $cleanId;
        } else {
            $sql .= " AND (p.id LIKE ? OR p.username LIKE ? OR p.nic LIKE ?)";
            $params[] = "%$cleanId%";
            $params[] = "%$searchId%";
            $params[] = "%$searchId%";
        }
    }

    if (!empty($searchName)) {
        $sql .= " AND p.full_name LIKE ?";
        $params[] = "%$searchName%";
    }

    if (!empty($statusFilter)) {
        $sql .= " AND p.status = ?";
        $params[] = $statusFilter;
    }

    $sql .= " ORDER BY p.full_name ASC LIMIT 100";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $patients = $stmt->fetchAll(\PDO::FETCH_ASSOC);

    $results = [];
    foreach ($patients as $p) {
        $results[] = [
            'id' => 'P-' . str_pad($p['id'], 4, '0', STR_PAD_LEFT),
            'raw_id' => $p['id'],
            'name' => $p['full_name'],
            'nic' => $p['nic'] ?: $p['username'],
            'status' => $p['status'] ?: 'active',
            'lastVisit' => $p['last_visit'] ? date('d M Y', strtotime($p['last_visit'])) : 'N/A',
            'diagnosis' => 'PCOS',
            'reports' => (int)$p['report_count'],
            'email' => $p['email'],
            'phone' => $p['phone'] ?: 'N/A'
        ];
    }

    echo json_encode(['status' => 'success', 'data' => $results]);
} catch (\Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Query error: ' . $e->getMessage()]);
}
