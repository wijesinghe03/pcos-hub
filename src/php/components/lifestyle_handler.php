<?php
/**
 * PCOS CARE HUB — Lifestyle Log Handler (lifestyle_handler.php)
 * Handles: meals, exercises, water, sleep
 * POST  → save a new entry
 * GET   → fetch history
 * DELETE → remove an entry
 */

// session_start MUST be before any output
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once '../db_connect.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

// ── Resolve patient_id from session, id or email ────────────────────
function resolvePatient($pdo, $data) {
    // Session already started at top of file
    if (isset($_SESSION['patient_id'])) {
        return (int)$_SESSION['patient_id'];
    }
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

// Always read type from URL query string (?type=meals etc)
// This works for GET, POST, DELETE since fetch() sends ?type=X in the URL
$type = $_GET['type'] ?? null;

// Validate type
$valid_types = ['meals', 'exercises', 'water', 'sleep'];
if (!$type || !in_array($type, $valid_types)) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid or missing type. Use: meals, exercises, water, sleep']);
    exit;
}

$table_map = [
    'meals'     => 'lifestyle_meals',
    'exercises' => 'lifestyle_exercises',
    'water'     => 'lifestyle_water',
    'sleep'     => 'lifestyle_sleep',
];
$table = $table_map[$type];

// ── POST: Save entry ────────────────────────────────────────────────
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) { echo json_encode(['status' => 'error', 'message' => 'Invalid JSON data.']); exit; }

    if (!isset($data['type'])) $data['type'] = $type;
    $patient_id = resolvePatient($pdo, $data);
    if (!$patient_id) { echo json_encode(['status' => 'error', 'message' => 'Patient not found. Please log in again.']); exit; }

    try {
        if ($type === 'meals') {
            $meal_type  = $data['meal_type']  ?? null;
            $meal_name  = trim($data['meal_name'] ?? '');
            $raw_cats   = $data['food_categories'] ?? [];
            $food_cats  = is_array($raw_cats)
                            ? (count($raw_cats) > 0 ? implode(',', $raw_cats) : null)
                            : (trim($raw_cats) !== '' ? trim($raw_cats) : null);
            $meal_time  = $data['meal_time']  ?? null;
            $calories   = is_numeric($data['calories'] ?? null) ? (int)$data['calories'] : null;
            $notes      = $data['notes']      ?? '';
            $log_date   = $data['log_date']   ?? date('Y-m-d');

            if (!$meal_type || !$meal_name) {
                echo json_encode(['status' => 'error', 'message' => 'Meal type and name are required.']); exit;
            }

            $stmt = $pdo->prepare(
                "INSERT INTO lifestyle_meals
                 (patient_id, meal_type, meal_name, food_categories, meal_time, calories, notes, log_date)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
            );
            $stmt->execute([$patient_id, $meal_type, $meal_name, $food_cats, $meal_time, $calories, $notes, $log_date]);

            echo json_encode([
                'status'  => 'success',
                'message' => 'Meal logged successfully!',
                'id'      => $pdo->lastInsertId()
            ]);

        } elseif ($type === 'exercises') {
            $exercise_type = $data['exercise_type'] ?? null;
            $exercise_name = trim($data['exercise_name'] ?? '');
            $duration      = is_numeric($data['duration'] ?? null) ? (int)$data['duration'] : null;
            $intensity     = $data['intensity']     ?? 'moderate';
            $exercise_time = $data['exercise_time'] ?? null;
            $cal_burned    = is_numeric($data['calories_burned'] ?? null) ? (int)$data['calories_burned'] : null;
            $notes         = $data['notes']         ?? '';
            $log_date      = $data['log_date']      ?? date('Y-m-d');

            if (!$exercise_type || !$exercise_name || !$duration) {
                echo json_encode(['status' => 'error', 'message' => 'Exercise type, name, and duration are required.']); exit;
            }

            $stmt = $pdo->prepare(
                "INSERT INTO lifestyle_exercises
                 (patient_id, exercise_type, exercise_name, duration_minutes, intensity, exercise_time, calories_burned, notes, log_date)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );
            $stmt->execute([$patient_id, $exercise_type, $exercise_name, $duration, $intensity, $exercise_time, $cal_burned, $notes, $log_date]);

            echo json_encode([
                'status'  => 'success',
                'message' => 'Exercise logged successfully!',
                'id'      => $pdo->lastInsertId()
            ]);

        } elseif ($type === 'water') {
            $amount_ml = is_numeric($data['amount_ml'] ?? null) ? (int)$data['amount_ml'] : null;
            $log_date  = $data['log_date'] ?? date('Y-m-d');

            if (!$amount_ml || $amount_ml <= 0) {
                echo json_encode(['status' => 'error', 'message' => 'Valid water amount in ml is required.']); exit;
            }

            $stmt = $pdo->prepare(
                "INSERT INTO lifestyle_water (patient_id, amount_ml, log_date)
                 VALUES (?, ?, ?)"
            );
            $stmt->execute([$patient_id, $amount_ml, $log_date]);

            // Calculate today's total
            $total_stmt = $pdo->prepare(
                "SELECT COALESCE(SUM(amount_ml), 0) AS total
                 FROM lifestyle_water
                 WHERE patient_id = ? AND log_date = ?"
            );
            $total_stmt->execute([$patient_id, $log_date]);
            $total_row = $total_stmt->fetch();

            echo json_encode([
                'status'     => 'success',
                'message'    => 'Water intake logged!',
                'id'         => $pdo->lastInsertId(),
                'today_total'=> (int)$total_row['total']
            ]);

        } elseif ($type === 'sleep') {
            $sleep_date  = $data['sleep_date']    ?? null;
            $bedtime     = $data['bedtime']        ?? null;
            $wake_time   = $data['wake_time']      ?? null;
            $quality     = $data['sleep_quality']  ?? null;
            $notes       = $data['notes']          ?? '';

            if (!$sleep_date || !$bedtime || !$wake_time) {
                echo json_encode(['status' => 'error', 'message' => 'Sleep date, bedtime, and wake time are required.']); exit;
            }

            // Calculate duration in hours
            $bed  = strtotime($sleep_date . ' ' . $bedtime);
            $wake = strtotime($sleep_date . ' ' . $wake_time);
            if ($wake <= $bed) $wake = strtotime('+1 day', $wake); // overnight
            $duration_hrs = round(($wake - $bed) / 3600, 2);

            $stmt = $pdo->prepare(
                "INSERT INTO lifestyle_sleep
                 (patient_id, sleep_date, bedtime, wake_time, duration_hours, sleep_quality, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?)"
            );
            $stmt->execute([$patient_id, $sleep_date, $bedtime, $wake_time, $duration_hrs, $quality, $notes]);

            echo json_encode([
                'status'        => 'success',
                'message'       => 'Sleep logged successfully!',
                'id'            => $pdo->lastInsertId(),
                'duration_hours'=> $duration_hrs
            ]);
        }

    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'DB error: ' . $e->getMessage()]);
    }

// ── GET: Fetch history ──────────────────────────────────────────────
} elseif ($method === 'GET') {
    $data       = $_GET;
    $patient_id = resolvePatient($pdo, $data);
    $limit      = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
    $log_date   = $_GET['log_date'] ?? null;

    if (!$patient_id) {
        echo json_encode(['status' => 'error', 'message' => 'patient_id or patient_email required.']);
        exit;
    }

    try {
        if ($type === 'meals') {
            $where = $log_date ? "AND log_date = ?" : "";
            $params = $log_date ? [$patient_id, $log_date, $limit] : [$patient_id, $limit];
            $stmt = $pdo->prepare(
                "SELECT * FROM lifestyle_meals
                 WHERE patient_id = ? $where
                 ORDER BY log_date DESC, meal_time DESC
                 LIMIT ?"
            );
            $stmt->execute($params);

        } elseif ($type === 'exercises') {
            $where = $log_date ? "AND log_date = ?" : "";
            $params = $log_date ? [$patient_id, $log_date, $limit] : [$patient_id, $limit];
            $stmt = $pdo->prepare(
                "SELECT * FROM lifestyle_exercises
                 WHERE patient_id = ? $where
                 ORDER BY log_date DESC, exercise_time DESC
                 LIMIT ?"
            );
            $stmt->execute($params);

        } elseif ($type === 'water') {
            $where = $log_date ? "AND log_date = ?" : "";
            $params = $log_date ? [$patient_id, $log_date, $limit] : [$patient_id, $limit];
            $stmt = $pdo->prepare(
                "SELECT *, 
                 (SELECT COALESCE(SUM(amount_ml),0) FROM lifestyle_water WHERE patient_id = ? AND log_date = lw.log_date) AS day_total
                 FROM lifestyle_water lw
                 WHERE patient_id = ? $where
                 ORDER BY logged_at DESC
                 LIMIT ?"
            );
            // Adjust params for subquery
            $params = $log_date
                ? [$patient_id, $patient_id, $log_date, $limit]
                : [$patient_id, $patient_id, $limit];
            $stmt->execute($params);

        } elseif ($type === 'sleep') {
            $where = $log_date ? "AND sleep_date = ?" : "";
            $params = $log_date ? [$patient_id, $log_date, $limit] : [$patient_id, $limit];
            $stmt = $pdo->prepare(
                "SELECT * FROM lifestyle_sleep
                 WHERE patient_id = ? $where
                 ORDER BY sleep_date DESC
                 LIMIT ?"
            );
            $stmt->execute($params);
        }

        $rows = $stmt->fetchAll();
        echo json_encode(['status' => 'success', 'data' => $rows]);

    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'DB error: ' . $e->getMessage()]);
    }

// ── DELETE: Remove an entry ─────────────────────────────────────────
} elseif ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) { echo json_encode(['status' => 'error', 'message' => 'Invalid JSON.']); exit; }

    $patient_id = resolvePatient($pdo, $data);
    $entry_id   = isset($data['id']) ? (int)$data['id'] : null;

    if (!$patient_id || !$entry_id) {
        echo json_encode(['status' => 'error', 'message' => 'patient_id and entry id required.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM $table WHERE id = ? AND patient_id = ?");
        $stmt->execute([$entry_id, $patient_id]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['status' => 'success', 'message' => 'Entry deleted.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Entry not found or not yours.']);
        }
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'DB error: ' . $e->getMessage()]);
    }

} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
?>
