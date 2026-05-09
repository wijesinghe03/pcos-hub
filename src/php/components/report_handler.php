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
    $doctor_name   = trim($_POST['doctor_name']   ?? '');
    $notes         = trim($_POST['notes']         ?? '');
    $report_date   = trim($_POST['report_date']   ?? date('Y-m-d'));
    $status        = 'uploaded';

    if (!$report_name) {
        echo json_encode(['status' => 'error', 'message' => 'Report name is required.']);
        exit;
    }

    $valid_types = ['lab', 'scan', 'prescription', 'imaging', 'other'];
    if (!in_array($report_type, $valid_types)) {
        $report_type = 'other';
    }

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

        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }

        if (!move_uploaded_file($file['tmp_name'], $upload_dir . $safe_name)) {
            echo json_encode(['status' => 'error', 'message' => 'Failed to save file. Check server permissions.']);
            exit;
        }

        $file_name      = $orig_name;
        $file_path      = 'uploads/reports/' . $safe_name;
        $file_size      = $size;
        $file_type_mime = $mime;
    } else {
        // No file — still allow metadata-only entry (marked as uploaded as requested)
        $status    = 'uploaded';
        $file_name = 'No file attached';
        $file_path = '';
    }

    try {
        $stmt = $pdo->prepare(
            "INSERT INTO patient_reports
             (patient_id, report_name, report_type, hospital_name, doctor_name, file_name, file_path,
              file_size, file_type, status, notes, report_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $patient_id, $report_name, $report_type, $hospital_name, $doctor_name,
            $file_name, $file_path, $file_size, $file_type_mime,
            $status, $notes, $report_date
        ]);
        $report_id = $pdo->lastInsertId();

        // ── SYNC: If it's a lab result, also add to patient_labresults table ──
        if ($report_type === 'lab') {
            $labStmt = $pdo->prepare(
                "INSERT INTO patient_labresults 
                 (patient_id, report_id, test_name, test_type, hospital_name, report_date, file_path, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
            );
            $labStmt->execute([
                $patient_id, $report_id, $report_name, 'General Lab Test',
                $hospital_name, $report_date, $file_path,
                ($status === 'pending' ? 'pending' : 'received')
            ]);
        }
        // Send Notification Email to Patient
        try {
            require_once '../utils/Mailer.php';
            $patientStmt = $pdo->prepare("SELECT email, full_name FROM patients WHERE id = ?");
            $patientStmt->execute([$patient_id]);
            $patient = $patientStmt->fetch();

            if ($patient) {
                $subject = "New Medical Report Uploaded: $report_name";
                $emailBody = "
                    <p>Hi <strong>{$patient['full_name']}</strong>,</p>
                    <p>A new medical report has been added to your profile.</p>
                    <div style='background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #6a11cb;'>
                        <p><strong>Report Name:</strong> $report_name</p>
                        <p><strong>Type:</strong> $report_type</p>
                        <p><strong>Hospital:</strong> $hospital_name</p>
                    </div>
                    <p>You can view and download this report from your medical history dashboard.</p>
                    <a href='#' class='button'>View My Reports</a>
                ";
                Mailer::send($patient['email'], $subject, $emailBody);
            }
        } catch (Exception $e) {
            error_log("Medical report email failed: " . $e->getMessage());
        }

        echo json_encode([
            'status'  => 'success',
            'message' => 'Report uploaded successfully!',
            'id'      => $report_id,
            'report'  => [
                'id'            => $report_id,
                'report_name'   => $report_name,
                'report_type'   => $report_type,
                'hospital_name' => $hospital_name,
                'doctor_name'   => $doctor_name,
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
    } elseif ($filter === 'lab') {
        // Broad list of lab-type tests
        $lab_types = [
            'LH (Luteinizing Hormone) Test',
            'FSH (Follicle Stimulating Hormone) Test',
            'Testosterone Level Test',
            'Prolactin Test',
            'Thyroid Function Test (TSH, T3, T4)',
            'Fasting Blood Sugar (FBS)',
            'Oral Glucose Tolerance Test (OGTT)',
            'HbA1c Test',
            'Lipid Profile (Cholesterol Test)',
            'lab' // support legacy
        ];
        $where .= " AND report_type IN (" . implode(',', array_fill(0, count($lab_types), '?')) . ")";
        $params = array_merge($params, $lab_types);
    } elseif ($filter === 'scan') {
        $scan_types = ['Pelvic Ultrasound Scan', 'scan', 'imaging', 'Ultrasound'];
        $where .= " AND report_type IN (" . implode(',', array_fill(0, count($scan_types), '?')) . ")";
        $params = array_merge($params, $scan_types);
    } elseif ($filter !== 'all') {
        // Fallback for specific categories like 'prescription', 'other'
        // or specific test names like 'LH (Luteinizing Hormone) Test'
        $where .= " AND report_type = ?";
        $params[] = $filter;
    }

    // limit=0 means "count all" — no LIMIT clause
    $limitClause = ($limit > 0) ? "LIMIT " . (int)$limit : "";

    try {
        $sql  = "SELECT id, report_name, report_type, hospital_name, doctor_name, file_name, file_path,
                        file_size, file_type, status, notes, report_date
                 FROM patient_reports
                 $where
                 ORDER BY report_date DESC
                 $limitClause";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        // Statistics counts
        $totalStmt = $pdo->prepare("SELECT COUNT(*) as c FROM patient_reports WHERE patient_id = ?");
        $totalStmt->execute([$patient_id]);
        $total = $totalStmt->fetch()['c'];

        $monthStmt = $pdo->prepare("SELECT COUNT(*) as c FROM patient_reports WHERE patient_id = ? AND MONTH(report_date) = MONTH(CURDATE()) AND YEAR(report_date) = YEAR(CURDATE())");
        $monthStmt->execute([$patient_id]);
        $month = $monthStmt->fetch()['c'];

        $yearStmt = $pdo->prepare("SELECT COUNT(*) as c FROM patient_reports WHERE patient_id = ? AND YEAR(report_date) = YEAR(CURDATE())");
        $yearStmt->execute([$patient_id]);
        $year = $yearStmt->fetch()['c'];

        echo json_encode([
            'status' => 'success',
            'data'   => $rows,
            'stats'  => [
                'total' => (int)$total,
                'month' => (int)$month,
                'year'  => (int)$year
            ]
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

        // Delete from DB (patient_reports)
        $d = $pdo->prepare("DELETE FROM patient_reports WHERE id = ? AND patient_id = ?");
        $d->execute([$report_id, $patient_id]);

        // ── SYNC: Also delete from patient_labresults if linked ──
        $d2 = $pdo->prepare("DELETE FROM patient_labresults WHERE report_id = ? AND patient_id = ?");
        $d2->execute([$report_id, $patient_id]);

        // Remove physical file if it exists
        if ($row['file_path']) {
            $full_path = dirname(__FILE__, 3) . '/' . $row['file_path'];
            if (file_exists($full_path)) {
                @unlink($full_path);
            }
        }

        echo json_encode(['status' => 'success', 'message' => 'Report deleted.']);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'DB error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid method.']);
}
