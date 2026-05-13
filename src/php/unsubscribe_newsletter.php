<?php

/**
 * Newsletter Unsubscription Handler
 */

error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');

require_once __DIR__ . '/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
    exit;
}

$email = $_POST['email'] ?? '';

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'error', 'message' => 'Please provide a valid email address.']);
    exit;
}

try {
    // Check if subscribed
    $stmt = $pdo->prepare("SELECT id FROM newsletter_subscribers WHERE email = ?");
    $stmt->execute([$email]);
    $subscriber = $stmt->fetch();

    if (!$subscriber) {
        echo json_encode(['status' => 'error', 'message' => 'This email is not subscribed to our newsletter.']);
        exit;
    }

    // Delete from newsletter_subscribers
    $stmt = $pdo->prepare("DELETE FROM newsletter_subscribers WHERE email = ?");
    $stmt->execute([$email]);

    echo json_encode(['status' => 'success', 'message' => 'You have been successfully unsubscribed.']);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'An error occurred. Please try again.']);
}
