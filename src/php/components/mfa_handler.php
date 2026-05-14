<?php

/**
 * mfa_handler.php
 * Handles verification of 2FA codes for administrators.
 */

require_once '../db_connect.php';
require_once __DIR__ . '/../utils/Logger.php';
session_start();
header('Content-Type: application/json');

use App\Utils\Logger;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
    exit;
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data || !isset($data['admin_id']) || !isset($data['code'])) {
    echo json_encode(['status' => 'error', 'message' => 'Admin ID and verification code are required.']);
    exit;
}

$adminId = $data['admin_id'];
$code = trim($data['code']);

try {
    $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE id = ?");
    $stmt->execute([$adminId]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(['status' => 'error', 'message' => 'Administrator account not found.']);
        exit;
    }

    if ($user['mfa_code'] === $code && strtotime($user['mfa_expires_at']) > time()) {
        // Clear MFA code
        $clearMfa = $pdo->prepare("UPDATE admin_users SET mfa_code = NULL, mfa_expires_at = NULL WHERE id = ?");
        $clearMfa->execute([$adminId]);

        // Complete Login
        $displayName = $user['full_name'] ?? ($user['username'] ?? 'Admin');
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['user_name'] = $displayName;

        Logger::log('auth', 'info', "Admin logged in via MFA: " . $user['username'], $displayName);

        echo json_encode([
            'status' => 'success',
            'message' => 'MFA verification successful.',
            'user' => [
                'id' => $user['id'],
                'name' => $displayName,
                'role' => $user['role'],
                'email' => $user['email'],
                'username' => $user['username'],
                'avatar' => $user['avatar'] ?? null
            ]
        ]);
    } else {
        $reason = ($user['mfa_code'] !== $code) ? 'Incorrect code' : 'Code expired';
        Logger::log('auth', 'warning', "Failed MFA attempt for " . $user['username'] . ": " . $reason, 'MFA-Guard');
        echo json_encode(['status' => 'error', 'message' => 'Invalid or expired verification code.']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'System error: ' . $e->getMessage()]);
}
