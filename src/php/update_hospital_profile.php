<?php

// ============================================================
// PCOS CARE HUB — Update Hospital Profile (update_hospital_profile.php)
// ============================================================

require_once __DIR__ . '/db_connect.php';
session_start();
header('Content-Type: application/json');

// Check session
if (empty($_SESSION['hospital_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'No hospital session found.']);
    exit;
}

$hospitalId = (int)$_SESSION['hospital_id'];

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['status' => 'error', 'message' => 'No data provided.']);
    exit;
}

$action = $data['action'] ?? 'basic';

try {
    if ($action === 'basic') {
        $name  = $data['name'] ?? '';
        $type  = $data['type'] ?? '';
        $reg   = $data['reg'] ?? '';
        $year  = !empty($data['year']) ? (int)$data['year'] : null;
        $beds  = !empty($data['beds']) ? (int)$data['beds'] : null;
        $desc  = $data['desc'] ?? '';

        if (empty($name)) {
            echo json_encode(['status' => 'error', 'message' => 'Hospital name is required.']);
            exit;
        }

        $stmt = $pdo->prepare("
            UPDATE registered_hospitals 
            SET hosp_name = ?, hospital_type = ?, reg_number = ?, 
                established_year = ?, bed_capacity = ?, about_desc = ?
            WHERE id = ?
        ");
        $stmt->execute([$name, $type, $reg, $year, $beds, $desc, $hospitalId]);

        echo json_encode(['status' => 'success', 'message' => 'Basic profile updated successfully!']);
    } elseif ($action === 'contact') {
        $phone = $data['phone'] ?? '';
        $email = $data['email'] ?? '';
        $addr  = $data['address'] ?? '';
        $loc   = $data['location'] ?? '';

        $stmt = $pdo->prepare("
            UPDATE registered_hospitals 
            SET phone = ?, email = ?, address = ?, location = ?
            WHERE id = ?
        ");
        $stmt->execute([$phone, $email, $addr, $loc, $hospitalId]);

        echo json_encode(['status' => 'success', 'message' => 'Contact information updated successfully!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid action.']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
