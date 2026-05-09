<?php

/**
 * Test script for Email Functionality
 * Run this in your browser: http://localhost/pcos-hub/src/php/test_email.php
 */

require_once 'utils/Mailer.php';

$testEmail = 'dulaj.dulsith@gmail.com'; // Testing with your email
$subject = "Test Email from PCOS Care Hub";
$body = "
    <p>Hello!</p>
    <p>This is a test email to confirm that your <strong>SMTP configuration</strong> is working correctly.</p>
    <p>If you received this, your website is now ready to send notifications!</p>
";

echo "<h2>Email Test</h2>";
echo "Attempting to send email to $testEmail...<br>";

if (Mailer::send($testEmail, $subject, $body)) {
    echo "<p style='color: green;'><strong>Success!</strong> Email has been sent.</p>";
} else {
    echo "<p style='color: red;'><strong>Failed!</strong></p>";
    echo "<p><strong>Possible reasons:</strong></p>";
    echo "<ul>
            <li>You haven't added the PHPMailer files to <code>src/php/libs/PHPMailer/</code> yet.</li>
            <li>Your SMTP credentials (host, user, password) are incorrect.</li>
            <li>Your firewall is blocking port 465.</li>
          </ul>";

    echo "<p><em>Check your PHP error log or look below if I can capture the error...</em></p>";
}
