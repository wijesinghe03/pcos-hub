<?php

/**
 * PCOS CARE HUB — Symptom Log Handler (symptom_handler.php)
 * Handles saving and fetching symptom logs for the logged-in patient.
 */

require_once '../db_connect.php';
session_start();

header('Content-Type: application/json');

// Resolve patient_id from either a numeric id or an email
function resolvePatientId($pdo, $data, $source = 'body')
{
    if ($source === 'body') {
        $id    = $data['patient_id']    ?? null;
        $email = $data['patient_email'] ?? null;
    } else { // GET params
        $id    = $data['patient_id']    ?? null;
        $email = $data['patient_email'] ?? null;
    }

    if ($id && is_numeric($id)) {
        $stmt = $pdo->prepare("SELECT id FROM patients WHERE id = ?");
        $stmt->execute([(int)$id]);
        $row = $stmt->fetch();
        return $row ? (int)$row['id'] : null;
    }

    if ($email) {
        $stmt = $pdo->prepare("SELECT id FROM patients WHERE email = ?");
        $stmt->execute([trim($email)]);
        $row = $stmt->fetch();
        return $row ? (int)$row['id'] : null;
    }

    return null;
}

$method = $_SERVER['REQUEST_METHOD'];

// ── POST: Save a new symptom log ──────────────────────────────────
if ($method === 'POST') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid request data.']);
        exit;
    }

    $patient_id = resolvePatientId($pdo, $data);
    if (!$patient_id) {
        echo json_encode(['status' => 'error', 'message' => 'Patient not found. Please log in again.']);
        exit;
    }

    $log_date  = $data['date']     ?? null;
    $log_time  = $data['time']     ?? null;
    $symptoms  = $data['symptoms'] ?? [];
    $severity  = $data['severity'] ?? null;
    $notes     = $data['notes']    ?? '';

    if (!$log_date || !$log_time || empty($symptoms) || !$severity) {
        echo json_encode(['status' => 'error', 'message' => 'Date, time, symptoms and severity are required.']);
        exit;
    }

    if (!in_array($severity, ['mild', 'moderate', 'severe'])) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid severity value.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare(
            "INSERT INTO symptom_logs (patient_id, log_date, log_time, symptoms, severity, notes)
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $patient_id,
            $log_date,
            $log_time,
            json_encode($symptoms),
            $severity,
            $notes
        ]);

        $new_id = $pdo->lastInsertId();

        echo json_encode([
            'status'  => 'success',
            'message' => 'Symptoms saved successfully!',
            'id'      => $new_id
        ]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }

// ── GET: Fetch symptom history for a patient ──────────────────────
} elseif ($method === 'GET') {
    $limit        = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $patient_id   = resolvePatientId($pdo, $_GET);

    if (!$patient_id) {
        echo json_encode(['status' => 'error', 'message' => 'patient_id or patient_email is required.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare(
            "SELECT id, log_date, log_time, symptoms, severity, notes, created_at
             FROM symptom_logs
             WHERE patient_id = ?
             ORDER BY log_date DESC, log_time DESC
             LIMIT " . (int)$limit
        );
        $stmt->execute([$patient_id]);
        $rows = $stmt->fetchAll();

        // Decode symptoms JSON for each row
        foreach ($rows as &$row) {
            $row['symptoms'] = json_decode($row['symptoms'], true) ?? [];
        }

        echo json_encode(['status' => 'success', 'data' => $rows]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
