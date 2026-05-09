<?php

/**
 * PCOS CARE HUB — My Hospital Handler
 * Updated: Added robust ID detection & set-primary action.
 */

header('Content-Type: application/json');
require_once '../db_connect.php';

$jsonInput = json_decode(file_get_contents('php://input'), true);
$method    = $_SERVER['REQUEST_METHOD'];

$userId = $jsonInput['patient_id'] ?? ($_GET['patient_id'] ?? ($_POST['patient_id'] ?? null));

if (!$userId) {
    echo json_encode(['status' => 'error', 'message' => 'User identity not found (patient_id missing)']);
    exit;
}

if ($method === 'GET') {
    try {
        $sql  = "SELECT * FROM patient_hospitals WHERE patient_id = ?";
        $sql .= " ORDER BY is_primary DESC, registered_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['status' => 'success', 'data' => $rows]);
    } catch (\PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data   = $jsonInput ?? $_POST;
    $action = $data['action'] ?? 'save';

    if ($action === 'save') {
        $hospitalName = $data['hospital_name'] ?? '';
        $address      = $data['address'] ?? '';
        $contact      = $data['contact_number'] ?? '';
        $email        = $data['email'] ?? '';
        $website      = $data['website'] ?? '';
        $specialist   = $data['specialist_doctor'] ?? '';
        $isPrimary    = $data['is_primary'] ?? 0;

        if (empty($hospitalName)) {
            echo json_encode(['status' => 'error', 'message' => 'Hospital name is required']);
            exit;
        }

        try {
            if ($isPrimary == 1) {
                $reset = $pdo->prepare("UPDATE patient_hospitals SET is_primary = 0 WHERE patient_id = ?");
                $reset->execute([$userId]);
            }

            $sql  = "INSERT INTO patient_hospitals";
            $sql .= " (patient_id, hospital_name, address, contact_number, email, website, specialist_doctor, is_primary)";
            $sql .= " VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$userId, $hospitalName, $address, $contact, $email, $website, $specialist, $isPrimary]);
            echo json_encode(['status' => 'success', 'message' => 'Hospital registered successfully']);
        } catch (\PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    } elseif ($action === 'set-primary') {
        $id = $data['id'] ?? null;
        if (!$id) {
            echo json_encode(['status' => 'error', 'message' => 'ID missing']);
            exit;
        }

        try {
            $reset = $pdo->prepare("UPDATE patient_hospitals SET is_primary = 0 WHERE patient_id = ?");
            $reset->execute([$userId]);
            $update = $pdo->prepare("UPDATE patient_hospitals SET is_primary = 1 WHERE id = ? AND patient_id = ?");
            $update->execute([$id, $userId]);
            echo json_encode(['status' => 'success', 'message' => 'Primary provider updated']);
        } catch (\PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    } elseif ($action === 'delete') {
        $id = $data['id'] ?? null;
        if (!$id) {
            echo json_encode(['status' => 'error', 'message' => 'ID missing for deletion']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM patient_hospitals WHERE id = ? AND patient_id = ?");
            $stmt->execute([$id, $userId]);
            if ($stmt->rowCount() > 0) {
                echo json_encode(['status' => 'success', 'message' => 'Hospital removed from registry']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Registration not found or already deleted']);
            }
        } catch (\PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}
