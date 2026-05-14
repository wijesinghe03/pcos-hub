<?php

session_start();
require_once 'db_connect.php';
require_once __DIR__ . '/utils/Logger.php';
header('Content-Type: application/json');

require_once 'utils/AuthHelper.php';

// Security Check: Only admins can manage hospitals
\App\Utils\AuthHelper::requireAdmin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id     = $data['id']     ?? null;
    $action = $data['action'] ?? '';
    $source = $data['source'] ?? 'directory'; // 'directory' | 'registered'

    if (!$id) {
        echo json_encode(['status' => 'error', 'message' => 'Missing hospital ID.']);
        exit;
    }

    try {
        if ($action === 'delete') {
            $table = ($source === 'registered') ? 'registered_hospitals' : 'hospitals';

            // Delete related documents if it's a registered hospital
            if ($source === 'registered') {
                $stmt = $pdo->prepare("DELETE FROM hospital_documents WHERE hospital_id = ?");
                $stmt->execute([$id]);
            }

            $stmt = $pdo->prepare("DELETE FROM $table WHERE id = ?");
            $stmt->execute([$id]);

            \App\Utils\Logger::log('hospital', 'warning', "Hospital ID $id (Source: $source) removed by admin", 'Admin');

            echo json_encode(['status' => 'success', 'message' => 'Hospital record removed successfully.']);
        } elseif ($action === 'add') {
            $hosp_name = $data['hosp_name'] ?? '';
            $email     = $data['email'] ?? '';
            $location  = $data['location'] ?? '';
            $reg_num   = $data['reg_number'] ?? '';

            if (!$hosp_name || !$email) {
                echo json_encode(['status' => 'error', 'message' => 'Name and Email are required.']);
                exit;
            }

            // Insert into the public hospitals table directly as 'approved'
            $stmt = $pdo->prepare("INSERT INTO hospitals (hosp_name, email, location, reg_number, approval_status, is_verified) VALUES (?, ?, ?, ?, 'approved', 1)");
            $stmt->execute([$hosp_name, $email, $location, $reg_num]);

            \App\Utils\Logger::log('hospital', 'info', "New hospital '$hosp_name' added manually by admin", 'Admin');

            echo json_encode(['status' => 'success', 'message' => 'Hospital added successfully.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid action requested.']);
        }
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
