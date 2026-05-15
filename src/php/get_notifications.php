<?php

/**
 * Get Notifications Handler
 * Returns upcoming appointments and predicted periods for the logged-in patient.
 */

header('Content-Type: application/json');
require_once __DIR__ . '/db_connect.php';

$patientId = $_GET['patient_id'] ?? null;
$email     = $_GET['patient_email'] ?? null;

if (!$patientId && !$email) {
    echo json_encode(['status' => 'error', 'message' => 'Missing patient identification.']);
    exit;
}

$response = [
    'status' => 'success',
    'notifications' => []
];

try {
    // 1. Fetch Upcoming Appointments (next 7 days)
    $sqlAppt = "
        SELECT 
            'appointment' as type,
            id, 
            hospital_name, 
            doctor_name, 
            appointment_date, 
            appointment_time,
            appointment_type
        FROM patient_appointments 
        WHERE (patient_id = ? OR (patient_id IS NULL AND ? IS NOT NULL AND (SELECT email FROM patients WHERE id = patient_id) = ?))
          AND appointment_date >= CURDATE()
          AND appointment_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
          AND status = 'upcoming'
        ORDER BY appointment_date ASC, appointment_time ASC
    ";
    // Simplified patient check for dev
    $sqlAppt = "
        SELECT 
            'appointment' as type,
            id, 
            hospital_name, 
            doctor_name, 
            appointment_date, 
            appointment_time,
            appointment_type
        FROM patient_appointments 
        WHERE patient_id = ?
          AND appointment_date >= CURDATE()
          AND appointment_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
          AND status = 'upcoming'
        ORDER BY appointment_date ASC, appointment_time ASC
    ";
    $stmt = $pdo->prepare($sqlAppt);
    $stmt->execute([$patientId]);
    $appts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($appts as $appt) {
        $date = date('M j', strtotime($appt['appointment_date']));
        $time = date('g:i A', strtotime($appt['appointment_time']));
        $response['notifications'][] = [
            'type' => 'appointment',
            'title' => 'Upcoming Appointment',
            'message' => "{$appt['appointment_type']} at {$appt['hospital_name']} on {$date} at {$time}",
            'date' => $appt['appointment_date'],
            'raw' => $appt
        ];
    }

    // 2. Fetch Predicted Period (next 5 days)
    $sqlCycle = "
        SELECT 
            'cycle' as type,
            id, 
            next_predicted
        FROM cycle_logs 
        WHERE patient_id = ?
          AND next_predicted >= CURDATE()
          AND next_predicted <= DATE_ADD(CURDATE(), INTERVAL 5 DAY)
          AND id = (SELECT MAX(id) FROM cycle_logs WHERE patient_id = ?)
    ";
    $stmt = $pdo->prepare($sqlCycle);
    $stmt->execute([$patientId, $patientId]);
    $cycle = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($cycle) {
        $date = date('M j', strtotime($cycle['next_predicted']));
        $response['notifications'][] = [
            'type' => 'cycle',
            'title' => 'Period Prediction',
            'message' => "Your next period is predicted to start on {$date}. Prepare ahead!",
            'date' => $cycle['next_predicted'],
            'raw' => $cycle
        ];
    }

    // Sort all by date
    usort($response['notifications'], function ($a, $b) {
        return strtotime($a['date']) - strtotime($b['date']);
    });
} catch (Exception $e) {
    $response = ['status' => 'error', 'message' => $e->getMessage()];
}

echo json_encode($response);
