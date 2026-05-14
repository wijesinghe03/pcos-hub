<?php
/**
 * PCOS CARE HUB — Send Patient Email Verification (send_verification.php)
 * Saves pending signup data and sends a 6-digit OTP to the patient's email.
 */

require_once '../db_connect.php';
require_once '../utils/Mailer.php';
session_start();
header('Content-Type: application/json');

use App\Utils\Mailer;

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data || empty($data['email']) || empty($data['full_name']) || empty($data['password'])) {
    echo json_encode(['status' => 'error', 'message' => 'Required fields are missing.']);
    exit;
}

$email    = trim($data['email']);
$username = trim($data['username']);
$fullName = trim($data['full_name']);

// Check if email or username already exists in main patients table
try {
    $check = $pdo->prepare("SELECT id FROM patients WHERE email = ? OR username = ?");
    $check->execute([$email, $username]);
    if ($check->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'An account with this email or username already exists. Please sign in instead.']);
        exit;
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error. Please try again.']);
    exit;
}

// Generate 6-digit OTP
$otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
$expiresAt = date('Y-m-d H:i:s', strtotime('+15 minutes'));
$passwordHash = password_hash($data['password'], PASSWORD_BCRYPT);

// Upsert into patient_verifications (replace existing pending for same email)
try {
    $stmt = $pdo->prepare("
        INSERT INTO patient_verifications 
            (full_name, username, email, password_hash, dob, phone, gender, address, blood_group, otp_code, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            full_name = VALUES(full_name),
            username  = VALUES(username),
            password_hash = VALUES(password_hash),
            dob = VALUES(dob),
            phone = VALUES(phone),
            gender = VALUES(gender),
            address = VALUES(address),
            blood_group = VALUES(blood_group),
            otp_code = VALUES(otp_code),
            expires_at = VALUES(expires_at),
            created_at = CURRENT_TIMESTAMP
    ");
    $stmt->execute([
        $fullName,
        $username,
        $email,
        $passwordHash,
        $data['dob'] ?? null,
        $data['phone'] ?? null,
        $data['gender'] ?? null,
        $data['address'] ?? null,
        $data['blood_group'] ?? null,
        $otp,
        $expiresAt
    ]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Could not save verification. Please try again.']);
    exit;
}

// Send OTP Email
$emailBody = "
    <p>Hello <strong>" . htmlspecialchars($fullName) . "</strong>,</p>
    <p>Thank you for registering with <strong>PCOS Care Hub</strong>! To complete your account creation, please enter the verification code below:</p>
    <div style='text-align:center; margin: 30px 0;'>
        <div style='display:inline-block; background: linear-gradient(135deg, #7B3FBE, #5B2D8E); color: white; font-size: 36px; font-weight: bold; letter-spacing: 12px; padding: 20px 40px; border-radius: 14px; box-shadow: 0 8px 24px rgba(123,63,190,0.35);'>
            $otp
        </div>
    </div>
    <p style='text-align:center; color: #666; font-size: 0.9rem;'>This code will expire in <strong>15 minutes</strong>.</p>
    <p>If you did not request this, please ignore this email.</p>
";

$sent = Mailer::send($email, 'Verify Your PCOS Care Hub Account', $emailBody);

if (!$sent) {
    echo json_encode(['status' => 'error', 'message' => 'Failed to send verification email. Please check your email address and try again.']);
    exit;
}

echo json_encode([
    'status' => 'success',
    'message' => 'Verification code sent! Please check your email.'
]);
