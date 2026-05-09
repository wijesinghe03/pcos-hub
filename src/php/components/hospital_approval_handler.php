<?php

/**
 * PCOS CARE HUB — Hospital Approval/Rejection Handler
 * Admin endpoint: approve or reject a pending hospital application.
 */

require_once '../db_connect.php';
header('Content-Type: application/json');

session_start();

// ── Guard: only allow authenticated admin ──────────────────────────────────
// (If you have an admin session check, enable it below)
// if (empty($_SESSION['admin_id'])) {
//     http_response_code(403);
//     echo json_encode(['status' => 'error', 'message' => 'Unauthorized.']);
//     exit;
// }

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
    if ($action === 'approve') {
        $stmt = $pdo->prepare(
            "UPDATE hospitals
             SET approval_status = 'approved', is_verified = 1
             WHERE id = ?"
        );
        $stmt->execute([$hospitalId]);

        // Fetch hospital email to notify
        $hStmt = $pdo->prepare("SELECT hosp_name, email FROM hospitals WHERE id = ?");
        $hStmt->execute([$hospitalId]);
        $hosp = $hStmt->fetch();

        if ($hosp) {
            try {
                require_once '../utils/Mailer.php';
                $emailBody = "
                    <p>Hello <strong>{$hosp['hosp_name']}</strong> Team,</p>
                    <p>Great news! Your hospital has been <strong>approved</strong> on PCOS Care Hub.</p>
                    <p>You can now log in to your hospital dashboard and start managing patient records.</p>
                    <a href='http://localhost/pcos-hub/src/pages/login.html' style='background:#7B3FBE;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:10px;'>Go to Hospital Login</a>
                ";
                Mailer::send($hosp['email'], 'Hospital Approved — PCOS Care Hub', $emailBody);
            } catch (Exception $mailEx) {
                error_log('Approval email failed: ' . $mailEx->getMessage());
            }
        }

        echo json_encode([
            'status'  => 'success',
            'message' => 'Hospital approved and is now visible in the public directory.'
        ]);
    } else {
        // Reject
        $rejectionReason = trim($data['reason'] ?? 'Application did not meet requirements.');

        $stmt = $pdo->prepare(
            "UPDATE hospitals
             SET approval_status = 'rejected', is_verified = 0
             WHERE id = ?"
        );
        $stmt->execute([$hospitalId]);

        $hStmt = $pdo->prepare("SELECT hosp_name, email FROM hospitals WHERE id = ?");
        $hStmt->execute([$hospitalId]);
        $hosp = $hStmt->fetch();

        if ($hosp) {
            try {
                require_once '../utils/Mailer.php';
                $emailBody = "
                    <p>Hello <strong>{$hosp['hosp_name']}</strong> Team,</p>
                    <p>We regret to inform you that your hospital application on PCOS Care Hub has been <strong>rejected</strong>.</p>
                    <p><strong>Reason:</strong> {$rejectionReason}</p>
                    <p>You may re-apply with the correct documentation. If you have questions, contact support.</p>
                ";
                Mailer::send($hosp['email'], 'Hospital Application Update — PCOS Care Hub', $emailBody);
            } catch (Exception $mailEx) {
                error_log('Rejection email failed: ' . $mailEx->getMessage());
            }
        }

        echo json_encode([
            'status'  => 'success',
            'message' => 'Hospital application rejected.'
        ]);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Operation failed: ' . $e->getMessage()]);
}
