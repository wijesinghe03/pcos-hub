<?php

// ============================================================
// PCOS CARE HUB — Hospital Dashboard Real-Time Data API
// Returns: stats, recent lab results, consultations, recent patients,
//          and today's appointments — all from live database.
// ============================================================

require_once __DIR__ . '/db_connect.php';
session_start();
header('Content-Type: application/json');

// Determine hospital ID from session or fallback
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
    } catch (PDOException $e) {
        // Fallback
    }
}
$hospitalName = $hospitalInfo['hosp_name'];

try {
    $data = [];

    // ── 1. Dashboard Stats ──────────────────────────────────
    // Total patients associated with this hospital
    $stmt = $pdo->prepare("
        SELECT COUNT(DISTINCT p.id) as count 
        FROM patients p
        WHERE p.id IN (
            SELECT patient_id FROM patient_appointments WHERE hospital_name = ? OR hospital_name = 'Selected Hospital'
            UNION
            SELECT patient_id FROM patient_reports WHERE hospital_name = ? OR hospital_name = 'Selected Hospital'
            UNION
            SELECT patient_id FROM patient_labresults WHERE hospital_name = ? OR hospital_name = 'Selected Hospital'
        )
    ");
    $stmt->execute([$hospitalName, $hospitalName, $hospitalName]);
    $totalPatients = (int)$stmt->fetch()['count'];

    // New patients this week associated with this hospital
    $stmt = $pdo->prepare("
        SELECT COUNT(DISTINCT p.id) as count 
        FROM patients p
        WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        AND p.id IN (
            SELECT patient_id FROM patient_appointments WHERE hospital_name = ? OR hospital_name = 'Selected Hospital'
            UNION
            SELECT patient_id FROM patient_reports WHERE hospital_name = ? OR hospital_name = 'Selected Hospital'
            UNION
            SELECT patient_id FROM patient_labresults WHERE hospital_name = ? OR hospital_name = 'Selected Hospital'
        )
    ");
    $stmt->execute([$hospitalName, $hospitalName, $hospitalName]);
    $newPatientsWeek = (int)$stmt->fetch()['count'];

    // Pending reports for this hospital
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM patient_reports WHERE status = 'pending' AND (hospital_name = ? OR hospital_name = 'Selected Hospital')");
    $stmt->execute([$hospitalName]);
    $pendingReports = (int)$stmt->fetch()['count'];

    // Pending lab results for this hospital
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM patient_labresults WHERE status IN ('pending', 'processing') AND (hospital_name = ? OR hospital_name = 'Selected Hospital')");
    $stmt->execute([$hospitalName]);
    $pendingLabs = (int)$stmt->fetch()['count'];
    $totalPending = $pendingReports + $pendingLabs;

    // Today's appointments (using patient_appointments)
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM patient_appointments WHERE appointment_date = CURDATE() AND (hospital_name = ? OR hospital_name = 'Selected Hospital')");
    $stmt->execute([$hospitalName]);
    $todayAppointments = (int)$stmt->fetch()['count'];

    // Next appointment time today
    $stmt = $pdo->prepare("SELECT appointment_time FROM patient_appointments WHERE appointment_date = CURDATE() AND appointment_time >= CURTIME() AND status != 'cancelled' AND (hospital_name = ? OR hospital_name = 'Selected Hospital') ORDER BY appointment_time ASC LIMIT 1");
    $stmt->execute([$hospitalName]);
    $nextAppt = $stmt->fetch();
    $nextApptTime = $nextAppt ? date('g:i A', strtotime($nextAppt['appointment_time'])) : 'None';

    $data['stats'] = [
        'total_patients'     => $totalPatients,
        'new_patients_week'  => $newPatientsWeek,
        'pending_reports'    => $totalPending,
        'new_consultations'  => $todayAppointments, // For now using today's appts as consultations indicator
        'today_appointments' => $todayAppointments,
        'next_appointment'   => $nextApptTime
    ];

    // ── 2. Recent Lab Results (latest 5) ────────────────────
    $stmt = $pdo->prepare("
        SELECT lr.id, lr.patient_id, lr.test_name, lr.test_type, lr.status,
               lr.report_date, lr.results_data, p.full_name as patient_name
        FROM patient_labresults lr
        JOIN patients p ON lr.patient_id = p.id
        WHERE lr.hospital_name = ? OR lr.hospital_name = 'Selected Hospital'
        ORDER BY lr.report_date DESC, lr.created_at DESC
        LIMIT 5
    ");
    $stmt->execute([$hospitalName]);
    $labResults = [];
    while ($row = $stmt->fetch()) {
        $resultsData = json_decode($row['results_data'] ?? '{}', true);
        $resultValue = $resultsData['value'] ?? 'N/A';
        $resultFlag = $resultsData['result_flag'] ?? 'normal';

        $labResults[] = [
            'id'           => $row['id'],
            'patient_id'   => 'P-' . str_pad($row['patient_id'], 4, '0', STR_PAD_LEFT),
            'patient_name' => $row['patient_name'],
            'test_name'    => $row['test_name'],
            'test_type'    => $row['test_type'],
            'status'       => $row['status'],
            'report_date'  => $row['report_date'],
            'result_value' => $resultValue,
            'result_flag'  => $resultFlag
        ];
    }
    $data['lab_results'] = $labResults;

    // ── 3. Upcoming Consultations (using patient_appointments) ──
    $stmt = $pdo->prepare("
        SELECT a.id, a.patient_id, a.doctor_name, a.appointment_date, a.appointment_time,
               a.appointment_type, a.status, a.reason as notes,
               p.full_name as patient_name
        FROM patient_appointments a
        JOIN patients p ON a.patient_id = p.id
        WHERE (a.appointment_date > CURDATE() OR (a.appointment_date = CURDATE() AND a.appointment_time >= CURTIME()))
          AND a.status != 'cancelled'
          AND (a.hospital_name = ? OR a.hospital_name = 'Selected Hospital')
        ORDER BY a.appointment_date ASC, a.appointment_time ASC
        LIMIT 5
    ");
    $stmt->execute([$hospitalName]);
    $consultations = [];
    while ($row = $stmt->fetch()) {
        $consultations[] = [
            'id'                 => $row['id'],
            'patient_id'         => 'P-' . str_pad($row['patient_id'], 4, '0', STR_PAD_LEFT),
            'patient_name'       => $row['patient_name'],
            'doctor_name'        => $row['doctor_name'],
            'date'               => $row['appointment_date'],
            'time'               => date('g:i A', strtotime($row['appointment_time'])),
            'type_label'         => ucwords(str_replace(['_', '-'], ' ', $row['appointment_type'])),
            'status'             => $row['status'],
            'notes'              => $row['notes']
        ];
    }
    $data['consultations'] = $consultations;

    // ── 4. Recent Patients ──────────────────────────────────
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
        )
        ORDER BY p.created_at DESC
        LIMIT 10
    ");
    $stmt->execute([$hospitalName, $hospitalName, $hospitalName, $hospitalName, $hospitalName]);
    $patients = [];
    while ($row = $stmt->fetch()) {
        $patients[] = [
            'id'          => 'P-' . str_pad($row['id'], 4, '0', STR_PAD_LEFT),
            'raw_id'      => $row['id'],
            'name'        => $row['full_name'],
            'nic'         => $row['nic'] ?: $row['username'],
            'email'       => $row['email'],
            'phone'       => $row['phone'] ?: 'N/A',
            'status'      => $row['status'] ?: 'active',
            'reports'     => (int)$row['report_count'],
            'last_visit'  => $row['last_report_date'] ? date('d M Y', strtotime($row['last_report_date'])) : 'N/A',
            'diagnosis'   => 'PCOS'
        ];
    }
    $data['patients'] = $patients;

    echo json_encode([
        'status'   => 'success',
        'hospital' => $hospitalInfo,
        'data'     => $data
    ]);
} catch (Exception $e) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Failed to load dashboard data: ' . $e->getMessage()
    ]);
}
