<?php
/**
 * Mailer Utility Class
 * Handles sending emails using PHPMailer and SMTP.
 * 
 * To use this, you need to download PHPMailer:
 * 1. Create a directory: src/php/libs/PHPMailer
 * 2. Download from: https://github.com/PHPMailer/PHPMailer
 * 3. Copy the 'src' files into that directory.
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

// Check if PHPMailer exists, if not, provide instructions
$phpMailerPath = __DIR__ . '/../libs/PHPMailer/';
if (file_exists($phpMailerPath . 'PHPMailer.php')) {
    require $phpMailerPath . 'Exception.php';
    require $phpMailerPath . 'PHPMailer.php';
    require $phpMailerPath . 'SMTP.php';
}

class Mailer {
    // Replace these with your actual Namecheap/cPanel SMTP credentials
    private static $host = 'smtp.gmail.com'; 
    private static $username = 'dulaj.dulsith@gmail.com';
    private static $password = 'oihm edkg hdae jpxb';
    private static $port = 465; // 465 for SSL
    private static $fromName = 'PCOS Care Hub';

    /**
     * Sends a beautiful HTML email
     */
    public static function send($to, $subject, $body, $altBody = '') {
        if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
            // If library is missing, log error or return false
            error_log("PHPMailer library not found at: " . __DIR__ . '/../libs/PHPMailer/');
            return false;
        }

        $mail = new PHPMailer(true);
        $mail->SMTPDebug = SMTP::DEBUG_SERVER; // Enabled for testing

        try {
            // Server settings
            $mail->isSMTP();
            $mail->Host       = self::$host;
            $mail->SMTPAuth   = true;
            $mail->Username   = self::$username;
            $mail->Password   = self::$password;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            $mail->Port       = self::$port;
            $mail->CharSet    = 'UTF-8';

            // Recipients
            $mail->setFrom(self::$username, self::$fromName);
            $mail->addAddress($to);

            // Content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = self::getTemplate($subject, $body);
            $mail->AltBody = $altBody ?: strip_tags($body);

            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log("Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
            return false;
        }
    }

    /**
     * Wraps the content in a beautiful HTML template
     */
    private static function getTemplate($title, $content) {
        $year = date('Y');
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f6; }
                .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                .header { background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); padding: 30px; text-align: center; color: white; }
                .header h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px; }
                .content { padding: 40px; }
                .content h2 { color: #2d3436; margin-top: 0; font-size: 20px; }
                .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
                .button { display: inline-block; padding: 12px 25px; background: #6a11cb; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
                .accent { color: #6a11cb; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>PCOS Care Hub</h1>
                </div>
                <div class='content'>
                    <h2>$title</h2>
                    <div>$content</div>
                </div>
                <div class='footer'>
                    &copy; $year PCOS Care Hub. All rights reserved.<br>
                    Providing support and care for your health journey.
                </div>
            </div>
        </body>
        </html>
        ";
    }
}
