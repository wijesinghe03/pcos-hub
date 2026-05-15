<?php

// ============================================================
// PCOS CARE HUB — Add Hospital Consultation API
// ============================================================

require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/utils/Mailer.php';

if (!isset($_SESSION)) {
    session_start();
}
header('Content-Type: application/json');

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    echo json_encode(['status' => 'error', 'message' => 'No data received.']);
    exit;
}

$hosp    = $data['hospital_name'] ?? '';
$name    = $data['patient_name'] ?? '';
$email   = $data['patient_email'] ?? '';
$phone   = $data['contact_number'] ?? '';
$p_id    = $data['patient_id'] ?? null;
$type    = $data['appointment_type'] ?? 'consultation';
$date    = $data['appointment_date'] ?? '';
$time    = $data['appointment_time'] ?? '';
$notes   = $data['reason'] ?? '';

if (!$hosp || !$name || !$email || !$date || !$time) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields.']);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Insert into consultations table
    $stmt = $pdo->prepare("
        INSERT INTO consultations 
        (hospital_name, patient_id, patient_name, patient_email, patient_phone, type, appointment_date, appointment_time, notes, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    ");
    $stmt->execute([$hosp, $p_id, $name, $email, $phone, $type, $date, $time, $notes]);
    $consultation_id = $pdo->lastInsertId();

    // 2. If it's a registered patient, sync to patient_appointments so they see it in their profile
    if ($p_id) {
        $stmt2 = $pdo->prepare("
            INSERT INTO patient_appointments 
            (patient_id, hospital_name, doctor_name, appointment_date, appointment_time, appointment_type, reason, status) 
            VALUES (?, ?, 'Hospital Consultant', ?, ?, ?, ?, 'upcoming')
        ");
        $stmt2->execute([$p_id, $hosp, $date, $time, $type, $notes]);
    }

    $pdo->commit();

    // 3. Send Confirmation Email
    $subject = "Consultation Scheduled: $hosp";
    $formattedDate = date('d M Y', strtotime($date));
    $formattedTime = date('g:i A', strtotime($time));

    $emailBody = "
        <div style='font-family: Arial, sans-serif; color: #333; line-height: 1.6;'>
            <h2 style='color: #6366f1;'>Consultation Confirmed</h2>
            <p>Hello <strong>$name</strong>,</p>
            <p>A new consultation has been scheduled for you at <strong>$hosp</strong>.</p>
            <div style='background: #f3f4f6; padding: 20px; border-radius: 12px; border-left: 5px solid #6366f1; margin: 20px 0;'>
                <p style='margin: 5px 0;'><strong>Date:</strong> $formattedDate</p>
                <p style='margin: 5px 0;'><strong>Time:</strong> $formattedTime</p>
                <p style='margin: 5px 0;'><strong>Type:</strong> " . ucwords($type) . "</p>
            </div>
            <p>If you have any questions, please contact the hospital directly at $phone.</p>
            <br>
            <p>Best regards,<br>PCOS Care Hub Team</p>
        </div>
    ";

    try {
        \App\Utils\Mailer::send($email, $subject, $emailBody);
    } catch (\Exception $e) {
        error_log("Consultation email failed: " . $e->getMessage());
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Consultation added and patient notified.',
        'id' => $consultation_id
    ]);
} catch (\Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(['status' => 'error', 'message' => 'Server error: ' . $e->getMessage()]);
}
