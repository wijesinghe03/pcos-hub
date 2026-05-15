<?php

// ============================================================
// PCOS CARE HUB — Fetch All Hospital Patients API
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
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);
        if ($row) {
            $hospitalName = $row['hosp_name'];
        }
    } catch (\Exception $e) { }
}

try {
    // Fetch ALL patients who have ever interacted with this hospital
    $stmt = $pdo->prepare("
        SELECT p.id, p.full_name, p.username, p.email, p.phone,
               p.nic, p.status, p.created_at,
               (SELECT COUNT(*) FROM patient_reports WHERE patient_id = p.id AND (hospital_name = ? OR hospital_name = 'Selected Hospital')) as report_count,
               (SELECT MAX(report_date) FROM patient_reports WHERE patient_id = p.id AND (hospital_name = ? OR hospital_name = 'Selected Hospital')) as last_report_date
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
        ORDER BY p.full_name ASC
    ");
    $stmt->execute([$hospitalName, $hospitalName, $hospitalName, $hospitalName, $hospitalName, $hospitalName]);
    
    $patients = [];
    while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
        $patients[] = [
            'id'          => 'P-' . str_pad($row['id'], 4, '0', STR_PAD_LEFT),
            'raw_id'      => $row['id'],
            'name'        => $row['full_name'],
            'nic'         => $row['nic'] ?: $row['username'],
            'email'       => $row['email'],
            'phone'       => $row['phone'] ?: 'N/A',
            'status'      => $row['status'] ?: 'active',
            'reports'     => (int)$row['report_count'],
            'lastVisit'   => $row['last_report_date'] ? date('d M Y', strtotime($row['last_report_date'])) : 'N/A',
            'diagnosis'   => 'PCOS',
            'hospital'    => $hospitalName
        ];
    }

    echo json_encode([
        'status' => 'success',
        'data'   => $patients
    ]);

} catch (\Exception $e) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Failed to load patients: ' . $e->getMessage()
    ]);
}
