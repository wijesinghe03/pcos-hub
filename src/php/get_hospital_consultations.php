<?php

// ============================================================
// PCOS CARE HUB — Fetch Hospital Consultations API
// ============================================================

require_once __DIR__ . '/db_connect.php';

if (!isset($_SESSION)) {
    session_start();
}
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
    } catch (\Exception $e) {
    }
}

try {
    // Fetch from the dedicated consultations table
    $stmt = $pdo->prepare("
        SELECT * FROM consultations
        WHERE hospital_name = ?
        ORDER BY appointment_date DESC, appointment_time DESC
    ");
    $stmt->execute([$hospitalName]);
    $results = [];

    while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
        $results[] = [
            'id'            => $row['id'],
            'patient_id'    => $row['patient_id'] ? 'P-' . str_pad($row['patient_id'], 4, '0', STR_PAD_LEFT) : 'GUEST',
            'raw_patient_id' => $row['patient_id'],
            'patient_name'  => $row['patient_name'],
            'patient_email' => $row['patient_email'],
            'patient_phone' => $row['patient_phone'],
            'type'          => $row['type'],
            'typeName'      => ucwords(str_replace(['_', '-'], ' ', $row['type'])),
            'date'          => date('d M Y', strtotime($row['appointment_date'])),
            'raw_date'      => $row['appointment_date'],
            'time'          => date('g:i A', strtotime($row['appointment_time'])),
            'raw_time'      => $row['appointment_time'],
            'status'        => $row['status'],
            'notes'         => $row['notes'] ?: 'No notes'
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
        'message' => 'Failed to fetch consultations: ' . $e->getMessage()
    ]);
}
