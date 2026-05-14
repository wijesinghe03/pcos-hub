<?php

header('Content-Type: application/json');
require_once 'db_connect.php';

$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = trim($data['token'] ?? '');
    $email = trim($data['email'] ?? '');
    $role = trim($data['role'] ?? '');
    $newPassword = trim($data['new_password'] ?? '');

    if (empty($token) || empty($email) || empty($newPassword)) {
        echo json_encode(['status' => 'error', 'message' => 'All fields are required.']);
        exit;
    }

    try {
        // Verify token
        $stmt = $pdo->prepare("SELECT id FROM password_resets WHERE email = ? AND token = ? AND role = ? AND expires_at > NOW() LIMIT 1");
        $stmt->execute([$email, $token, $role]);
        $resetRequest = $stmt->fetch();

        if (!$resetRequest) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid or expired reset token. Please request a new one.']);
            exit;
        }

        // Determine target table
        $table = '';
        switch ($role) {
            case 'patient':
                $table = 'patients';
                break;
            case 'hospital':
                $table = 'hospitals';
                break;
            case 'admin':
                $table = 'admin_users';
                break;
            default:
                echo json_encode(['status' => 'error', 'message' => 'Invalid role.']);
                exit;
        }

        // Hash new password
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

        // Update password in the user table
        $stmt = $pdo->prepare("UPDATE $table SET password = ? WHERE email = ?");
        $stmt->execute([$hashedPassword, $email]);

        if ($stmt->rowCount() > 0) {
            // Delete the token
            $pdo->prepare("DELETE FROM password_resets WHERE email = ? AND role = ?")->execute([$email, $role]);

            echo json_encode(['status' => 'success', 'message' => 'Your password has been successfully updated. You can now log in.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to update password. Please try again.']);
        }
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'An error occurred: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
