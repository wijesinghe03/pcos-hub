<?php

/**
 * PCOS CARE HUB — Unified Login Handler (login_handler.php)
 * Handles isolated logins for Patients, Hospitals, and Admins.
 */

require_once '../db_connect.php';
require_once __DIR__ . '/../utils/Logger.php';
session_start();
header('Content-Type: application/json');

use App\Utils\Logger;

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
            // Check if this is an admin and if 2FA is required
            if ($role === 'admin') {
                // Generate 6-digit MFA code
                $mfaCode = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
                $expiresAt = date('Y-m-d H:i:s', strtotime('+10 minutes'));

                // Save code to database
                $updateMfa = $pdo->prepare("UPDATE admin_users SET mfa_code = ?, mfa_expires_at = ? WHERE id = ?");
                $updateMfa->execute([$mfaCode, $expiresAt, $user['id']]);

                // Send Email
                require_once __DIR__ . '/../utils/Mailer.php';
                $emailSubject = "Your Administrative Verification Code";
                $emailBody = "<p>Hello <strong>" . htmlspecialchars($user['full_name'] ?? $user['username']) . "</strong>,</p>
                              <p>You recently attempted to sign in to the PCOS Care Hub Administrative Portal.</p>
                              <p style='font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #6a11cb; text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px;'>$mfaCode</p>
                              <p>This code will expire in 10 minutes. If you did not attempt to sign in, please contact system security immediately.</p>";

                \App\Utils\Mailer::send($user['email'], $emailSubject, $emailBody);

                echo json_encode([
                    'status' => 'mfa_required',
                    'message' => 'A verification code has been sent to your registered email.',
                    'admin_id' => $user['id']
                ]);
                return;
            }

            // Determine display name based on role
            $displayName = '';
            if ($role === 'hospital') {
                $displayName = $user['hosp_name'] ?? 'Hospital User';
            } else {
                $displayName = $user['full_name'] ?? ($user['username'] ?? 'User');
            }

            // Set PHP Session for backend security
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_role'] = $role;
            $_SESSION['user_name'] = $displayName;

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
            Logger::log('auth', 'warning', "Failed login attempt for " . $role . " (" . $identity . "): " . $reason, 'AuthGuard');

            echo json_encode(['status' => 'error', 'message' => 'Invalid credentials for ' . $role . ' portal. (Reason: ' . $reason . ')']);
        }
    } catch (PDOException $e) {
        Logger::log('database', 'error', 'Login system error: ' . $e->getMessage(), 'System');
        echo json_encode(['status' => 'error', 'message' => 'System error: ' . $e->getMessage()]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    handleLogin($pdo);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
