<?php

// ============================================================
// PCOS CARE HUB — Update Hospital Consultation API
// ============================================================

require_once __DIR__ . '/db_connect.php';

if (!isset($_SESSION)) {
    session_start();
}
header('Content-Type: application/json');

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data || !isset($data['action'])) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request.']);
    exit;
}

$id = $data['id'] ?? null;
$action = $data['action'];

if (!$id) {
    echo json_encode(['status' => 'error', 'message' => 'Record ID is required.']);
    exit;
}

try {
    if ($action === 'complete') {
        $pdo->beginTransaction();
        
        $stmt1 = $pdo->prepare("UPDATE consultations SET status = 'completed' WHERE id = ?");
        $stmt1->execute([$id]);
        
        // Fetch details to sync with patient_appointments
        $hStmt = $pdo->prepare("SELECT * FROM consultations WHERE id = ?");
        $hStmt->execute([$id]);
        $hAppt = $hStmt->fetch(\PDO::FETCH_ASSOC);
        
        if ($hAppt && $hAppt['patient_id']) {
            $stmt2 = $pdo->prepare("
                UPDATE patient_appointments 
                SET status = 'completed' 
                WHERE patient_id = ? AND appointment_date = ? AND appointment_time = ? AND hospital_name = ?
            ");
            $stmt2->execute([$hAppt['patient_id'], $hAppt['appointment_date'], $hAppt['appointment_time'], $hAppt['hospital_name']]);
        }
        
        $pdo->commit();
        echo json_encode(['status' => 'success', 'message' => 'Consultation marked as completed.']);

    } elseif ($action === 'delete') {
        $pdo->beginTransaction();
        
        $hStmt = $pdo->prepare("SELECT * FROM consultations WHERE id = ?");
        $hStmt->execute([$id]);
        $hAppt = $hStmt->fetch(\PDO::FETCH_ASSOC);
        
        $stmt1 = $pdo->prepare("DELETE FROM consultations WHERE id = ?");
        $stmt1->execute([$id]);
        
        if ($hAppt && $hAppt['patient_id']) {
            $stmt2 = $pdo->prepare("
                DELETE FROM patient_appointments 
                WHERE patient_id = ? AND appointment_date = ? AND appointment_time = ? AND hospital_name = ?
            ");
            $stmt2->execute([$hAppt['patient_id'], $hAppt['appointment_date'], $hAppt['appointment_time'], $hAppt['hospital_name']]);
        }
        
        $pdo->commit();
        echo json_encode(['status' => 'success', 'message' => 'Consultation record removed permanently.']);

    } elseif ($action === 'edit') {
        $date = $data['appointment_date'] ?? '';
        $time = $data['appointment_time'] ?? '';
        $notes = $data['reason'] ?? '';
        
        if (!$date || !$time) {
            echo json_encode(['status' => 'error', 'message' => 'Date and Time are required.']);
            exit;
        }

        $pdo->beginTransaction();
        
        $hStmt = $pdo->prepare("SELECT * FROM consultations WHERE id = ?");
        $hStmt->execute([$id]);
        $oldAppt = $hStmt->fetch(\PDO::FETCH_ASSOC);

        $stmt1 = $pdo->prepare("UPDATE consultations SET appointment_date = ?, appointment_time = ?, notes = ? WHERE id = ?");
        $stmt1->execute([$date, $time, $notes, $id]);
        
        if ($oldAppt && $oldAppt['patient_id']) {
            $stmt2 = $pdo->prepare("
                UPDATE patient_appointments 
                SET appointment_date = ?, appointment_time = ?, reason = ? 
                WHERE patient_id = ? AND hospital_name = ? AND appointment_date = ? AND appointment_time = ?
            ");
            $stmt2->execute([$date, $time, $notes, $oldAppt['patient_id'], $oldAppt['hospital_name'], $oldAppt['appointment_date'], $oldAppt['appointment_time']]);
        }
        
        $pdo->commit();
        echo json_encode(['status' => 'success', 'message' => 'Consultation updated successfully.']);

    } else {
        echo json_encode(['status' => 'error', 'message' => 'Unknown action.']);
    }

} catch (\Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(['status' => 'error', 'message' => 'Server error: ' . $e->getMessage()]);
}
