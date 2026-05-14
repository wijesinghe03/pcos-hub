<?php

/**
 * PCOS CARE HUB — Verify Hospital Email OTP (verify_hospital_email.php)
 * Step 2 of 2: Validates OTP, creates hospital account in registered_hospitals,
 * moves any uploaded temp documents, and returns session data.
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

// ── Fetch the pending verification record ──────────────────────────────────
try {
    $stmt = $pdo->prepare("SELECT * FROM hospital_verifications WHERE email = ?");
    $stmt->execute([$email]);
    $pending = $stmt->fetch();
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error. Please try again.']);
    exit;
}

if (!$pending) {
    echo json_encode(['status' => 'error', 'message' => 'No pending verification found for this email. Please start the signup again.']);
    exit;
}

// ── Check expiry ───────────────────────────────────────────────────────────
if (strtotime($pending['expires_at']) < time()) {
    $pdo->prepare("DELETE FROM hospital_verifications WHERE email = ?")->execute([$email]);
    echo json_encode(['status' => 'expired', 'message' => 'Your verification code has expired. Please sign up again.']);
    exit;
}

// ── Validate OTP ───────────────────────────────────────────────────────────
if ($pending['otp_code'] !== $otp) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid verification code. Please check your email and try again.']);
    exit;
}

// ── OTP valid — insert into registered_hospitals ───────────────────────────
try {
    $contactPerson = trim(($pending['contact_fname'] ?? '') . ' ' . ($pending['contact_lname'] ?? ''));

    $insert = $pdo->prepare("
        INSERT INTO registered_hospitals
            (hosp_name, username, email, password, reg_number, phone, address, location,
             contact_fname, contact_lname, contact_person, hospital_type, specialties,
             approval_status, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0)
    ");
    $insert->execute([
        $pending['hosp_name'],
        $pending['username'],
        $pending['email'],
        $pending['password_hash'],
        $pending['reg_number'],
        $pending['phone'],
        $pending['address'],
        $pending['location'],
        $pending['contact_fname'],
        $pending['contact_lname'],
        $contactPerson,
        $pending['hospital_type'],
        $pending['specialties']
    ]);
    $hospitalId = $pdo->lastInsertId();

    // ── Move temp uploaded docs to permanent storage ───────────────────────
    $tempDir  = dirname(__FILE__, 4) . '/uploads/hospital_docs_temp/' . md5($email) . '/';
    $permDir  = dirname(__FILE__, 4) . '/uploads/hospital_docs/';
    if (!is_dir($permDir)) {
        mkdir($permDir, 0755, true);
    }
    
    if (is_dir($tempDir)) {
        $finfo = class_exists('finfo') ? new finfo(FILEINFO_MIME_TYPE) : null;
        $files = glob($tempDir . '*');
        
        foreach ($files as $file) {
            $fileName = basename($file);
            $newPath  = $permDir . 'hosp_' . $hospitalId . '_' . $fileName;
            
            if (rename($file, $newPath)) {
                // Log in hospital_documents
                try {
                    $mimeType = $finfo ? $finfo->file($newPath) : 'application/octet-stream';
                    $docStmt  = $pdo->prepare("
                        INSERT INTO hospital_documents (hospital_id, file_name, file_path, file_size, file_type)
                        VALUES (?, ?, ?, ?, ?)
                    ");
                    $docStmt->execute([
                        $hospitalId,
                        $fileName,
                        'uploads/hospital_docs/' . basename($newPath),
                        filesize($newPath),
                        $mimeType
                    ]);
                } catch (Exception $docEx) {
                    error_log("Failed to log hospital document in DB: " . $docEx->getMessage());
                    Logger::log('database', 'error', "Doc log failed for hospital $hospitalId: " . $docEx->getMessage());
                }
            } else {
                error_log("Failed to move hospital document: $file to $newPath");
                Logger::log('filesystem', 'error', "Doc move failed for hospital $hospitalId: $fileName");
            }
        }
        // Clean up temp dir if empty
        if (count(glob($tempDir . '*')) === 0) {
            @rmdir($tempDir);
        }
    }

    // ── Remove the verification record ────────────────────────────────────
    $pdo->prepare("DELETE FROM hospital_verifications WHERE email = ?")->execute([$email]);

    // ── Set PHP Session ───────────────────────────────────────────────────
    $_SESSION['hospital_id']   = $hospitalId;
    $_SESSION['hospital_role'] = 'hospital';
    $_SESSION['hospital_name'] = $pending['hosp_name'];

    // ── Log event ─────────────────────────────────────────────────────────
    Logger::log('auth', 'info', "New hospital registered & email verified: " . $pending['username'], $pending['hosp_name']);

    // ── Send welcome/confirmation email ───────────────────────────────────
    try {
        $welcomeBody = "
            <p>Hello <strong>" . htmlspecialchars($pending['hosp_name']) . "</strong> Team,</p>
            <p>Your email has been successfully verified! 🎉</p>
            <p>Your hospital registration on <strong>PCOS Care Hub</strong> has been submitted and is now <strong>pending admin review</strong>.</p>
            <p>Our team will verify your registration documents and you will receive another email once your account is approved.</p>
            <p>Once approved, your hospital will appear in our public directory and you can access the full hospital dashboard.</p>
            <p style='margin-top:24px; font-size:0.9rem; color:#666;'>If you have any questions, please contact our support team.</p>
        ";
        Mailer::send($email, 'Hospital Registration Received — PCOS Care Hub', $welcomeBody);
    } catch (Throwable $e) {
        error_log("Hospital welcome email failed: " . $e->getMessage());
    }

    echo json_encode([
        'status'  => 'success',
        'message' => 'Email verified! Redirecting to your dashboard...',
        'hospital' => [
            'id'              => (int)$hospitalId,
            'hosp_name'       => $pending['hosp_name'],
            'name'            => $pending['hosp_name'],
            'username'        => $pending['username'],
            'email'           => $pending['email'],
            'location'        => $pending['location'],
            'phone'           => $pending['phone'],
            'hospital_type'   => $pending['hospital_type'],
            'reg_number'      => $pending['reg_number'],
            'approval_status' => 'pending',
            'role'            => 'hospital'
        ]
    ]);

} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        // Cleanup duplicate
        $pdo->prepare("DELETE FROM hospital_verifications WHERE email = ?")->execute([$email]);
        echo json_encode(['status' => 'error', 'message' => 'A hospital account with this email, username, or registration number already exists.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Account creation failed: ' . $e->getMessage()]);
    }
}
