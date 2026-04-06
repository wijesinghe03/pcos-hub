<?php
/**
 * PCOS CARE HUB — Profile Handler (profile_handler.php)
 * CRUD for Patient Profile, Password, and Avatar.
 */

header('Content-Type: application/json');
require_once '../db_connect.php';

// Identity Handling (JSON vs Multipart)
$jsonRaw = file_get_contents('php://input');
$jsonInput = !empty($jsonRaw) ? json_decode($jsonRaw, true) : null;

// Try JSON first, then $_POST, then $_GET
$user_id = $jsonInput['patient_id'] ?? ($_POST['patient_id'] ?? ($_GET['patient_id'] ?? null));

if (!$user_id) {
    echo json_encode([
        'status' => 'error', 
        'message' => 'User identity missing (patient_id)',
        'debug' => ['json' => $jsonInput, 'post' => $_POST, 'get' => $_GET]
    ]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// Handle GET
if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare("SELECT id, full_name, email, username, dob, gender, phone, address, blood_group, avatar, status FROM patients WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            echo json_encode(['status' => 'success', 'data' => $user]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Profile not found with ID: ' . $user_id]);
        }
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

// Handle POST
else if ($method === 'POST') {
    $data = $jsonInput ?? $_POST;
    $action = $data['action'] ?? 'update_profile';

    // 1. Update Profile (Name, Phone, DOB, Gender, Address, etc.)
    if ($action === 'update_profile') {
        $full_name = $data['full_name'] ?? '';
        $phone = $data['phone'] ?? '';
        $dob = $data['dob'] ?? null;
        $gender = $data['gender'] ?? null;
        $address = $data['address'] ?? null;
        $blood_group = $data['blood_group'] ?? null;

        if (empty($full_name)) {
            echo json_encode(['status' => 'error', 'message' => 'Name cannot be empty']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("UPDATE patients SET full_name = ?, phone = ?, dob = ?, gender = ?, address = ?, blood_group = ? WHERE id = ?");
            $stmt->execute([$full_name, $phone, $dob, $gender, $address, $blood_group, $user_id]);
            echo json_encode(['status' => 'success', 'message' => 'Profile updated successfully']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    // 2. Update Password
    else if ($action === 'update_password') {
        $cur_pass = $data['current_password'] ?? '';
        $new_pass = $data['new_password'] ?? '';

        try {
            // Verify current password
            $stmt = $pdo->prepare("SELECT password FROM patients WHERE id = ?");
            $stmt->execute([$user_id]);
            $user = $stmt->fetch();

            if ($user && password_verify($cur_pass, $user['password'])) {
                $hash = password_hash($new_pass, PASSWORD_DEFAULT);
                $pdo->prepare("UPDATE patients SET password = ? WHERE id = ?")->execute([$hash, $user_id]);
                echo json_encode(['status' => 'success', 'message' => 'Password updated!']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Incorrect current password']);
            }
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    // 3. Deactivate Account
    else if ($action === 'deactivate') {
        $password = $jsonInput['password'] ?? ($_POST['password'] ?? '');
        
        try {
            // Verify password first
            $stmt = $pdo->prepare("SELECT password FROM patients WHERE id = ?");
            $stmt->execute([$user_id]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password'])) {
                $pdo->prepare("UPDATE patients SET status = 'deactivated', deactivated_at = NOW() WHERE id = ?")->execute([$user_id]);
                echo json_encode(['status' => 'success', 'message' => 'Account deactivated successfully']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Incorrect password. Deactivation aborted.']);
            }
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    // 4. Update Avatar
    else if ($action === 'update_avatar') {
        if (!isset($_FILES['avatar'])) {
            echo json_encode(['status' => 'error', 'message' => 'No avatar file provided (CHECK FILES ARRAY)']);
            exit;
        }

        $file = $_FILES['avatar'];
        
        // Handle upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            echo json_encode(['status' => 'error', 'message' => 'PHP Upload Error: ' . $file['error']]);
            exit;
        }

        $ext  = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($ext, $allowed)) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid file type. Allowed: ' . implode(', ', $allowed)]);
            exit;
        }

        $fileName = 'profile_' . $user_id . '_' . time() . '.' . $ext;
        
        // Robust absolute path calculation
        $baseDir = dirname(dirname(dirname(__DIR__))); // Up 3: src/php/components -> src/php -> src -> root
        $targetDir = $baseDir . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'profiles' . DIRECTORY_SEPARATOR;
        
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }

        $targetPath = $targetDir . $fileName;
        $dbPath = 'uploads/profiles/' . $fileName;

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            try {
                $pdo->prepare("UPDATE patients SET avatar = ? WHERE id = ?")->execute([$dbPath, $user_id]);
                echo json_encode(['status' => 'success', 'avatar' => $dbPath, 'message' => 'Avatar updated!']);
            } catch (PDOException $e) {
                echo json_encode(['status' => 'error', 'message' => 'DB Update Fail: ' . $e->getMessage()]);
            }
        } else {
            $err = error_get_last();
            echo json_encode(['status' => 'error', 'message' => 'Filesystem error: ' . ($err['message'] ?? 'Unknown Move Error') . ' Target: ' . $targetPath]);
        }
    }
    
    // Unknown action
    else {
        echo json_encode(['status' => 'error', 'message' => 'Action unrecognized: ' . $action]);
    }
}
?>
