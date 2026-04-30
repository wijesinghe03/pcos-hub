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
    
    $action = $data['action'] ?? 'save';

    if ($action !== 'save_hospital_appointment') {
        $patient_id = resolvePatient($pdo, $data);
        if (!$patient_id) {
            echo json_encode(['status' => 'error', 'message' => 'Patient not found.']);
            exit;
        }
    } else {
        // We still resolve it if possible, but don't strictly require it to block execution
        // Alternatively, since save_hospital_appointment uses email/contact, it's fine.
        $patient_id = resolvePatient($pdo, $data) ?? null;
    }

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

    if ($action === 'pay') {
        $appt_id = $data['id'] ?? null;
        if (!$appt_id) {
            echo json_encode(['status' => 'error', 'message' => 'Missing ID.']);
            exit;
        }

        try {
            // Get appointment details for email
            $stmt = $pdo->prepare("SELECT * FROM patient_appointments WHERE id = ? AND patient_id = ?");
            $stmt->execute([$appt_id, $patient_id]);
            $appt = $stmt->fetch();

            if (!$appt) {
                echo json_encode(['status' => 'error', 'message' => 'Appointment not found.']);
                exit;
            }

            // Get patient email
            $pStmt = $pdo->prepare("SELECT email, full_name FROM patients WHERE id = ?");
            $pStmt->execute([$patient_id]);
            $patient = $pStmt->fetch();

            $stmt = $pdo->prepare("UPDATE patient_appointments SET payment_status = 'paid' WHERE id = ? AND patient_id = ?");
            $stmt->execute([$appt_id, $patient_id]);

            // Send Email
            try {
                require_once '../utils/Mailer.php';
                $subject = "Payment Successful - Appointment at " . $appt['hospital_name'];
                $emailBody = "
                    <p>Hi <strong>" . ($patient['full_name'] ?? 'Patient') . "</strong>,</p>
                    <p>We have successfully received your payment for the following appointment:</p>
                    <div style='background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;'>
                        <p><strong>Hospital:</strong> " . $appt['hospital_name'] . "</p>
                        <p><strong>Doctor:</strong> " . $appt['doctor_name'] . "</p>
                        <p><strong>Date:</strong> " . $appt['appointment_date'] . "</p>
                        <p><strong>Time:</strong> " . $appt['appointment_time'] . "</p>
                        <p><strong>Status:</strong> <span style='color: #22c55e; font-weight: bold;'>PAID</span></p>
                    </div>
                    <p>Amount Received: <strong>Rs. 2,500.00</strong></p>
                    <p>Thank you for choosing PCOS Care Hub.</p>
                ";
                Mailer::send($patient['email'], $subject, $emailBody);
            } catch (Exception $e) {
                error_log("Payment email failed: " . $e->getMessage());
            }

            echo json_encode(['status' => 'success', 'message' => 'Payment successful! Confirmation email sent.']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        exit;
    }

    if ($action === 'save') {
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
            // 1. Check Daily Limit (Max 30 per doctor per day)
            $limitStmt = $pdo->prepare("SELECT COUNT(*) FROM patient_appointments WHERE doctor_name = ? AND hospital_name = ? AND appointment_date = ? AND status != 'cancelled'");
            $limitStmt->execute([$doctor, $hosp, $date]);
            $dailyCount = $limitStmt->fetchColumn();

            if ($dailyCount >= 30) {
                echo json_encode(['status' => 'error', 'message' => 'This doctor has reached the maximum of 30 appointments for this day. Please select another date.']);
                exit;
            }

            // 2. Check Double Booking (Concurrency check)
            $dupStmt = $pdo->prepare("SELECT COUNT(*) FROM patient_appointments WHERE doctor_name = ? AND hospital_name = ? AND appointment_date = ? AND appointment_time = ? AND status != 'cancelled'");
            $dupStmt->execute([$doctor, $hosp, $date, $time]);
            $isBooked = $dupStmt->fetchColumn();

            if ($isBooked > 0) {
                echo json_encode(['status' => 'error', 'message' => 'This time slot is already booked by another patient. Please select a different appointment time.']);
                exit;
            }

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

    if ($action === 'save_hospital_appointment') {
        $patient_name = $data['patient_name'] ?? '';
        $email = $data['patient_email'] ?? '';
    $contact = $data['contact_number'] ?? '';
    $hosp = $data['hospital_name'] ?? '';
    $doctor = $data['doctor_name'] ?? '';
    $date = $data['appointment_date'] ?? '';
    $time = $data['appointment_time'] ?? '';

    if (!$hosp || !$doctor || !$patient_name || !$email || !$contact || !$date || !$time) {
        echo json_encode(['status' => 'error', 'message' => 'All fields are required.']);
        exit;
    }

    try {
        // 1. Check Daily Limit
        $limitStmt = $pdo->prepare("SELECT COUNT(*) FROM hospital_appointments WHERE doctor_name = ? AND hospital_name = ? AND appointment_date = ?");
        $limitStmt->execute([$doctor, $hosp, $date]);
        $dailyCount = $limitStmt->fetchColumn();

        if ($dailyCount >= 30) {
            echo json_encode(['status' => 'error', 'message' => 'This doctor has reached the maximum of 30 appointments for this day. Please select another date.']);
            exit;
        }

        // 2. Double booking
        $dupStmt = $pdo->prepare("SELECT COUNT(*) FROM hospital_appointments WHERE doctor_name = ? AND hospital_name = ? AND appointment_date = ? AND appointment_time = ?");
        $dupStmt->execute([$doctor, $hosp, $date, $time]);
        $isBooked = $dupStmt->fetchColumn();

        if ($isBooked > 0) {
            echo json_encode(['status' => 'error', 'message' => 'This time slot is already booked. Please select a different time.']);
            exit;
        }
        
        // 3. Get next appointment number for the day
        $nextApptNum = $dailyCount + 1;

        $stmt = $pdo->prepare("INSERT INTO hospital_appointments (hospital_name, doctor_name, patient_name, email, contact_number, appointment_number, appointment_date, appointment_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$hosp, $doctor, $patient_name, $email, $contact, $nextApptNum, $date, $time]);
        $appt_id = $pdo->lastInsertId();

        // Also add to patient dashboard if patient_id is present
        if ($patient_id) {
            try {
                $stmt2 = $pdo->prepare("INSERT INTO patient_appointments (patient_id, hospital_name, doctor_name, appointment_date, appointment_time, appointment_type, reason, status) VALUES (?, ?, ?, ?, ?, 'consultation', ?, 'upcoming')");
                $stmt2->execute([$patient_id, $hosp, $doctor, $date, $time, $data['reason'] ?? '']);
            } catch (PDOException $e) {
                error_log("Dashboard sync failed: " . $e->getMessage());
            }
        }

        // Send Email
        try {
            require_once '../utils/Mailer.php';
            $subject = "Your Appointment Number: #$nextApptNum at $hosp";
            $emailBody = "
                <p>Hi <strong>$patient_name</strong>,</p>
                <p>Your appointment has been successfully scheduled.</p>
                <div style='background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #6a11cb;'>
                    <p><strong>Appointment Number:</strong> #$nextApptNum</p>
                    <p><strong>Hospital:</strong> $hosp</p>
                    <p><strong>Doctor:</strong> $doctor</p>
                    <p><strong>Date:</strong> $date</p>
                    <p><strong>Time:</strong> $time</p>
                </div>
                <p>Please present your appointment number at the hospital reception.</p>
            ";
            Mailer::send($email, $subject, $emailBody);
        } catch (Exception $e) {
            error_log("Hospital Appointment email failed: " . $e->getMessage());
        }

        echo json_encode(['status' => 'success', 'message' => 'Appointment booked! Confirmation email sent.', 'id' => $appt_id]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
    exit;
}
?>
