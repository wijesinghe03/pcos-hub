<?php

// ============================================================
// PCOS CARE HUB — Upload Lab Report API
// ============================================================

// Suppress errors from breaking JSON response
error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/utils/Mailer.php';
session_start();
header('Content-Type: application/json');

use App\Utils\Mailer;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid method.']);
    exit;
}

$lab_id = $_POST['lab_id'] ?? null;
if (!$lab_id) {
    echo json_encode(['status' => 'error', 'message' => 'Lab record ID is required.']);
    exit;
}

if (!isset($_FILES['report_file']) || $_FILES['report_file']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['status' => 'error', 'message' => 'No file uploaded or upload error.']);
    exit;
}

try {
    // 1. Fetch lab record details
    $stmt = $pdo->prepare("
        SELECT lr.*, p.full_name, p.email 
        FROM patient_labresults lr
        JOIN patients p ON lr.patient_id = p.id
        WHERE lr.id = ?
    ");
    $stmt->execute([$lab_id]);
    $labRecord = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$labRecord) {
        echo json_encode(['status' => 'error', 'message' => 'Lab record not found.']);
        exit;
    }

    // 2. Handle file upload
    $file = $_FILES['report_file'];
    $orig_name = basename($file['name']);
    $ext = pathinfo($orig_name, PATHINFO_EXTENSION);
    $safe_name = $labRecord['patient_id'] . '_lab_' . time() . '.' . $ext;
    
    $upload_dir = dirname(__FILE__, 3) . '/uploads/reports/';
    if (!is_dir($upload_dir)) {
        @mkdir($upload_dir, 0755, true);
    }

    if (!@move_uploaded_file($file['tmp_name'], $upload_dir . $safe_name)) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to save file to ' . $upload_dir]);
        exit;
    }

    $file_path = 'uploads/reports/' . $safe_name;

    // 3. Update database
    $pdo->beginTransaction();

    // Update lab results status and file - Use 'sent' to match frontend
    $stmt = $pdo->prepare("UPDATE patient_labresults SET file_path = ?, status = 'sent' WHERE id = ?");
    $stmt->execute([$file_path, $lab_id]);

    // Also sync to patient_reports (Master record)
    $stmt = $pdo->prepare("
        INSERT INTO patient_reports 
        (patient_id, report_name, report_type, hospital_name, doctor_name, file_name, file_path, status, report_date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $labRecord['patient_id'], 
        $labRecord['test_name'], 
        $labRecord['test_type'] ?: 'Lab Report', 
        $labRecord['hospital_name'],
        'Hospital Staff',
        $orig_name,
        $file_path,
        'uploaded',
        $labRecord['report_date'] ?: date('Y-m-d')
    ]);

    $pdo->commit();

    // 4. Send Email Notification
    $subject = "Your Lab Report is Ready - {$labRecord['test_name']}";
    $emailBody = "
        <h2>Hello {$labRecord['full_name']},</h2>
        <p>Your lab report for the test <strong>'{$labRecord['test_name']}'</strong> conducted at <strong>{$labRecord['hospital_name']}</strong> is now available.</p>
        <p>You can view and download it directly from your PCOS Care Hub dashboard.</p>
        <br>
        <p>Regards,<br>PCOS Care Hub Team</p>
    ";
    
    // We try to send, but we don't want a mail failure to break the response
    @Mailer::send($labRecord['email'], $subject, $emailBody);

    echo json_encode([
        'status' => 'success', 
        'message' => 'Report uploaded and patient notified successfully!',
        'file_path' => $file_path
    ]);

} catch (Exception $e) {
    if ($pdo && $pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['status' => 'error', 'message' => 'Server error: ' . $e->getMessage()]);
}
