<?php
/**
 * PCOS CARE HUB — Verify Patient Email OTP (verify_patient_email.php)
 * Validates the OTP, creates the patient account, and returns a session.
 */

require_once '../db_connect.php';
require_once __DIR__ . '/../utils/Logger.php';
require_once __DIR__ . '/../utils/Mailer.php';
session_start();
header('Content-Type: application/json');

use App\Utils\Logger;
use App\Utils\Mailer;

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data || empty($data['email']) || empty($data['otp'])) {
    echo json_encode(['status' => 'error', 'message' => 'Email and verification code are required.']);
    exit;
}

$email = trim($data['email']);
$otp   = trim($data['otp']);

// Fetch the pending verification record
try {
    $stmt = $pdo->prepare("SELECT * FROM patient_verifications WHERE email = ?");
    $stmt->execute([$email]);
    $pending = $stmt->fetch();
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error. Please try again.']);
    exit;
}

if (!$pending) {
    echo json_encode(['status' => 'error', 'message' => 'No pending verification found for this email. Please start over.']);
    exit;
}

// Check expiry
if (strtotime($pending['expires_at']) < time()) {
    // Clean up expired record
    $pdo->prepare("DELETE FROM patient_verifications WHERE email = ?")->execute([$email]);
    echo json_encode(['status' => 'expired', 'message' => 'Your verification code has expired. Please sign up again.']);
    exit;
}

// Check OTP
if ($pending['otp_code'] !== $otp) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid verification code. Please check your email and try again.']);
    exit;
}

// OTP is valid — create the patient account
try {
    $insert = $pdo->prepare("
        INSERT INTO patients (full_name, username, email, password, dob, phone, gender, address, blood_group)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $insert->execute([
        $pending['full_name'],
        $pending['username'],
        $pending['email'],
        $pending['password_hash'],
        $pending['dob'],
        $pending['phone'],
        $pending['gender'],
        $pending['address'],
        $pending['blood_group']
    ]);
    $newId = $pdo->lastInsertId();

    // Delete the pending record
    $pdo->prepare("DELETE FROM patient_verifications WHERE email = ?")->execute([$email]);

    // Set PHP session
    $_SESSION['user_id']   = $newId;
    $_SESSION['user_role'] = 'patient';
    $_SESSION['user_name'] = $pending['full_name'];

    // Log the event
    Logger::log('auth', 'info', "New patient verified and registered: " . $pending['username'], $pending['full_name']);

    // Send welcome email
    try {
        $name = $pending['full_name'];
        $welcomeBody = "
            <p>Hi <strong>" . htmlspecialchars($name) . "</strong>,</p>
            <p>Welcome to <strong>PCOS Care Hub</strong>! Your account has been successfully verified and created. 🎉</p>
            <p>You can now:</p>
            <ul>
                <li>Track your symptoms and menstrual cycles</li>
                <li>Connect with PCOS-specialized hospitals</li>
                <li>Upload and manage your health records</li>
                <li>Log your lifestyle and nutrition</li>
            </ul>
            <p>We're here to support you every step of the way.</p>
        ";
        Mailer::send($email, 'Welcome to PCOS Care Hub! 💜', $welcomeBody);
    } catch (Throwable $e) {
        // Welcome email failure is non-blocking
        error_log("Welcome email failed: " . $e->getMessage());
    }

    echo json_encode([
        'status'  => 'success',
        'message' => 'Email verified! Your account is ready.',
        'user'    => [
            'id'       => $newId,
            'name'     => $pending['full_name'],
            'role'     => 'patient',
            'email'    => $pending['email'],
            'username' => $pending['username'],
            'dob'      => $pending['dob'],
            'phone'    => $pending['phone'],
            'gender'   => $pending['gender'],
            'address'  => $pending['address'],
            'status'   => 'active'
        ]
    ]);
} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        // Cleanup duplicate
        $pdo->prepare("DELETE FROM patient_verifications WHERE email = ?")->execute([$email]);
        echo json_encode(['status' => 'error', 'message' => 'An account with this email or username already exists.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Account creation failed: ' . $e->getMessage()]);
    }
}
