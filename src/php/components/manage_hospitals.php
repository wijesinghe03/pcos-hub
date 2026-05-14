<?php

header('Content-Type: application/json');
require_once '../db_connect.php';

$jsonRaw = file_get_contents('php://input');
$data = !empty($jsonRaw) ? json_decode($jsonRaw, true) : $_POST;

$action = $data['action'] ?? '';

try {
    switch ($action) {
        case 'add':
            $name = $data['hosp_name'] ?? '';
            $location = $data['location'] ?? '';
            $email = $data['email'] ?? '';
            $username = $data['username'] ?? '';
            $password = password_hash($data['password'] ?? '123456', PASSWORD_DEFAULT);
            $reg = $data['reg_number'] ?? 'REG-' . time();
            $desc = $data['description'] ?? '';
            $phone = $data['phone'] ?? '';
            $type = $data['hospital_type'] ?? 'Private';
            $specs = $data['specialties'] ?? '';
            $address = $data['address'] ?? '';

            $stmt = $pdo->prepare("INSERT INTO hospitals (hosp_name, location, email, username, password, reg_number, description, phone, hospital_type, specialties, address, approval_status, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', 1)");
            $stmt->execute([$name, $location, $email, $username, $password, $reg, $desc, $phone, $type, $specs, $address]);

            echo json_encode(['status' => 'success', 'message' => 'Hospital added successfully']);
            break;

        case 'update':
            $id = $data['id'] ?? null;
            if (!$id) {
                throw new Exception('Hospital ID missing');
            }

            $name = $data['hosp_name'] ?? '';
            $location = $data['location'] ?? '';
            $desc = $data['description'] ?? '';
            $phone = $data['phone'] ?? '';
            $type = $data['hospital_type'] ?? 'Private';
            $specs = $data['specialties'] ?? '';
            $address = $data['address'] ?? '';

            $stmt = $pdo->prepare("UPDATE hospitals SET hosp_name = ?, location = ?, description = ?, phone = ?, hospital_type = ?, specialties = ?, address = ? WHERE id = ?");
            $stmt->execute([$name, $location, $desc, $phone, $type, $specs, $address, $id]);

            echo json_encode(['status' => 'success', 'message' => 'Hospital updated successfully']);
            break;

        case 'delete':
            $id = $data['id'] ?? null;
            if (!$id) {
                throw new Exception('Hospital ID missing');
            }

            $stmt = $pdo->prepare("DELETE FROM hospitals WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode(['status' => 'success', 'message' => 'Hospital removed successfully']);
            break;

        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
