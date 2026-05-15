<?php

// ============================================================
// PCOS CARE HUB — Fetch Hospital Lab Results API
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

try {
    $stmt = $pdo->prepare("
        SELECT lr.*, p.full_name, p.email, p.phone, p.nic
        FROM patient_labresults lr
        JOIN patients p ON lr.patient_id = p.id
        WHERE lr.hospital_name = ? OR lr.hospital_name = 'Selected Hospital'
        ORDER BY lr.report_date DESC, lr.created_at DESC
    ");
    $stmt->execute([$hospitalName]);
    $results = [];

    while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
        $results[] = [
            'id'            => $row['id'],
            'patient_id'    => 'P-' . str_pad($row['patient_id'], 4, '0', STR_PAD_LEFT),
            'raw_patient_id'=> $row['patient_id'],
            'patient_name'  => $row['full_name'],
            'email'         => $row['email'],
            'phone'         => $row['phone'] ?: 'N/A',
            'nic'           => $row['nic'],
            'test_name'     => $row['test_name'],
            'test_type'     => $row['test_type'],
            'status'        => $row['status'],
            'report_date'   => date('d M Y', strtotime($row['report_date'])),
            'file_path'     => $row['file_path'],
            'results_data'  => json_decode($row['results_data'] ?? '{}', true)
        ];
    }

    echo json_encode([
        'status' => 'success',
        'data'   => $results,
        'hospital_name' => $hospitalName
    ]);

} catch (\Exception $e) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Failed to fetch lab results: ' . $e->getMessage()
    ]);
}
