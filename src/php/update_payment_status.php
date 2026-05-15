<?php

// ============================================================
// PCOS CARE HUB — Update Payment Status API
// Updates the payment status of an appointment.
// ============================================================

require_once __DIR__ . '/db_connect.php';
session_start();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$appointmentId = $input['id'] ?? null;
$newStatus = $input['status'] ?? 'paid';

if (!$appointmentId) {
    echo json_encode(['status' => 'error', 'message' => 'Missing appointment ID']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE patient_appointments SET payment_status = ? WHERE id = ?");
    $stmt->execute([$newStatus, $appointmentId]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['status' => 'success', 'message' => 'Payment status updated to ' . $newStatus]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No changes made or appointment not found']);
    }
} catch (\Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
