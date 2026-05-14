<?php

require_once 'db_connect.php';
require_once __DIR__ . '/utils/Logger.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;
    $action = $data['action'] ?? '';

    if (!$id) {
        echo json_encode(['status' => 'error', 'message' => 'Missing hospital ID.']);
        exit;
    }

    try {
        if ($action === 'delete') {
            // Check for related records if necessary (e.g., appointments, reviews)
            // For now, simple delete
            $stmt = $pdo->prepare("DELETE FROM hospitals WHERE id = ?");
            $stmt->execute([$id]);

            \App\Utils\Logger::log('hospital', 'warning', "Hospital ID $id has been removed from the platform by administrator", 'HospitalManager');

            echo json_encode(['status' => 'success', 'message' => 'Hospital record removed successfully.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid action requested.']);
        }
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
