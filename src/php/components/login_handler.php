<?php

/**
 * PCOS CARE HUB — Unified Login Handler (login_handler.php)
 * Handles isolated logins for Patients, Hospitals, and Admins.
 */

require_once '../db_connect.php';
header('Content-Type: application/json');

function handleLogin($pdo)
{

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    if (!$data || !isset($data['identity']) || !isset($data['password']) || !isset($data['role'])) {
        echo json_encode(['status' => 'error', 'message' => 'Identity, password, and role are required.']);
        return;
    }

    $identity = trim($data['identity']);
    $password = trim($data['password']);
    $role = $data['role'];
// patient, hospital, or admin

    // Determine which table to search based on Role
    $tableMap = [
        'patient' => 'patients',
        'hospital' => 'hospitals',
        'admin' => 'admin_users'
    ];
    if (!isset($tableMap[$role])) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid role path.']);
        return;
    }

    $targetTable = $tableMap[$role];
    try {
    // Find user by email or username in the SPECIFIC table
        $stmt = $pdo->prepare("SELECT * FROM $targetTable WHERE (email = ? OR username = ?)");
        $stmt->execute([$identity, $identity]);
        $user = $stmt->fetch();
        if ($user && password_verify($password, $user['password'])) {
        // NEW: 30-Day Deactivation / Reactivation Logic for Patients
            if ($role === 'patient' && $user['status'] === 'deactivated') {
                $deactivatedAt = new DateTime($user['deactivated_at']);
                $now = new DateTime();
                $diff = $now->diff($deactivatedAt)->days;
                if ($diff >= 30) {
                // Permanently DELETE after 30 days
                    $del = $pdo->prepare("DELETE FROM patients WHERE id = ?");
                    $del->execute([$user['id']]);
                    echo json_encode(['status' => 'error', 'message' => 'This account was permanently deleted after 30 days of inactivity. Please register as a new patient.']);
                    return;
                } else {
                // REACTIVATE if within 30 days
                    $reactivate = $pdo->prepare("UPDATE patients SET status = 'active', deactivated_at = NULL WHERE id = ?");
                    $reactivate->execute([$user['id']]);
                    $user['status'] = 'active';
                // Update local var for the response
                }
            }

            // Log Success
            require_once __DIR__ . '/../utils/Logger.php';
            Logger::log('auth', 'info', ucfirst($role) . " logged in: " . $identity, $displayName);

            echo json_encode([
                'status' => 'success',
                'message' => ($role === 'patient' && isset($diff) && $diff < 30) ? 'Welcome back! Your account has been reactivated.' : 'Login successful',
                'user' => [
                    'id' => $user['id'],
                    'name' => $displayName,
                    'role' => $role,
                    'email' => $user['email'],
                    'username' => $user['username'],
                    'status' => $user['status'] ?? 'active',
                    'avatar' => $user['avatar'] ?? null,
                    'dob' => $user['dob'] ?? null,
                    'phone' => $user['phone'] ?? null,
                    'gender' => $user['gender'] ?? null,
                    'address' => $user['address'] ?? null,
                    'blood_group' => $user['blood_group'] ?? null,
                    'location' => $user['location'] ?? null,
                    'reg_number' => $user['reg_number'] ?? null,
                    'is_verified' => $user['is_verified'] ?? null
                ]
            ]);
        } else {
            $reason = !$user ? 'User not found' : 'Password mismatch';
            
            // Log Failure
            require_once __DIR__ . '/../utils/Logger.php';
            Logger::log('auth', 'warning', "Failed login attempt for " . $role . " (" . $identity . "): " . $reason, 'AuthGuard');
            
            echo json_encode(['status' => 'error', 'message' => 'Invalid credentials for ' . $role . ' portal. (Reason: ' . $reason . ')']);
        }
    } catch (PDOException $e) {
        require_once __DIR__ . '/../utils/Logger.php';
        Logger::log('database', 'error', 'Login system error: ' . $e->getMessage(), 'System');
        echo json_encode(['status' => 'error', 'message' => 'System error: ' . $e->getMessage()]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    handleLogin($pdo);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
