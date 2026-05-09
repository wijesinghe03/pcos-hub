<?php

/**
 * PCOS CARE HUB — Profile Handler (profile_handler.php)
 * CRUD for Patient Profile, Password, and Avatar.
 */

header('Content-Type: application/json');
require_once '../db_connect.php';

// Identity Handling (JSON vs Multipart)
$jsonRaw   = file_get_contents('php://input');
$jsonInput = !empty($jsonRaw) ? json_decode($jsonRaw, true) : null;

// Try JSON first, then $_POST, then $_GET
$userId = $jsonInput['patient_id'] ?? ($_POST['patient_id'] ?? ($_GET['patient_id'] ?? null));

if (!$userId) {
    echo json_encode(['status' => 'error', 'message' => 'User identity missing (patient_id)']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// Handle GET
if ($method === 'GET') {
    try {
        $sql  = "SELECT id, full_name, email, username, dob, gender,";
        $sql .= " phone, address, blood_group, avatar, status FROM patients WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            echo json_encode(['status' => 'success', 'data' => $user]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Profile not found']);
        }
    } catch (\PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data   = $jsonInput ?? $_POST;
    $action = $data['action'] ?? 'update_profile';

    if ($action === 'update_profile') {
        $fullName   = $data['full_name'] ?? '';
        $phone      = $data['phone'] ?? '';
        $dob        = $data['dob'] ?? null;
        $gender     = $data['gender'] ?? null;
        $address    = $data['address'] ?? null;
        $bloodGroup = $data['blood_group'] ?? null;

        if (empty($fullName)) {
            echo json_encode(['status' => 'error', 'message' => 'Name cannot be empty']);
            exit;
        }

        try {
            $sql  = "UPDATE patients SET full_name = ?, phone = ?, dob = ?,";
            $sql .= " gender = ?, address = ?, blood_group = ? WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$fullName, $phone, $dob, $gender, $address, $bloodGroup, $userId]);
            echo json_encode(['status' => 'success', 'message' => 'Profile updated successfully']);
        } catch (\PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    } elseif ($action === 'update_password') {
        $curPass = $data['current_password'] ?? '';
        $newPass = $data['new_password'] ?? '';

        try {
            $stmt = $pdo->prepare("SELECT password FROM patients WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();

            if ($user && password_verify($curPass, $user['password'])) {
                $hash   = password_hash($newPass, PASSWORD_DEFAULT);
                $update = $pdo->prepare("UPDATE patients SET password = ? WHERE id = ?");
                $update->execute([$hash, $userId]);
                echo json_encode(['status' => 'success', 'message' => 'Password updated!']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Incorrect current password']);
            }
        } catch (\PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    } elseif ($action === 'deactivate') {
        $password = $jsonInput['password'] ?? ($_POST['password'] ?? '');

        try {
            $stmt = $pdo->prepare("SELECT password FROM patients WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password'])) {
                $update = $pdo->prepare(
                    "UPDATE patients SET status = 'deactivated', deactivated_at = NOW() WHERE id = ?"
                );
                $update->execute([$userId]);
                echo json_encode(['status' => 'success', 'message' => 'Account deactivated successfully']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Incorrect password. Deactivation aborted.']);
            }
        } catch (\PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    } elseif ($action === 'update_avatar') {
        if (!isset($_FILES['avatar'])) {
            echo json_encode(['status' => 'error', 'message' => 'No avatar file provided']);
            exit;
        }

        $file = $_FILES['avatar'];

        if ($file['error'] !== UPLOAD_ERR_OK) {
            echo json_encode(['status' => 'error', 'message' => 'PHP Upload Error: ' . $file['error']]);
            exit;
        }

        $ext     = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

        if (!in_array($ext, $allowed)) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid file type.']);
            exit;
        }

        $fileName  = 'profile_' . $userId . '_' . time() . '.' . $ext;
        $baseDir   = dirname(dirname(dirname(__DIR__)));
        $targetDir = $baseDir . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'profiles' . DIRECTORY_SEPARATOR;

        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }

        $targetPath = $targetDir . $fileName;
        $dbPath     = 'uploads/profiles/' . $fileName;

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            try {
                $update = $pdo->prepare("UPDATE patients SET avatar = ? WHERE id = ?");
                $update->execute([$dbPath, $userId]);
                echo json_encode(['status' => 'success', 'avatar' => $dbPath, 'message' => 'Avatar updated!']);
            } catch (\PDOException $e) {
                echo json_encode(['status' => 'error', 'message' => 'DB Error: ' . $e->getMessage()]);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Filesystem error moving uploaded file']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Action unrecognized: ' . $action]);
    }
}
