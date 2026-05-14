<?php

header('Content-Type: application/json');
require_once 'db_connect.php';
require_once 'utils/Mailer.php';

use App\Utils\Mailer;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $subject = trim($_POST['subject'] ?? '');
    $message = trim($_POST['message'] ?? '');

    if (empty($name) || empty($email) || empty($phone) || empty($subject) || empty($message)) {
        echo json_encode(['status' => 'error', 'message' => 'All fields are required.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO contactus_message (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$name, $email, $phone, $subject, $message]);

        // Send Email Notification to Admin
        $adminEmail = 'admin@pcos-hub.com'; // Replace with actual admin email
        $adminBody = "
            <h2>New Contact Message</h2>
            <p><strong>Name:</strong> $name</p>
            <p><strong>Email:</strong> $email</p>
            <p><strong>Phone:</strong> $phone</p>
            <p><strong>Subject:</strong> $subject</p>
            <p><strong>Message:</strong><br>$message</p>
        ";

        $adminSent = Mailer::send($adminEmail, "New Contact Message: $subject", $adminBody);
        if (!$adminSent) {
            error_log("Failed to send admin notification email for contact submission from $email");
        }

        // Send Auto-reply to User
        $userSubject = "Message Received - PCOS Care Hub";
        $userBody = "
            <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                <h2 style='color: #6b46c1;'>Hello $name,</h2>
                <p>Thank you for reaching out to <strong>PCOS Care Hub</strong>.</p>
                <p>Your message has been received, and we will contact you within <strong>34 hours</strong>.</p>
                <p>If your inquiry is urgent, please call us directly at +94 11 234 5678.</p>
                <br>
                <p>Best Regards,<br><strong>PCOS Care Hub Team</strong></p>
            </div>
        ";
        $userSent = Mailer::send($email, $userSubject, $userBody);
        if (!$userSent) {
            error_log("Failed to send auto-reply email to $email");
        }

        echo json_encode(['status' => 'success', 'message' => 'Message sent successfully.']);
    } catch (Exception $e) {
        error_log("Contact submission error: " . $e->getMessage());
        echo json_encode(['status' => 'error', 'message' => 'An error occurred: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
