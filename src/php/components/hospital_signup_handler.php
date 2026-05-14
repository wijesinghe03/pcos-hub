<?php

/**
 * PCOS CARE HUB — Hospital Signup Handler (hospital_signup_handler.php)
 * Step 1 of 2: Validates form, saves to hospital_verifications, sends OTP.
 * Step 2 is verify_hospital_email.php.
 */

require_once '../db_connect.php';
require_once '../utils/Mailer.php';
header('Content-Type: application/json');

use App\Utils\Mailer;

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
    exit;
}

// ── Validate required fields ───────────────────────────────────────────────
$required = ['hosp_name', 'username', 'email', 'password', 'reg_number'];
foreach ($required as $field) {
    if (empty($_POST[$field])) {
        echo json_encode(['status' => 'error', 'message' => "Field '$field' is required."]);
        exit;
    }
}

$hospName     = trim($_POST['hosp_name']);
$username     = trim($_POST['username']);
$email        = trim($_POST['email']);
$rawPassword  = $_POST['password'];
$regNumber    = trim($_POST['reg_number']);
$phone        = trim($_POST['phone']        ?? '');
$address      = trim($_POST['address']      ?? '');
$location     = trim($_POST['location']     ?? '');
$contactFname = trim($_POST['contact_fname'] ?? (explode(' ', trim($_POST['contact_person'] ?? ''))[0] ?? ''));
$contactLname = trim($_POST['contact_lname'] ?? (implode(' ', array_slice(explode(' ', trim($_POST['contact_person'] ?? '')), 1)) ?: ''));
// support old combined field
if (isset($_POST['contact_person']) && !isset($_POST['contact_fname'])) {
    $parts        = explode(' ', trim($_POST['contact_person']), 2);
    $contactFname = $parts[0] ?? '';
    $contactLname = $parts[1] ?? '';
}
$hospitalType = trim($_POST['hospital_type'] ?? '');
$specialties  = trim($_POST['specialties']   ?? '');

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid email address.']);
    exit;
}

// Validate password length
if (strlen($rawPassword) < 8) {
    echo json_encode(['status' => 'error', 'message' => 'Password must be at least 8 characters.']);
    exit;
}

$passwordHash = password_hash($rawPassword, PASSWORD_BCRYPT);

// ── Check duplicates in registered_hospitals ───────────────────────────────
try {
    $dup = $pdo->prepare(
        "SELECT id FROM registered_hospitals WHERE email = ? OR username = ? OR reg_number = ? LIMIT 1"
    );
    $dup->execute([$email, $username, $regNumber]);
    if ($dup->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'Username, Email, or Registration Number already exists. Please sign in or contact support.']);
        exit;
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error during duplicate check.']);
    exit;
}

// ── Generate 6-digit OTP ───────────────────────────────────────────────────
$otp       = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
$expiresAt = date('Y-m-d H:i:s', strtotime('+15 minutes'));

// ── Upsert into hospital_verifications ────────────────────────────────────
try {
    $stmt = $pdo->prepare("
        INSERT INTO hospital_verifications
            (hosp_name, username, email, password_hash, reg_number,
             phone, address, location, contact_fname, contact_lname,
             hospital_type, specialties, otp_code, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            hosp_name     = VALUES(hosp_name),
            username      = VALUES(username),
            password_hash = VALUES(password_hash),
            reg_number    = VALUES(reg_number),
            phone         = VALUES(phone),
            address       = VALUES(address),
            location      = VALUES(location),
            contact_fname = VALUES(contact_fname),
            contact_lname = VALUES(contact_lname),
            hospital_type = VALUES(hospital_type),
            specialties   = VALUES(specialties),
            otp_code      = VALUES(otp_code),
            expires_at    = VALUES(expires_at),
            created_at    = CURRENT_TIMESTAMP
    ");
    $stmt->execute([
        $hospName, $username, $email, $passwordHash, $regNumber,
        $phone, $address, $location, $contactFname, $contactLname,
        $hospitalType, $specialties, $otp, $expiresAt
    ]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Could not save verification. Please try again.']);
    exit;
}

// ── Handle document uploads — store in temp folder keyed by email ──────────
$tempUploadDir = dirname(__FILE__, 4) . '/uploads/hospital_docs_temp/' . md5($email) . '/';
if (!empty($_FILES['approval_documents']['name'][0])) {
    if (!is_dir($tempUploadDir)) {
        mkdir($tempUploadDir, 0755, true);
    }
    $allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    $maxFileSize  = 5 * 1024 * 1024;
    $files = $_FILES['approval_documents'];
    $count = count($files['name']);
    for ($i = 0; $i < $count; $i++) {
        if ($files['error'][$i] !== UPLOAD_ERR_OK) {
            continue;
        }
        if ($files['size'][$i] > $maxFileSize) {
            continue;
        }
        $finfo    = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($files['tmp_name'][$i]);
        if (!in_array($mimeType, $allowedTypes)) {
            continue;
        }
        $ext      = pathinfo($files['name'][$i], PATHINFO_EXTENSION);
        $safeName = 'doc_' . time() . '_' . $i . '.' . $ext;
        move_uploaded_file($files['tmp_name'][$i], $tempUploadDir . $safeName);
    }
}

// ── Send OTP Email ─────────────────────────────────────────────────────────
$emailBody = "
    <p>Hello <strong>" . htmlspecialchars($hospName) . "</strong> Team,</p>
    <p>Thank you for registering with <strong>PCOS Care Hub</strong>!</p>
    <p>To verify your hospital email address, please enter the code below:</p>
    <div style='text-align:center; margin: 30px 0;'>
        <div style='display:inline-block; background: linear-gradient(135deg, #3498db, #2980b9);
                    color: white; font-size: 36px; font-weight: bold; letter-spacing: 12px;
                    padding: 20px 40px; border-radius: 14px;
                    box-shadow: 0 8px 24px rgba(52,152,219,0.35);'>
            $otp
        </div>
    </div>
    <p style='text-align:center; color: #666; font-size: 0.9rem;'>This code will expire in <strong>15 minutes</strong>.</p>
    <p>After verification, your application will be reviewed by our admin team and you will receive a confirmation email once approved.</p>
    <p>If you did not request this, please ignore this email.</p>
";

$sent = Mailer::send($email, 'Verify Your Hospital Email — PCOS Care Hub', $emailBody);

if (!$sent) {
    echo json_encode(['status' => 'error', 'message' => 'Failed to send verification email. Please check your email address and try again.']);
    exit;
}

echo json_encode([
    'status'  => 'otp_sent',
    'message' => 'Verification code sent to ' . $email . '. Please check your inbox.'
]);
