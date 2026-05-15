<?php

// ============================================================
// PCOS CARE HUB — Hospital Patient Search API (Robust)
// Returns patients associated with the logged-in hospital
// ============================================================

header('Content-Type: application/json');
require_once 'db_connect.php';
session_start();

$hospitalId = $_SESSION['hospital_id'] ?? null;
$hospitalName = 'City Hospital Colombo'; // Fallback for testing

if ($hospitalId) {
    try {
        $stmt = $pdo->prepare("SELECT hosp_name FROM registered_hospitals WHERE id = ? LIMIT 1");
        $stmt->execute([$hospitalId]);
        $row = $stmt->fetch();
        if ($row) {
            $hospitalName = $row['hosp_name'];
        }
    } catch (PDOException $e) {
        // Fallback
    }
}

$searchId = $_GET['id'] ?? '';
$searchName = $_GET['name'] ?? '';
$statusFilter = $_GET['status'] ?? '';
$exact = isset($_GET['exact']) && $_GET['exact'] === 'true';

try {
    // ── 1. Base Query ───────────────────────────────────────
    // We select patients who have at least one record (appointment, report, or lab result) at this hospital
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
        )
    ";
    
    $params = [$hospitalName, $hospitalName, $hospitalName, $hospitalName, $hospitalName];

    // ── 2. Filters ──────────────────────────────────────────
    if (!empty($searchId)) {
        $cleanId = ltrim(strtoupper($searchId), 'P-');
        if ($exact) {
            $sql .= " AND p.id = ?";
            $params[] = $cleanId;
        } else {
            // Search by Patient ID (formatted P-0000 or raw), NIC, or Username
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
    $patients = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ── 3. Format Results ───────────────────────────────────
    $results = [];
    foreach ($patients as $p) {
        $results[] = [
            'id' => 'P-' . str_pad($p['id'], 4, '0', STR_PAD_LEFT), // Unique Patient Number
            'raw_id' => $p['id'],
            'name' => $p['full_name'],
            'nic' => $p['nic'] ?: $p['username'],
            'status' => $p['status'] ?: 'active',
            'lastVisit' => $p['last_visit'] ? date('d M Y', strtotime($p['last_visit'])) : 'N/A',
            'diagnosis' => 'PCOS', // In real app, fetch from medical_records table
            'reports' => (int)$p['report_count'],
            'email' => $p['email'],
            'phone' => $p['phone'] ?: 'N/A'
        ];
    }

    echo json_encode(['status' => 'success', 'data' => $results]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Query error: ' . $e->getMessage()]);
}
