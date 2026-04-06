<?php
/**
 * PCOS CARE HUB — My Hospital Handler (Unified Authentication)
 * Updated 2026-04-06: Added robust ID detection & set-primary action.
 */

header('Content-Type: application/json');
require_once '../db_connect.php';

// Auth: We rely on the frontend sending patient_id since sessions aren't persistent 
// in this environment across different handler requests if not explicitly managed.
$jsonInput = json_decode(file_get_contents('php://input'), true);
$method = $_SERVER['REQUEST_METHOD'];

// Detection of user_id from various sources
$user_id = $jsonInput['patient_id'] ?? ($_GET['patient_id'] ?? ($_POST['patient_id'] ?? null));

if (!$user_id) {
    echo json_encode(['status' => 'error', 'message' => 'User identity not found in request (patient_id missing)']);
    exit;
}

// Handle GET
if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare("SELECT * FROM patient_hospitals WHERE patient_id = ? ORDER BY is_primary DESC, registered_at DESC");
        $stmt->execute([$user_id]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['status' => 'success', 'data' => $rows]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

// Handle POST
else if ($method === 'POST') {
    $data = $jsonInput ?? $_POST;
    $action = $data['action'] ?? 'save';

    if ($action === 'save') {
        $hospital_name = $data['hospital_name'] ?? '';
        $address = $data['address'] ?? '';
        $contact = $data['contact_number'] ?? '';
        $email = $data['email'] ?? '';
        $website = $data['website'] ?? '';
        $specialist = $data['specialist_doctor'] ?? '';
        $is_primary = $data['is_primary'] ?? 0;

        if (empty($hospital_name)) {
            echo json_encode(['status' => 'error', 'message' => 'Hospital name is required']);
            exit;
        }

        try {
            if ($is_primary == 1) {
                $pdo->prepare("UPDATE patient_hospitals SET is_primary = 0 WHERE patient_id = ?")->execute([$user_id]);
            }
            $stmt = $pdo->prepare("INSERT INTO patient_hospitals (patient_id, hospital_name, address, contact_number, email, website, specialist_doctor, is_primary) 
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$user_id, $hospital_name, $address, $contact, $email, $website, $specialist, $is_primary]);
            echo json_encode(['status' => 'success', 'message' => 'Hospital registered successfully']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    else if ($action === 'set-primary') {
        $id = $data['id'] ?? null;
        if (!$id) exit;
        try {
            $pdo->prepare("UPDATE patient_hospitals SET is_primary = 0 WHERE patient_id = ?")->execute([$user_id]);
            $pdo->prepare("UPDATE patient_hospitals SET is_primary = 1 WHERE id = ? AND patient_id = ?")->execute([$id, $user_id]);
            echo json_encode(['status' => 'success', 'message' => 'Primary provider updated']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    else if ($action === 'delete') {
        $id = $data['id'] ?? null;
        if (!$id) {
            echo json_encode(['status' => 'error', 'message' => 'ID missing for deletion']);
            exit;
        }
        try {
            $stmt = $pdo->prepare("DELETE FROM patient_hospitals WHERE id = ? AND patient_id = ?");
            $stmt->execute([$id, $user_id]);
            if ($stmt->rowCount() > 0) {
                echo json_encode(['status' => 'success', 'message' => 'Hospital removed from registry']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Registration not found or already deleted']);
            }
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}
?>
