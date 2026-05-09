<?php

/**
 * Mailer Utility Class
 * Handles sending emails using PHPMailer and SMTP.
 */



use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

// Check if PHPMailer exists
$phpMailerPath = __DIR__ . '/../libs/PHPMailer/';
if (file_exists($phpMailerPath . 'PHPMailer.php')) {
    require $phpMailerPath . 'Exception.php';
    require $phpMailerPath . 'PHPMailer.php';
    require $phpMailerPath . 'SMTP.php';
}

class Mailer
{
    private static string $host = 'smtp.gmail.com';
    private static string $username = 'dulaj.dulsith@gmail.com';
    private static string $password = 'oihm edkg hdae jpxb';
    private static int $port = 465;
    private static string $fromName = 'PCOS Care Hub';

    /**
     * Sends a beautiful HTML email.
     *
     * @param string $to      Recipient email address.
     * @param string $subject Email subject.
     * @param string $body    HTML body content.
     * @param string $altBody Plain text fallback.
     * @return bool
     */
    public static function send(
        string $to,
        string $subject,
        string $body,
        string $altBody = ''
    ): bool {
        if (!class_exists('PHPMailer\\PHPMailer\\PHPMailer')) {
            error_log("PHPMailer library not found at: " . __DIR__ . '/../libs/PHPMailer/');
            return false;
        }

        $mail = new PHPMailer(true);
        $mail->SMTPDebug = SMTP::DEBUG_OFF;

        try {
            $mail->isSMTP();
            $mail->Host       = self::$host;
            $mail->SMTPAuth   = true;
            $mail->Username   = self::$username;
            $mail->Password   = self::$password;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            $mail->Port       = self::$port;
            $mail->CharSet    = 'UTF-8';

            $mail->setFrom(self::$username, self::$fromName);
            $mail->addAddress($to);

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
     * Wraps the content in a styled HTML email template.
     *
     * @param string $title   Email title shown in header.
     * @param string $content HTML body content.
     * @return string
     */
    private static function getTemplate(string $title, string $content): string
    {
        $year = date('Y');
        $styles = 'body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background:#f4f7f6}';
        $styles .= '.container{max-width:600px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden}';
        $styles .= '.header{background:linear-gradient(135deg,#6a11cb,#2575fc);padding:30px;text-align:center;color:#fff}';
        $styles .= '.content{padding:40px}.footer{background:#f9f9f9;padding:20px;text-align:center;font-size:12px;color:#999}';

        return "<!DOCTYPE html><html><head><style>{$styles}</style></head><body>
            <div class='container'>
                <div class='header'><h1>PCOS Care Hub</h1></div>
                <div class='content'><h2>{$title}</h2><div>{$content}</div></div>
                <div class='footer'>&copy; {$year} PCOS Care Hub. All rights reserved.</div>
            </div>
        </body></html>";
    }
}
