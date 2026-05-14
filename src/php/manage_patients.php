<?php

session_start();
require_once 'db_connect.php';
require_once __DIR__ . '/utils/Logger.php';
header('Content-Type: application/json');
require_once 'utils/AuthHelper.php';
\App\Utils\AuthHelper::requireAdmin();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;
    $action = $data['action'] ?? '';
    if (!$id) {
        echo json_encode(['status' => 'error', 'message' => 'Missing patient ID.']);
        exit;
    }

    try {
        if ($action === 'delete') {
            $stmt = $pdo->prepare("DELETE FROM patients WHERE id = ?");
            $stmt->execute([$id]);
            \App\Utils\Logger::log('patient', 'warning', "Patient ID $id has been deleted from the system", 'PatientManager');
            echo json_encode(['status' => 'success', 'message' => 'Patient record removed successfully.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid action.']);
        }
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
