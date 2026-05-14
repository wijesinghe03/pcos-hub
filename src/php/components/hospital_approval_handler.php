<?php

/**
 * PCOS CARE HUB — Hospital Approval/Rejection Handler
 * Reads from registered_hospitals (self-signup table).
 * On APPROVE: copies record into hospitals (public directory) and marks approved.
 * On REJECT: marks registered_hospitals as rejected.
 */

require_once '../db_connect.php';
require_once __DIR__ . '/../utils/Logger.php';
session_start();
header('Content-Type: application/json');

require_once '../utils/AuthHelper.php';

// Security Check: Only admins can manage applications
\App\Utils\AuthHelper::requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
    exit;
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$action     = $data['action']     ?? '';   // 'approve' | 'reject'
$hospitalId = (int)($data['hospital_id'] ?? 0);

if (!$hospitalId || !in_array($action, ['approve', 'reject'])) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid parameters.']);
    exit;
}

try {
    // Fetch from registered_hospitals (self-signup table)
    $hStmt = $pdo->prepare(
        "SELECT * FROM registered_hospitals WHERE id = ? LIMIT 1"
    );
    $hStmt->execute([$hospitalId]);
    $hosp = $hStmt->fetch();

    if (!$hosp) {
        echo json_encode(['status' => 'error', 'message' => 'Hospital not found in registered_hospitals.']);
        exit;
    }

    if ($action === 'approve') {
        // ── Update registered_hospitals status ─────────────────────────
        $pdo->prepare(
            "UPDATE registered_hospitals
             SET approval_status = 'approved', is_verified = 1, approved_at = NOW()
             WHERE id = ?"
        )->execute([$hospitalId]);

        // ── Copy into hospitals (public directory) if not already there ─
        $checkStmt = $pdo->prepare(
            "SELECT id FROM hospitals WHERE email = ? OR reg_number = ? LIMIT 1"
        );
        $checkStmt->execute([$hosp['email'], $hosp['reg_number']]);
        $existing = $checkStmt->fetch();

        if (!$existing) {
            $insertStmt = $pdo->prepare(
                "INSERT INTO hospitals
                    (hosp_name, username, email, password, reg_number, location,
                     contact_person, phone, hospital_type, specialties, address,
                     approval_status, is_verified)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', 1)"
            );
            $contactPerson = trim(($hosp['contact_fname'] ?? '') . ' ' . ($hosp['contact_lname'] ?? ''))
                             ?: ($hosp['contact_person'] ?? '');
            $insertStmt->execute([
                $hosp['hosp_name'],
                $hosp['username'],
                $hosp['email'],
                $hosp['password'],
                $hosp['reg_number'],
                $hosp['location'],
                $contactPerson,
                $hosp['phone'],
                $hosp['hospital_type'],
                $hosp['specialties'],
                $hosp['address']
            ]);
        } else {
            // Already exists — just mark approved
            $pdo->prepare(
                "UPDATE hospitals SET approval_status='approved', is_verified=1 WHERE id=?"
            )->execute([$existing['id']]);
        }

        \App\Utils\Logger::log('hospital', 'info', "Hospital approved: " . $hosp['hosp_name'] . " (now in public directory)", 'Admin');

        // ── Send approval email ────────────────────────────────────────
        try {
            require_once '../utils/Mailer.php';
            $emailBody = "
                <p>Hello <strong>{$hosp['hosp_name']}</strong> Team,</p>
                <p>Great news! Your hospital has been <strong>approved</strong> on PCOS Care Hub. 🎉</p>
                <p>Your hospital is now listed in our public directory and you can log in to access your hospital dashboard.</p>
                <a href='http://localhost/pcos-hub/src/pages/login.html?role=hospital'
                   style='background:#3498db;color:white;padding:12px 24px;border-radius:8px;
                          text-decoration:none;display:inline-block;margin-top:12px;font-weight:700;'>
                  Go to Hospital Login →
                </a>
            ";
            \App\Utils\Mailer::send($hosp['email'], 'Hospital Approved — PCOS Care Hub', $emailBody);
        } catch (Exception $mailEx) {
            error_log('Approval email failed: ' . $mailEx->getMessage());
        }

        echo json_encode([
            'status'  => 'success',
            'message' => 'Hospital approved and is now visible in the public directory.'
        ]);
    } else {
        // ── Reject ────────────────────────────────────────────────────────────
        $rejectionReason = trim($data['reason'] ?? 'Application did not meet requirements.');

        // 1. Fetch all documents to delete physical files
        $docPathsStmt = $pdo->prepare("SELECT file_path FROM hospital_documents WHERE hospital_id = ?");
        $docPathsStmt->execute([$hospitalId]);
        $docs = $docPathsStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($docs as $doc) {
            // Absolute path to file
            // __DIR__ is src/php/components/
            // uploads is at root/uploads/
            $filePath = dirname(__DIR__, 3) . '/' . $doc['file_path'];
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }

        // 2. Delete related document records from database
        $pdo->prepare("DELETE FROM hospital_documents WHERE hospital_id = ?")->execute([$hospitalId]);

        // 3. Delete from registered_hospitals (removes the account entirely)
        $pdo->prepare("DELETE FROM registered_hospitals WHERE id = ?")->execute([$hospitalId]);

        // Also delete from public hospitals table if they somehow got there
        $pdo->prepare("DELETE FROM hospitals WHERE email = ? OR reg_number = ?")->execute([
            $hosp['email'], $hosp['reg_number']
        ]);

        \App\Utils\Logger::log(
            'hospital',
            'warning',
            "Hospital rejected & account deleted: " . $hosp['hosp_name'] . " (Reason: $rejectionReason)",
            'Admin'
        );

        try {
            require_once '../utils/Mailer.php';
            $emailBody = "
                <p>Hello <strong>{$hosp['hosp_name']}</strong> Team,</p>
                <p>We regret to inform you that your hospital application on PCOS Care Hub has been <strong>rejected</strong>.</p>
                <p><strong>Reason:</strong> {$rejectionReason}</p>
                <p>You may re-apply with the correct documentation. If you have questions, please contact support.</p>
            ";
            \App\Utils\Mailer::send($hosp['email'], 'Hospital Application Update — PCOS Care Hub', $emailBody);
        } catch (Exception $mailEx) {
            error_log('Rejection email failed: ' . $mailEx->getMessage());
        }

        echo json_encode([
            'status'  => 'success',
            'message' => 'Hospital application rejected.'
        ]);
    }
} catch (PDOException $e) {
    \App\Utils\Logger::log('database', 'error', "Hospital approval operation failed: " . $e->getMessage(), 'System');
    echo json_encode(['status' => 'error', 'message' => 'Operation failed: ' . $e->getMessage()]);
}
