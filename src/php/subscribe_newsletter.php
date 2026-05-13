<?php

/**
 * Newsletter Subscription Handler
 * Processes subscription requests and sends a confirmation email.
 */

// Suppress errors to avoid breaking JSON response
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');

require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/utils/Mailer.php';

use App\Utils\Mailer;

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
        exit;
    }

    $email = $_POST['email'] ?? '';

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['status' => 'error', 'message' => 'Please provide a valid email address.']);
        exit;
    }

    // 1. Check if the user has an account (must be a registered patient)
    // We check the patients table
    $stmt = $pdo->prepare("SELECT id FROM patients WHERE email = ?");
    $stmt->execute([$email]);
    $patient = $stmt->fetch();

    if (!$patient) {
        echo json_encode(['status' => 'error', 'message' => 'Please create an account first with this email address to subscribe.']);
        exit;
    }

    $patientId = $patient['id'];

    // 2. Check if already subscribed
    $stmt = $pdo->prepare("SELECT id FROM newsletter_subscribers WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'You are already subscribed to our newsletter!']);
        exit;
    }

    // 3. Save to database
    $stmt = $pdo->prepare("INSERT INTO newsletter_subscribers (email, patient_id) VALUES (?, ?)");
    $stmt->execute([$email, $patientId]);

    // 4. Send confirmation email
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
        <p>Stay healthy,<br>The PCOS Care Hub Team</p>
    ";

    $sent = Mailer::send($email, $subject, $message);

    if ($sent) {
        echo json_encode(['status' => 'success', 'message' => 'Subscribed successfully! Check your inbox for a welcome email.']);
    } else {
        // Even if email fails, they are saved in the DB now. 
        echo json_encode(['status' => 'success', 'message' => 'Subscribed successfully! (Note: Welcome email could not be sent)']);
    }

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'An unexpected error occurred: ' . $e->getMessage()]);
} catch (Error $e) {
    // Catch fatal errors too
    echo json_encode(['status' => 'error', 'message' => 'System error: ' . $e->getMessage()]);
}
