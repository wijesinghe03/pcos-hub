<?php
/**
 * PCOS CARE HUB — Patient Reports Handler (report_handler.php)
 * POST (multipart)  → upload a new report file + metadata
 * GET               → fetch reports list (filter: all / this-month / this-year / pending)
 * DELETE            → delete a report by id
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

// ── POST: Upload report ─────────────────────────────────────────────
if ($method === 'POST') {

    $patient_id = resolvePatient($pdo, $_POST);
    if (!$patient_id) {
        echo json_encode(['status' => 'error', 'message' => 'Patient not found. Please log in again.']);
        exit;
    }

    // Validate required fields
    $report_name   = trim($_POST['report_name']   ?? '');
    $report_type   = trim($_POST['report_type']   ?? 'other');
    $hospital_name = trim($_POST['hospital_name'] ?? '');
    $notes         = trim($_POST['notes']         ?? '');
    $report_date   = trim($_POST['report_date']   ?? date('Y-m-d'));
    $status        = 'uploaded';

    if (!$report_name) {
        echo json_encode(['status' => 'error', 'message' => 'Report name is required.']);
        exit;
    }

    $valid_types = ['lab', 'scan', 'prescription', 'imaging', 'other'];
    if (!in_array($report_type, $valid_types)) $report_type = 'other';

    // ── File upload ──────────────────────────────────────────────────
    $file_name = '';
    $file_path = '';
    $file_size = 0;
    $file_type_mime = '';

    if (isset($_FILES['report_file']) && $_FILES['report_file']['error'] === UPLOAD_ERR_OK) {
        $file      = $_FILES['report_file'];
        $orig_name = basename($file['name']);
        $mime      = $file['type'];
        $size      = $file['size'];

        $allowed_mime = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!in_array($mime, $allowed_mime)) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid file type. Allowed: PDF, JPG, PNG.']);
            exit;
        }
        if ($size > 10 * 1024 * 1024) {
            echo json_encode(['status' => 'error', 'message' => 'File too large. Maximum 10 MB.']);
            exit;
        }

        // Build safe filename: patientId_timestamp_originalname
        $ext        = pathinfo($orig_name, PATHINFO_EXTENSION);
        $safe_name  = $patient_id . '_' . time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $orig_name);
        $upload_dir = dirname(__FILE__, 3) . '/uploads/reports/';

        if (!is_dir($upload_dir)) mkdir($upload_dir, 0755, true);

        if (!move_uploaded_file($file['tmp_name'], $upload_dir . $safe_name)) {
            echo json_encode(['status' => 'error', 'message' => 'Failed to save file. Check server permissions.']);
            exit;
        }

        $file_name      = $orig_name;
        $file_path      = 'uploads/reports/' . $safe_name;
        $file_size      = $size;
        $file_type_mime = $mime;
    } else {
        // No file — allow metadata-only entry (pending status)
        $status    = 'pending';
        $file_name = 'No file attached';
        $file_path = '';
    }

    try {
        $stmt = $pdo->prepare(
            "INSERT INTO patient_reports
             (patient_id, report_name, report_type, hospital_name, file_name, file_path,
              file_size, file_type, status, notes, report_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $patient_id, $report_name, $report_type, $hospital_name,
            $file_name, $file_path, $file_size, $file_type_mime,
            $status, $notes, $report_date
        ]);

        echo json_encode([
            'status'  => 'success',
            'message' => 'Report uploaded successfully!',
            'id'      => $pdo->lastInsertId(),
            'report'  => [
                'id'            => $pdo->lastInsertId(),
                'report_name'   => $report_name,
                'report_type'   => $report_type,
                'hospital_name' => $hospital_name,
                'status'        => $status,
                'report_date'   => $report_date,
                'file_name'     => $file_name,
                'file_path'     => $file_path,
            ]
        ]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'DB error: ' . $e->getMessage()]);
    }

// ── GET: Fetch reports ─────────────────────────────────────────────
} elseif ($method === 'GET') {

    $patient_id = resolvePatient($pdo, $_GET);
    if (!$patient_id) {
        echo json_encode(['status' => 'error', 'message' => 'patient_id or patient_email is required.']);
        exit;
    }

    $filter = $_GET['filter'] ?? 'all';
    $limit  = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;

    // Build WHERE clause based on filter
    $where  = "WHERE patient_id = ?";
    $params = [$patient_id];

    if ($filter === 'pending') {
        $where .= " AND status = 'pending'";
    } elseif ($filter === 'this-month') {
        $where .= " AND MONTH(report_date) = MONTH(CURDATE()) AND YEAR(report_date) = YEAR(CURDATE())";
    } elseif ($filter === 'this-year') {
        $where .= " AND YEAR(report_date) = YEAR(CURDATE())";
    }

    // limit=0 means "count all" — no LIMIT clause
    $limitClause = ($limit > 0) ? "LIMIT ?" : "";

    try {
        $sql  = "SELECT id, report_name, report_type, hospital_name, file_name, file_path,
                        file_size, file_type, status, notes, report_date, uploaded_at
                 FROM patient_reports
                 $where
                 ORDER BY report_date DESC, uploaded_at DESC
                 $limitClause";
        $stmt = $pdo->prepare($sql);
        if ($limit > 0) {
            $params[] = $limit;
        }
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        // Total count (unfiltered) for sidebar badge
        $countStmt = $pdo->prepare("SELECT COUNT(*) as total FROM patient_reports WHERE patient_id = ?");
        $countStmt->execute([$patient_id]);
        $total = $countStmt->fetch()['total'];

        echo json_encode([
            'status' => 'success',
            'data'   => $rows,
            'total'  => (int)$total
        ]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'DB error: ' . $e->getMessage()]);
    }

// ── DELETE: Remove report ──────────────────────────────────────────
} elseif ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $report_id  = (int)($data['report_id'] ?? 0);
    $patient_id = resolvePatient($pdo, $data);

    if (!$report_id || !$patient_id) {
        echo json_encode(['status' => 'error', 'message' => 'report_id and patient auth required.']);
        exit;
    }

    try {
        // Get file path first so we can remove the file
        $s = $pdo->prepare("SELECT file_path FROM patient_reports WHERE id = ? AND patient_id = ?");
        $s->execute([$report_id, $patient_id]);
        $row = $s->fetch();

        if (!$row) {
            echo json_encode(['status' => 'error', 'message' => 'Report not found.']);
            exit;
        }

        // Delete from DB
        $d = $pdo->prepare("DELETE FROM patient_reports WHERE id = ? AND patient_id = ?");
        $d->execute([$report_id, $patient_id]);

        // Remove physical file if it exists
        if ($row['file_path']) {
            $full_path = dirname(__FILE__, 3) . '/' . $row['file_path'];
            if (file_exists($full_path)) @unlink($full_path);
        }

        echo json_encode(['status' => 'success', 'message' => 'Report deleted.']);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'DB error: ' . $e->getMessage()]);
    }

} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid method.']);
}
?>
