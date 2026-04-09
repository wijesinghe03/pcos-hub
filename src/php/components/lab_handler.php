<?php
/**
 * PCOS CARE HUB — Lab Results Handler (lab_handler.php)
 * POST (multipart)  → upload a new lab result + metadata + sync to reports
 * GET               → fetch lab results list
 * DELETE            → delete a lab result
 */

require_once '../db_connect.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// ── Resolve patient_id ──────────────────────────────────────────────
function resolvePatient($pdo, $data) {
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

// ── POST: Upload lab result ──────────────────────────────────────────
if ($method === 'POST') {
    $patient_id = resolvePatient($pdo, $_POST);
    if (!$patient_id) {
        echo json_encode(['status' => 'error', 'message' => 'Patient not found.']);
        exit;
    }

    $test_name     = trim($_POST['test_name']     ?? '');
    $test_type     = trim($_POST['test_type']     ?? 'General Lab Test');
    $hospital_name = trim($_POST['hospital_name'] ?? '');
    $doctor_name   = trim($_POST['doctor_name']   ?? '');
    $report_date   = trim($_POST['report_date']   ?? date('Y-m-d'));
    $results_data  = $_POST['results_data']       ?? null; 

    if (!$test_name) {
        echo json_encode(['status' => 'error', 'message' => 'Test name is required.']);
        exit;
    }

    // ── File upload ──────────────────────────────────────────────────
    $file_path = '';
    $status    = 'received';

    if (isset($_FILES['report_file']) && $_FILES['report_file']['error'] === UPLOAD_ERR_OK) {
        $file      = $_FILES['report_file'];
        $orig_name = basename($file['name']);
        $mime      = $file['type'];
        $size      = $file['size'];

        $allowed_mime = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!in_array($mime, $allowed_mime)) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid file type.']);
            exit;
        }

        $safe_name  = $patient_id . '_lab_' . time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $orig_name);
        $upload_dir = dirname(__FILE__, 3) . '/uploads/reports/';
        if (!is_dir($upload_dir)) mkdir($upload_dir, 0755, true);

        if (move_uploaded_file($file['tmp_name'], $upload_dir . $safe_name)) {
            $file_path = 'uploads/reports/' . $safe_name;
        }
    } else {
        $status = 'received';
    }

    try {
        $pdo->beginTransaction();

        // 1. Insert into patient_reports (Master sync)
        $rptStmt = $pdo->prepare(
            "INSERT INTO patient_reports 
             (patient_id, report_name, report_type, hospital_name, doctor_name, file_name, file_path, status, report_date) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $rptStmt->execute([
            $patient_id, $test_name, $test_type, $hospital_name, $doctor_name,
            basename($file_path ?: 'No file'), $file_path, 
            ($status === 'pending' ? 'pending' : 'uploaded'), $report_date
        ]);
        $report_id = $pdo->lastInsertId();

        // 2. Insert into patient_labresults
        $labStmt = $pdo->prepare(
            "INSERT INTO patient_labresults 
             (patient_id, report_id, test_name, test_type, hospital_name, doctor_name, report_date, file_path, status, results_data) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $labStmt->execute([
            $patient_id, $report_id, $test_name, $test_type, 
            $hospital_name, $doctor_name, $report_date, $file_path, $status, $results_data
        ]);

        $pdo->commit();

        echo json_encode([
            'status' => 'success',
            'message' => 'Lab result uploaded and synced successfully!',
            'data' => [
                'id' => $pdo->lastInsertId(),
                'report_id' => $report_id
            ]
        ]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => 'DB error: ' . $e->getMessage()]);
    }

// ── DELETE: Remove lab result ──────────────────────────────────────
} elseif ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $lab_id     = (int)($data['lab_id'] ?? 0);
    $patient_id = resolvePatient($pdo, $data);

    if (!$lab_id || !$patient_id) {
        echo json_encode(['status' => 'error', 'message' => 'lab_id and patient auth required.']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // 1. Get file path and report_id
        $s = $pdo->prepare("SELECT report_id, file_path FROM patient_labresults WHERE id = ? AND patient_id = ?");
        $s->execute([$lab_id, $patient_id]);
        $row = $s->fetch();

        if (!$row) {
            echo json_encode(['status' => 'error', 'message' => 'Lab result not found.']);
            exit;
        }

        // 2. Delete from patient_labresults
        $d1 = $pdo->prepare("DELETE FROM patient_labresults WHERE id = ? AND patient_id = ?");
        $d1->execute([$lab_id, $patient_id]);

        // 3. Delete from patient_reports if report_id exists
        if ($row['report_id']) {
            $d2 = $pdo->prepare("DELETE FROM patient_reports WHERE id = ? AND patient_id = ?");
            $d2->execute([$row['report_id'], $patient_id]);
        }

        // 4. Remove file
        if ($row['file_path']) {
            $full_path = dirname(__FILE__, 3) . '/' . $row['file_path'];
            if (file_exists($full_path)) @unlink($full_path);
        }

        $pdo->commit();
        echo json_encode(['status' => 'success', 'message' => 'Lab result deleted.']);
    } catch (PDOException $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => 'DB error: ' . $e->getMessage()]);
    }

// ── GET: Fetch lab results ──────────────────────────────────────────
} elseif ($method === 'GET') {
    $patient_id = resolvePatient($pdo, $_GET);
    if (!$patient_id) {
        echo json_encode(['status' => 'error', 'message' => 'Patient auth required.']);
        exit;
    }

    $filter = $_GET['filter'] ?? 'all';

    $where = "WHERE patient_id = ?";
    $params = [$patient_id];

    if ($filter === 'received') {
        $where .= " AND status = 'received'";
    } elseif ($filter === 'pending') {
        $where .= " AND (status = 'pending' OR status = 'processing')";
    } elseif ($filter === 'this-month') {
        $where .= " AND MONTH(report_date) = MONTH(CURDATE()) AND YEAR(report_date) = YEAR(CURDATE())";
    } elseif ($filter === 'this-year') {
        $where .= " AND YEAR(report_date) = YEAR(CURDATE())";
    } elseif ($filter !== 'all') {
        // Assume it's a specific test_type
        $where .= " AND test_type = ?";
        $params[] = $filter;
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM patient_labresults $where ORDER BY report_date DESC");
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        echo json_encode(['status' => 'success', 'data' => $rows]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'DB error: ' . $e->getMessage()]);
    }

} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid method.']);
}
?>
