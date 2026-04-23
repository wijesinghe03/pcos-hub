<?php
/**
 * PCOS CARE HUB — Appointment Handler (appointment_handler.php)
 * Manages patient appointments (CRUD, filtering, rescheduling).
 */

require_once '../db_connect.php';
session_start();

header('Content-Type: application/json');

function resolvePatient($pdo, $data) {
    if (isset($_SESSION['patient_id'])) {
        return (int)$_SESSION['patient_id'];
    }
    $id = $data['patient_id'] ?? $_GET['patient_id'] ?? null;
    $email = $data['patient_email'] ?? $_GET['patient_email'] ?? null;

    if ($id) {
        $stmt = $pdo->prepare("SELECT id FROM patients WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetchColumn();
    }
    if ($email) {
        $stmt = $pdo->prepare("SELECT id FROM patients WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetchColumn();
    }
    return null;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $patient_id = resolvePatient($pdo, $_GET);
    if (!$patient_id) {
        echo json_encode(['status' => 'error', 'message' => 'Patient not found.']);
        exit;
    }

    $filter = $_GET['filter'] ?? 'all';
    $search = $_GET['search'] ?? '';
    $limit  = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;

    $sql = "SELECT * FROM patient_appointments WHERE patient_id = :pid";
    $params = [':pid' => $patient_id];

    if ($filter === 'upcoming') {
        $sql .= " AND (status = 'upcoming' OR status = 'rescheduled')";
    } elseif ($filter === 'past') {
        $sql .= " AND (status = 'completed' OR status = 'cancelled' OR appointment_date < CURDATE())";
    }

    if (!empty($search)) {
        $sql .= " AND (hospital_name LIKE :search OR doctor_name LIKE :search OR reason LIKE :search)";
        $params[':search'] = '%' . $search . '%';
    }

    $sql .= " ORDER BY appointment_date DESC, appointment_time DESC LIMIT :limit";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':pid', $params[':pid'], PDO::PARAM_INT);
        if (isset($params[':search'])) {
            $stmt->bindValue(':search', $params[':search'], PDO::PARAM_STR);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        $results = $stmt->fetchAll();
        echo json_encode(['status' => 'success', 'data' => $results]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    $patient_id = resolvePatient($pdo, $data);
    if (!$patient_id) {
        echo json_encode(['status' => 'error', 'message' => 'Patient not found.']);
        exit;
    }

    $action = $data['action'] ?? 'save';

    if ($action === 'reschedule') {
        $appt_id = $data['id'] ?? null;
        $newDate = $data['appointment_date'] ?? null;
        $newTime = $data['appointment_time'] ?? null;
        
        if (!$appt_id || !$newDate || !$newTime) {
            echo json_encode(['status' => 'error', 'message' => 'Missing ID or schedule details.']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("UPDATE patient_appointments SET appointment_date = ?, appointment_time = ?, status = 'rescheduled' WHERE id = ? AND patient_id = ?");
            $stmt->execute([$newDate, $newTime, $appt_id, $patient_id]);
            echo json_encode(['status' => 'success', 'message' => 'Appointment rescheduled.']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        exit;
    }

    if ($action === 'cancel') {
        $appt_id = $data['id'] ?? null;
        if (!$appt_id) {
            echo json_encode(['status' => 'error', 'message' => 'Missing ID.']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("UPDATE patient_appointments SET status = 'cancelled' WHERE id = ? AND patient_id = ?");
            $stmt->execute([$appt_id, $patient_id]);
            echo json_encode(['status' => 'success', 'message' => 'Appointment cancelled.']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        exit;
    }

    // Default: Save new appointment
    $hosp    = $data['hospital_name'] ?? '';
    $doctor  = $data['doctor_name']   ?? '';
    $date    = $data['appointment_date'] ?? '';
    $time    = $data['appointment_time'] ?? '';
    $type    = $data['appointment_type'] ?? 'consultation';
    $reason  = $data['reason'] ?? '';

    if (!$hosp || !$date || !$time) {
        echo json_encode(['status' => 'error', 'message' => 'Hospital, Date, and Time are required.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO patient_appointments (patient_id, hospital_name, doctor_name, appointment_date, appointment_time, appointment_type, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'upcoming')");
        $stmt->execute([$patient_id, $hosp, $doctor, $date, $time, $type, $reason]);
        
        $appt_id = $pdo->lastInsertId();

        // Send Confirmation Email
        try {
            require_once '../utils/Mailer.php';
            $patientStmt = $pdo->prepare("SELECT email, full_name FROM patients WHERE id = ?");
            $patientStmt->execute([$patient_id]);
            $patient = $patientStmt->fetch();

            if ($patient) {
                $subject = "Appointment Confirmation: $hosp";
                $emailBody = "
                    <p>Hi <strong>{$patient['full_name']}</strong>,</p>
                    <p>Your appointment has been successfully scheduled.</p>
                    <div style='background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #6a11cb;'>
                        <p><strong>Hospital:</strong> $hosp</p>
                        <p><strong>Doctor:</strong> $doctor</p>
                        <p><strong>Date:</strong> $date</p>
                        <p><strong>Time:</strong> $time</p>
                        <p><strong>Type:</strong> $type</p>
                    </div>
                    <p>Please arrive 15 minutes early for your appointment.</p>
                ";
                Mailer::send($patient['email'], $subject, $emailBody);
            }
        } catch (Exception $e) {
            error_log("Appointment email failed: " . $e->getMessage());
        }

        echo json_encode(['status' => 'success', 'message' => 'Appointment scheduled successfully!', 'id' => $appt_id]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
?>
