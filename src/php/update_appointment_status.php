<?php

// ============================================================
// PCOS CARE HUB — Update Appointment Status API
// Updates the status of an appointment in the database.
// ============================================================

require_once __DIR__ . '/db_connect.php';
session_start();
header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$appointmentId = $input['id'] ?? null;
$newStatus = $input['status'] ?? null;

if (!$appointmentId || !$newStatus) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
    exit;
}

// Security: In a real app, verify that this appointment belongs to the logged-in hospital
// For now, we proceed with the update

try {
    $stmt = $pdo->prepare("UPDATE patient_appointments SET status = ? WHERE id = ?");
    $stmt->execute([$newStatus, $appointmentId]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['status' => 'success', 'message' => 'Appointment status updated to ' . $newStatus]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No changes made or appointment not found']);
    }
} catch (\Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
