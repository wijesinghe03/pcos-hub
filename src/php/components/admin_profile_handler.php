<?php

/**
 * PCOS CARE HUB — Admin Profile Handler (admin_profile_handler.php)
 * Handles CRUD for Admin Profiles.
 */

header('Content-Type: application/json');
require_once '../db_connect.php';

$jsonRaw   = file_get_contents('php://input');
$jsonInput = !empty($jsonRaw) ? json_decode($jsonRaw, true) : null;

$adminId = $jsonInput['admin_id'] ?? ($_POST['admin_id'] ?? ($_GET['admin_id'] ?? null));

if (!$adminId) {
    echo json_encode(['status' => 'error', 'message' => 'Admin ID missing']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare("SELECT id, full_name, email, username, avatar, role FROM admin_users WHERE id = ?");
        $stmt->execute([$adminId]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($admin) {
            echo json_encode(['status' => 'success', 'data' => $admin]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Admin profile not found']);
        }
    } catch (\PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data   = $jsonInput ?? $_POST;
    $action = $data['action'] ?? 'update_profile';

    if ($action === 'update_profile') {
        $fullName = $data['full_name'] ?? '';
        $email    = $data['email'] ?? '';
        $username = $data['username'] ?? '';

        if (empty($fullName) || empty($email) || empty($username)) {
            echo json_encode(['status' => 'error', 'message' => 'All fields are required']);
            exit;
        }

        try {
            // Check if username or email exists for another user
            $check = $pdo->prepare("SELECT id FROM admin_users WHERE (username = ? OR email = ?) AND id != ?");
            $check->execute([$username, $email, $adminId]);
            if ($check->fetch()) {
                echo json_encode(['status' => 'error', 'message' => 'Username or Email already in use']);
                exit;
            }

            $stmt = $pdo->prepare("UPDATE admin_users SET full_name = ?, email = ?, username = ? WHERE id = ?");
            $stmt->execute([$fullName, $email, $username, $adminId]);
            echo json_encode(['status' => 'success', 'message' => 'Profile updated successfully']);
        } catch (\PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    } elseif ($action === 'update_password') {
        $curPass = $data['current_password'] ?? '';
        $newPass = $data['new_password'] ?? '';

        try {
            $stmt = $pdo->prepare("SELECT password FROM admin_users WHERE id = ?");
            $stmt->execute([$adminId]);
            $admin = $stmt->fetch();

            if ($admin && password_verify($curPass, $admin['password'])) {
                $hash = password_hash($newPass, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("UPDATE admin_users SET password = ? WHERE id = ?");
                $stmt->execute([$hash, $adminId]);
                echo json_encode(['status' => 'success', 'message' => 'Password updated!']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Incorrect current password']);
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
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($ext, $allowed)) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid file type.']);
            exit;
        }
        $fileName = 'admin_' . $adminId . '_' . time() . '.' . $ext;
        $baseDir = dirname(dirname(dirname(__DIR__)));
        $targetDir = $baseDir . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'profiles' . DIRECTORY_SEPARATOR;
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }
        $targetPath = $targetDir . $fileName;
        $dbPath = 'uploads/profiles/' . $fileName;
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            try {
                $stmt = $pdo->prepare("UPDATE admin_users SET avatar = ? WHERE id = ?");
                $stmt->execute([$dbPath, $adminId]);
                echo json_encode(['status' => 'success', 'avatar' => $dbPath]);
            } catch (\PDOException $e) {
                echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Upload failed']);
        }
    }
}
