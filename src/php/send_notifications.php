<?php

/**
 * Notification Sender
 * ─────────────────────────────────────────────────────────────────
 * This script sends email notifications to patients:
 *
 *   1. APPOINTMENT REMINDERS  — sent 1 day before the appointment
 *      (only if patient has appt_reminders = 1 AND email_notifications = 1)
 *
 *   2. CYCLE / PERIOD REMINDERS — sent 3 days before next predicted period
 *      (only if patient has cycle_reminders = 1 AND email_notifications = 1)
 *
 * Usage:
 *   Visit: http://localhost/pcos-hub/src/php/send_notifications.php
 *   OR schedule with Windows Task Scheduler / cron:
 *     php /path/to/send_notifications.php
 *
 * NOTE: A secret key prevents public abuse.
 *       Call with ?key=pcos_notify_2026 or set it in the cron command.
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: application/json');

// ── Simple access key (change this to something secret in production) ──
$secretKey = 'pcos_notify_2026';
$inputKey  = $_GET['key'] ?? $_POST['key'] ?? null;

// Allow localhost access without key, require key from external
$isLocalhost = in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1']);
if (!$isLocalhost && $inputKey !== $secretKey) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized.']);
    exit;
}

require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/utils/Mailer.php';

use App\Utils\Mailer;

$results = [
    'appointment_reminders' => [],
    'cycle_reminders'       => [],
    'errors'                => [],
];

$today    = new DateTime('today');
$tomorrow = (clone $today)->modify('+1 day')->format('Y-m-d');
$in3days  = (clone $today)->modify('+3 days')->format('Y-m-d');

// ═══════════════════════════════════════════════════════════════════
// 1. APPOINTMENT REMINDERS
// ═══════════════════════════════════════════════════════════════════
try {
    $sql = "
        SELECT
            pa.id           AS appt_id,
            pa.patient_id,
            pa.hospital_name,
            pa.doctor_name,
            pa.appointment_date,
            pa.appointment_time,
            pa.appointment_type,
            pa.reason,
            p.full_name     AS patient_name,
            p.email         AS patient_email,
            pnp.email_notifications,
            pnp.appt_reminders
        FROM patient_appointments pa
        JOIN patients p ON p.id = pa.patient_id
        LEFT JOIN patient_notification_prefs pnp ON pnp.patient_id = pa.patient_id
        WHERE pa.appointment_date = ?
          AND pa.status = 'upcoming'
          AND (pnp.email_notifications IS NULL OR pnp.email_notifications = 1)
          AND (pnp.appt_reminders IS NULL OR pnp.appt_reminders = 1)
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$tomorrow]);
    $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($appointments as $appt) {
        $dateFormatted = date('l, F j, Y', strtotime($appt['appointment_date']));
        $timeFormatted = date('g:i A', strtotime($appt['appointment_time']));
        $doctorInfo    = $appt['doctor_name'] ? "with Dr. {$appt['doctor_name']}" : '';
        $hospitalInfo  = $appt['hospital_name'] ?: 'your healthcare provider';
        $type          = ucfirst(str_replace('-', ' ', $appt['appointment_type']));

        $subject = "🗓️ Appointment Reminder — Tomorrow at $timeFormatted";
        $body = "
            <p>Hi <strong>{$appt['patient_name']}</strong>,</p>
            <p>This is a friendly reminder that you have an upcoming appointment <strong>tomorrow</strong>.</p>
            <div style='background:#f8f4ff;border-left:4px solid #9370DB;padding:20px;border-radius:8px;margin:24px 0'>
                <table style='width:100%;font-size:15px'>
                    <tr>
                        <td style='color:#666;padding:6px 0;width:140px'>📋 Type:</td>
                        <td><strong>{$type}</strong></td>
                    </tr>
                    <tr>
                        <td style='color:#666;padding:6px 0'>🏥 Hospital:</td>
                        <td><strong>{$hospitalInfo}</strong></td>
                    </tr>
                    " . ($appt['doctor_name'] ? "<tr>
                        <td style='color:#666;padding:6px 0'>👨‍⚕️ Doctor:</td>
                        <td><strong>Dr. {$appt['doctor_name']}</strong></td>
                    </tr>" : "") . "
                    <tr>
                        <td style='color:#666;padding:6px 0'>📅 Date:</td>
                        <td><strong>{$dateFormatted}</strong></td>
                    </tr>
                    <tr>
                        <td style='color:#666;padding:6px 0'>⏰ Time:</td>
                        <td><strong>{$timeFormatted}</strong></td>
                    </tr>
                    " . ($appt['reason'] ? "<tr>
                        <td style='color:#666;padding:6px 0'>📝 Reason:</td>
                        <td>{$appt['reason']}</td>
                    </tr>" : "") . "
                </table>
            </div>
            <p style='color:#666;font-size:14px'>Please arrive 10–15 minutes early and bring any relevant medical records or prescriptions.</p>
            <p>You can manage your appointments in your <a href='http://localhost/pcos-hub/src/pages/appointments.html' style='color:#9370DB;font-weight:bold'>PCOS Care Hub dashboard</a>.</p>
            <p style='color:#999;font-size:13px;margin-top:24px'>
                To stop receiving appointment reminders, update your 
                <a href='http://localhost/pcos-hub/src/pages/settings.html' style='color:#9370DB'>Notification Settings</a>.
            </p>
        ";

        $altBody = "Hi {$appt['patient_name']}, you have an appointment tomorrow ({$dateFormatted}) at {$timeFormatted} at {$hospitalInfo}.";

        $sent = Mailer::send($appt['patient_email'], $subject, $body, $altBody);
        $results['appointment_reminders'][] = [
            'patient' => $appt['patient_name'],
            'email'   => $appt['patient_email'],
            'date'    => $appt['appointment_date'],
            'sent'    => $sent,
        ];
    }
} catch (Exception $e) {
    $results['errors'][] = 'Appointment query failed: ' . $e->getMessage();
}

// ═══════════════════════════════════════════════════════════════════
// 2. CYCLE / PERIOD REMINDERS
// ═══════════════════════════════════════════════════════════════════
try {
    $sql = "
        SELECT
            cl.id           AS cycle_id,
            cl.patient_id,
            cl.next_predicted,
            cl.cycle_length,
            p.full_name     AS patient_name,
            p.email         AS patient_email,
            pnp.email_notifications,
            pnp.cycle_reminders
        FROM cycle_logs cl
        JOIN patients p ON p.id = cl.patient_id
        LEFT JOIN patient_notification_prefs pnp ON pnp.patient_id = cl.patient_id
        WHERE cl.next_predicted = ?
          AND cl.id = (
              SELECT MAX(id) FROM cycle_logs cl2 WHERE cl2.patient_id = cl.patient_id
          )
          AND (pnp.email_notifications IS NULL OR pnp.email_notifications = 1)
          AND (pnp.cycle_reminders IS NULL OR pnp.cycle_reminders = 1)
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$in3days]);
    $cycles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($cycles as $cycle) {
        $predictedDate = date('l, F j, Y', strtotime($cycle['next_predicted']));
        $cycleLen      = (int)$cycle['cycle_length'];

        $subject = "🩸 Period Reminder — Your cycle is expected in 3 days";
        $body = "
            <p>Hi <strong>{$cycle['patient_name']}</strong>,</p>
            <p>Based on your cycle history, your next period is predicted to start in <strong>3 days</strong>.</p>
            <div style='background:#fff0f5;border-left:4px solid #E580AF;padding:20px;border-radius:8px;margin:24px 0'>
                <table style='width:100%;font-size:15px'>
                    <tr>
                        <td style='color:#666;padding:6px 0;width:180px'>📅 Predicted Start:</td>
                        <td><strong>{$predictedDate}</strong></td>
                    </tr>
                    <tr>
                        <td style='color:#666;padding:6px 0'>🔄 Your Cycle Length:</td>
                        <td><strong>{$cycleLen} days</strong></td>
                    </tr>
                </table>
            </div>
            <p style='color:#666'>Here are some tips to prepare:</p>
            <ul style='color:#555;line-height:1.8'>
                <li>Stay hydrated and reduce caffeine to ease cramps</li>
                <li>Keep track of any PCOS symptoms like spotting or mood changes</li>
                <li>Have your period supplies ready</li>
                <li>Light exercise like yoga can help with pre-period discomfort</li>
            </ul>
            <p>Track your cycle accurately in your <a href='http://localhost/pcos-hub/src/pages/menstrual-cycle.html' style='color:#E580AF;font-weight:bold'>Menstrual Cycle Tracker</a>.</p>
            <p style='color:#999;font-size:13px;margin-top:24px'>
                To stop receiving cycle reminders, update your 
                <a href='http://localhost/pcos-hub/src/pages/settings.html' style='color:#9370DB'>Notification Settings</a>.
            </p>
        ";

        $altBody = "Hi {$cycle['patient_name']}, your next period is predicted to start in 3 days ({$predictedDate}). Your cycle length is {$cycleLen} days.";

        $sent = Mailer::send($cycle['patient_email'], $subject, $body, $altBody);
        $results['cycle_reminders'][] = [
            'patient'   => $cycle['patient_name'],
            'email'     => $cycle['patient_email'],
            'predicted' => $cycle['next_predicted'],
            'sent'      => $sent,
        ];
    }
} catch (Exception $e) {
    $results['errors'][] = 'Cycle query failed: ' . $e->getMessage();
}

// ── Final Response ──────────────────────────────────────────────
$totalSent = count($results['appointment_reminders']) + count($results['cycle_reminders']);
echo json_encode([
    'status'  => 'success',
    'summary' => [
        'appointment_reminders_sent' => count($results['appointment_reminders']),
        'cycle_reminders_sent'       => count($results['cycle_reminders']),
        'errors'                     => count($results['errors']),
    ],
    'details' => $results,
]);
