<?php

/**
 * PCOS CARE HUB — Hospital Signup Handler with Document Upload
 * Handles hospital registration (multipart/form-data) and saves approval documents.
 */

require_once '../db_connect.php';
header('Content-Type: application/json');

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

$hospName      = trim($_POST['hosp_name']);
$username      = trim($_POST['username']);
$email         = trim($_POST['email']);
$password      = password_hash($_POST['password'], PASSWORD_BCRYPT);
$regNumber     = trim($_POST['reg_number']);
$location      = trim($_POST['location'] ?? '');
$contactPerson = trim($_POST['contact_person'] ?? '');
$phone         = trim($_POST['phone'] ?? '');
$hospitalType  = trim($_POST['hospital_type'] ?? '');
$specialties   = trim($_POST['specialties'] ?? '');
$address       = trim($_POST['address'] ?? '');

try {
    // ── Insert hospital with approval_status = 'pending' ──────────────────
    $stmt = $pdo->prepare(
        "INSERT INTO hospitals
            (hosp_name, username, email, password, reg_number, location,
             contact_person, phone, hospital_type, specialties, address,
             is_verified, approval_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'pending')"
    );
    $stmt->execute([
        $hospName, $username, $email, $password, $regNumber,
        $location, $contactPerson, $phone, $hospitalType, $specialties, $address
    ]);
    $hospitalId = $pdo->lastInsertId();

    // ── Handle document uploads ────────────────────────────────────────────
    $uploadDir = dirname(__FILE__, 4) . '/uploads/hospital_docs/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    $maxFileSize  = 5 * 1024 * 1024; // 5 MB
    $uploadedFiles = [];

    if (!empty($_FILES['approval_documents']['name'][0])) {
        $files = $_FILES['approval_documents'];
        $count = count($files['name']);

        for ($i = 0; $i < $count; $i++) {
            if ($files['error'][$i] !== UPLOAD_ERR_OK) {
                continue;
            }
            if ($files['size'][$i] > $maxFileSize) {
                continue; // Skip oversized files silently
            }
            // Validate MIME type via finfo
            $finfo    = new finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->file($files['tmp_name'][$i]);
            if (!in_array($mimeType, $allowedTypes)) {
                continue;
            }

            $ext      = pathinfo($files['name'][$i], PATHINFO_EXTENSION);
            $safeName = 'hosp_' . $hospitalId . '_' . time() . '_' . $i . '.' . $ext;
            $destPath = $uploadDir . $safeName;

            if (move_uploaded_file($files['tmp_name'][$i], $destPath)) {
                // Save reference in DB
                $docStmt = $pdo->prepare(
                    "INSERT INTO hospital_documents
                        (hospital_id, file_name, file_path, file_size, file_type)
                     VALUES (?, ?, ?, ?, ?)"
                );
                $docStmt->execute([
                    $hospitalId,
                    $files['name'][$i],
                    'uploads/hospital_docs/' . $safeName,
                    $files['size'][$i],
                    $mimeType
                ]);
                $uploadedFiles[] = $files['name'][$i];
            }
        }
    }

    // ── Welcome email (non-blocking) ──────────────────────────────────────
    try {
        require_once '../utils/Mailer.php';
        $emailBody = "
            <p>Hello <strong>{$hospName}</strong> Team,</p>
            <p>Thank you for registering on <strong>PCOS Care Hub</strong>!</p>
            <p>Your application is currently <strong>under review</strong> by our admin team.
               You will receive a confirmation email once your account is approved.</p>
            <p>Documents submitted: " . (count($uploadedFiles) > 0 ? implode(', ', $uploadedFiles) : 'None') . "</p>
        ";
        Mailer::send($email, 'Hospital Registration — Pending Approval | PCOS Care Hub', $emailBody);
    } catch (Throwable $mailEx) {
        error_log('Hospital welcome email failed: ' . $mailEx->getMessage());
    }

    echo json_encode([
        'status'  => 'pending',
        'message' => 'Your hospital registration has been submitted for admin approval.',
        'docs_uploaded' => count($uploadedFiles),
        'hospital_id'   => (int)$hospitalId
    ]);
} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        echo json_encode(['status' => 'error', 'message' => 'Username, Email, or Registration Number already exists. Try signing in or contact support.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Registration failed: ' . $e->getMessage()]);
    }
}
