<?php

/**
 * PCOS CARE HUB — Menstrual Cycle Log Handler (cycle_handler.php)
 * POST  → save a new cycle entry
 * GET   → fetch history (latest N entries)
 */

require_once '../db_connect.php';

header('Content-Type: application/json');

// ── Resolve patient_id from id or email ────────────────────────────
function resolvePatient($pdo, $data)
{
    $id    = $data['patient_id']    ?? null;
    $email = $data['patient_email'] ?? null;

    if ($id && is_numeric($id)) {
        $s = $pdo->prepare("SELECT id FROM patients WHERE id = ?");
        $s->execute([(int)$id]);
        $r = $s->fetch();
        return $r ? (int)$r['id'] : null;
    }
    if ($email) {
        $s = $pdo->prepare("SELECT id FROM patients WHERE email = ?");
        $s->execute([trim($email)]);
        $r = $s->fetch();
        return $r ? (int)$r['id'] : null;
    }
    return null;
}

$method = $_SERVER['REQUEST_METHOD'];

// ── POST: Save cycle entry ─────────────────────────────────────────
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        echo json_encode(['status' => 'error','message' => 'Invalid data.']);
        exit;
    }

    $patient_id = resolvePatient($pdo, $data);
    if (!$patient_id) {
        echo json_encode(['status' => 'error','message' => 'Patient not found. Please log in again.']);
        exit;
    }

    $start_date   = $data['start_date']   ?? null;
    $end_date     = $data['end_date']     ?? null;
    $cycle_length = (int)($data['cycle_length'] ?? 28);
    $flow         = $data['flow']         ?? null;
    $notes        = $data['notes']        ?? '';

    if (!$start_date || !$end_date || !$flow) {
        echo json_encode(['status' => 'error','message' => 'Start date, end date and flow are required.']);
        exit;
    }

    $valid_flows = ['light','normal','heavy'];
    if (!in_array($flow, $valid_flows)) {
        echo json_encode(['status' => 'error','message' => 'Invalid flow value.']);
        exit;
    }

    // Calculate duration
    $duration = (int)((strtotime($end_date) - strtotime($start_date)) / 86400) + 1;
    if ($duration < 1) {
        echo json_encode(['status' => 'error','message' => 'End date must be on or after start date.']);
        exit;
    }

    // Calculate next predicted period
    $next_period = date('Y-m-d', strtotime($start_date . ' +' . $cycle_length . ' days'));

    try {
        $stmt = $pdo->prepare(
            "INSERT INTO cycle_logs
             (patient_id, period_start, period_end, cycle_length, period_duration, flow_intensity, notes, next_predicted)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([$patient_id, $start_date, $end_date, $cycle_length, $duration, $flow, $notes, $next_period]);

        echo json_encode([
            'status'       => 'success',
            'message'      => 'Cycle data saved!',
            'id'           => $pdo->lastInsertId(),
            'duration'     => $duration,
            'next_period'  => $next_period
        ]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error','message' => 'DB error: ' . $e->getMessage()]);
    }

// ── GET: Fetch cycle history ───────────────────────────────────────
} elseif ($method === 'GET') {
    $data       = $_GET;
    $patient_id = resolvePatient($pdo, $data);
    $limit      = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;

    if (!$patient_id) {
        echo json_encode(['status' => 'error','message' => 'patient_id or patient_email is required.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare(
            "SELECT id, period_start, period_end, cycle_length, period_duration,
                    flow_intensity, notes, next_predicted, created_at
             FROM cycle_logs
             WHERE patient_id = ?
             ORDER BY period_start DESC
             LIMIT " . (int)$limit
        );
        $stmt->execute([$patient_id]);
        $rows = $stmt->fetchAll();

        echo json_encode(['status' => 'success', 'data' => $rows]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error','message' => 'DB error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error','message' => 'Invalid method.']);
}
