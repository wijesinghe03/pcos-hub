<?php

/**
 * Notification Preferences Handler
 * GET  → returns current prefs for the logged-in patient
 * POST → saves/updates preference fields
 */

error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');

require_once __DIR__ . '/../db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

/* ── Helper: find patient by id or email ── */
function resolvePatient($pdo, $patientId, $patientEmail): ?array
{
    if ($patientId) {
        $s = $pdo->prepare("SELECT id, full_name, email FROM patients WHERE id = ? LIMIT 1");
        $s->execute([$patientId]);
    } else {
        $s = $pdo->prepare("SELECT id, full_name, email FROM patients WHERE email = ? LIMIT 1");
        $s->execute([$patientEmail]);
    }
    return $s->fetch(PDO::FETCH_ASSOC) ?: null;
}

/* ── Helper: ensure prefs row exists ── */
function ensurePrefsRow($pdo, $patientId): void
{
    $pdo->prepare(
        "INSERT IGNORE INTO patient_notification_prefs (patient_id) VALUES (?)"
    )->execute([$patientId]);
}

// ── GET ──────────────────────────────────────────────────────────
if ($method === 'GET') {
    $patientId    = $_GET['patient_id']    ?? null;
    $patientEmail = $_GET['patient_email'] ?? null;

    if (!$patientId && !$patientEmail) {
        echo json_encode(['status' => 'error', 'message' => 'Patient ID or email required.']);
        exit;
    }

    try {
        $patient = resolvePatient($pdo, $patientId, $patientEmail);
        if (!$patient) {
            echo json_encode(['status' => 'error', 'message' => 'Patient not found.']);
            exit;
        }

        ensurePrefsRow($pdo, $patient['id']);

        $s = $pdo->prepare("SELECT * FROM patient_notification_prefs WHERE patient_id = ?");
        $s->execute([$patient['id']]);
        $prefs = $s->fetch(PDO::FETCH_ASSOC);

        // Also check if patient is subscribed to newsletter
        $ns = $pdo->prepare("SELECT id FROM newsletter_subscribers WHERE patient_id = ? LIMIT 1");
        $ns->execute([$patient['id']]);
        $prefs['newsletter_subscribed'] = $ns->fetch() ? 1 : 0;

        echo json_encode(['status' => 'success', 'data' => $prefs]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Database error.']);
    }
    exit;
}

// ── POST ─────────────────────────────────────────────────────────
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

    $patientId    = $input['patient_id']    ?? null;
    $patientEmail = $input['patient_email'] ?? null;
    $field        = $input['field']         ?? null;
    $value        = isset($input['value']) ? (int)$input['value'] : null;

    if ((!$patientId && !$patientEmail) || $field === null || $value === null) {
        echo json_encode(['status' => 'error', 'message' => 'Missing parameters.']);
        exit;
    }

    // Allowed fields only (whitelist)
    $allowed = ['email_notifications', 'appt_reminders', 'cycle_reminders', 'health_tips'];
    if (!in_array($field, $allowed)) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid field.']);
        exit;
    }

    try {
        $patient = resolvePatient($pdo, $patientId, $patientEmail);
        if (!$patient) {
            echo json_encode(['status' => 'error', 'message' => 'Patient not found.']);
            exit;
        }

        ensurePrefsRow($pdo, $patient['id']);

        // Update the specific field
        $stmt = $pdo->prepare(
            "UPDATE patient_notification_prefs SET `{$field}` = ? WHERE patient_id = ?"
        );
        $stmt->execute([$value, $patient['id']]);

        // ── Special handling: Health Tips = newsletter subscription ──
        if ($field === 'health_tips') {
            if ($value === 1) {
                // Subscribe: add to newsletter_subscribers if not already there
                $pdo->prepare(
                    "INSERT IGNORE INTO newsletter_subscribers (email, patient_id) VALUES (?, ?)"
                )->execute([$patient['email'], $patient['id']]);
            } else {
                // Unsubscribe: remove from newsletter_subscribers
                $pdo->prepare(
                    "DELETE FROM newsletter_subscribers WHERE patient_id = ?"
                )->execute([$patient['id']]);
            }
        }

        echo json_encode(['status' => 'success', 'message' => 'Preference saved.']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to save preference.']);
    }
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
