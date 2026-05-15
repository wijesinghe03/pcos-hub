<?php

// ============================================================
// PCOS CARE HUB — Hospital Appointments Fetch API
// Returns all appointments for the logged-in hospital.
// ============================================================

require_once __DIR__ . '/db_connect.php';
session_start();
header('Content-Type: application/json');

$hospitalId = $_SESSION['hospital_id'] ?? null;
$hospitalInfo = [
    'hosp_name' => 'City Hospital Colombo',
    'hospital_type' => 'private',
    'address' => '123 Health Ave, Colombo 07',
    'location' => 'Colombo, Sri Lanka',
    'phone' => '+94 11 234 5678',
    'email' => 'info@cityhospital.lk',
    'reg_number' => 'MOH-LK-2019-0042',
    'is_verified' => 1
];

if ($hospitalId) {
    try {
        $stmt = $pdo->prepare("SELECT hosp_name, hospital_type, address, location, phone, email, reg_number, is_verified FROM registered_hospitals WHERE id = ? LIMIT 1");
        $stmt->execute([$hospitalId]);
        $row = $stmt->fetch();
        if ($row) {
            $hospitalInfo = $row;
        }
    } catch (\Exception $e) { }
}
$hospitalName = $hospitalInfo['hosp_name'];

try {
    // Fetch appointments from patient_appointments table
    // We also join with patients table to get the latest patient info if available
    $stmt = $pdo->prepare("
        SELECT a.id, a.patient_id, a.doctor_name, 
               a.appointment_date, a.appointment_time, a.appointment_type, 
               a.status, a.reason as notes, a.created_at,
               a.consultation_fee, a.payment_status,
               p.full_name as patient_name, p.email as patient_email,
               p.nic, p.phone
        FROM patient_appointments a
        JOIN patients p ON a.patient_id = p.id
        WHERE a.hospital_name = ? OR a.hospital_name = 'Selected Hospital'
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
    ");
    $stmt->execute([$hospitalName]);
    $appointments = $stmt->fetchAll(\PDO::FETCH_ASSOC);

    $results = [];
    foreach ($appointments as $row) {
        $results[] = [
            'id'           => 'APT-' . str_pad($row['id'], 4, '0', STR_PAD_LEFT),
            'raw_id'       => $row['id'],
            'patientName'  => $row['patient_name'] ?: 'Guest',
            'patientId'    => $row['patient_id'] ? 'P-' . str_pad($row['patient_id'], 4, '0', STR_PAD_LEFT) : 'GUEST',
            'nic'          => $row['nic'] ?: 'N/A',
            'doctor'       => $row['doctor_name'] ?: 'Not Assigned',
            'type'         => ucwords(str_replace(['_', '-'], ' ', $row['appointment_type'])),
            'date'         => $row['appointment_date'],
            'time'         => date('g:i A', strtotime($row['appointment_time'])),
            'status'       => $row['status'] ?: 'pending',
            'notes'        => $row['notes'] ?: '',
            'email'        => $row['patient_email'] ?: 'N/A',
            'phone'        => $row['phone'] ?: 'N/A',
            'fee'          => number_format($row['consultation_fee'], 2),
            'paymentStatus' => $row['payment_status'] ?: 'unpaid'
        ];
    }

    echo json_encode([
        'status' => 'success', 
        'data' => $results, 
        'hospital_name' => $hospitalName,
        'hospital' => $hospitalInfo
    ]);

} catch (\Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Query error: ' . $e->getMessage()]);
}
