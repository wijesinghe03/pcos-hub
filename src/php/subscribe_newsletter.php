<?php
/**
 * Newsletter Subscription Handler
 * Processes subscription requests and sends a confirmation email.
 */

header('Content-Type: application/json');
error_reporting(0);
ini_set('display_errors', 0);
require_once __DIR__ . '/utils/Mailer.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
    exit;
}

$email = $_POST['email'] ?? '';

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'error', 'message' => 'Please provide a valid email address.']);
    exit;
}

// In a real application, you would save this email to a database table like `newsletter_subscribers`
// For this task, we will focus on sending the confirmation email as requested.

$subject = "Welcome to PCOS Care Hub Newsletter! 🌸";
$message = "
    <p>Hello,</p>
    <p>Thank you for subscribing to the <strong>PCOS Care Hub Newsletter</strong>! We are excited to have you with us.</p>
    <p>From now on, you'll be the first to receive:</p>
    <ul>
        <li>Latest PCOS research and news</li>
        <li>Wellness and nutrition tips</li>
        <li>Success stories and community updates</li>
        <li>Platform feature announcements</li>
    </ul>
    <p>We are dedicated to supporting your health journey every step of the way.</p>
    <p>If you didn't mean to subscribe, you can ignore this email or contact our support team.</p>
    <p>Stay healthy,<br>The PCOS Care Hub Team</p>
";

$sent = Mailer::send($email, $subject, $message);

if ($sent) {
    echo json_encode(['status' => 'success', 'message' => 'Subscribed successfully!']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to send confirmation email. Please try again later.']);
}
