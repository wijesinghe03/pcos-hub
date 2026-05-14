<?php

header('Content-Type: application/json');
require_once 'db_connect.php';
require_once 'utils/Mailer.php';

use App\Utils\Mailer;

$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $identity = trim($data['identity'] ?? '');
    $role = trim($data['role'] ?? 'patient');

    if (empty($identity)) {
        echo json_encode(['status' => 'error', 'message' => 'Please enter your email or username.']);
        exit;
    }

    // Determine target table and column
    $table = '';
    switch ($role) {
        case 'patient':
            $table = 'patients';
            break;
        case 'hospital':
            $table = 'hospitals';
            break;
        case 'admin':
            $table = 'admin_users';
            break;
        default:
            echo json_encode(['status' => 'error', 'message' => 'Invalid role selected.']);
            exit;
    }

    try {
        // Find user by email or username
        $stmt = $pdo->prepare("SELECT email, username FROM $table WHERE email = ? OR username = ? LIMIT 1");
        $stmt->execute([$identity, $identity]);
        $user = $stmt->fetch();

        if (!$user) {
            // For security, don't reveal if user exists.
            // But usually for UX, we might say if it's not found.
            // The requirement says "recognize the email address" if username is entered.
            echo json_encode(['status' => 'error', 'message' => 'No account found with that email or username.']);
            exit;
        }

        $email = $user['email'];
        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

        // Delete any existing tokens for this email
        $pdo->prepare("DELETE FROM password_resets WHERE email = ? AND role = ?")->execute([$email, $role]);

        // Insert new token
        $stmt = $pdo->prepare("INSERT INTO password_resets (email, token, role, expires_at) VALUES (?, ?, ?, ?)");
        $stmt->execute([$email, $token, $role, $expires]);

        // Send Email
        $resetLink = "http://" . $_SERVER['HTTP_HOST'] . "/pcos-hub/src/pages/reset-password.html?token=$token&email=" . urlencode($email) . "&role=$role";

        $subject = "Reset Your PCOS Care Hub Password";
        $body = "
            <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                <h2 style='color: #6b46c1;'>Password Reset Request</h2>
                <p>Hello,</p>
                <p>We received a request to reset the password for your <strong>PCOS Care Hub</strong> account associated with this email address ($email).</p>
                <p>To reset your password, please click the button below. This link will expire in 1 hour.</p>
                <div style='text-align: center; margin: 30px 0;'>
                    <a href='$resetLink' style='background: #6b46c1; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Reset Password</a>
                </div>
                <p>If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                <br>
                <p>Best Regards,<br><strong>PCOS Care Hub Team</strong></p>
                <hr style='border: none; border-top: 1px solid #eee; margin-top: 20px;'>
                <p style='font-size: 12px; color: #999;'>If the button above doesn't work, copy and paste this link into your browser:<br>$resetLink</p>
            </div>
        ";

        if (Mailer::send($email, $subject, $body)) {
            echo json_encode(['status' => 'success', 'message' => 'A password reset link has been sent to your registered email address.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to send email. Please contact support.']);
        }
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'An error occurred: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
