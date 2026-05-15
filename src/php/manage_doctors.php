<?php

// ============================================================
// PCOS CARE HUB — Manage Doctors API (manage_doctors.php)
// ============================================================

require_once __DIR__ . '/db_connect.php';
session_start();
header('Content-Type: application/json');

// Check hospital session
if (empty($_SESSION['hospital_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized access.']);
    exit;
}

// ── Auto-Migration Guard ──
// Ensure columns are large enough for images and correct for specialists
try {
    $pdo->exec("ALTER TABLE hospital_doctors MODIFY COLUMN avatar LONGTEXT DEFAULT NULL");
    $pdo->exec("ALTER TABLE hospital_doctors ADD COLUMN IF NOT EXISTS qualification VARCHAR(255) DEFAULT NULL AFTER specialization");
    $pdo->exec("ALTER TABLE hospital_doctors ADD COLUMN IF NOT EXISTS consultation_fee DECIMAL(10,2) DEFAULT 0.00 AFTER experience");
    $pdo->exec("ALTER TABLE hospital_doctors ADD COLUMN IF NOT EXISTS availability_json TEXT DEFAULT NULL AFTER consultation_fee");
    $pdo->exec("ALTER TABLE hospital_doctors ADD COLUMN IF NOT EXISTS status ENUM('active','inactive') DEFAULT 'active' AFTER avatar");
} catch (Exception $e) {
/* Ignore if already exists */
}



$hospitalId = (int)$_SESSION['hospital_id'];

// Get Input
$data = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? $data['action'] ?? 'list';

try {
    if ($action === 'list') {
        $stmt = $pdo->prepare("SELECT * FROM hospital_doctors WHERE hospital_id = ? ORDER BY created_at DESC");
        $stmt->execute([$hospitalId]);
        $doctors = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['status' => 'success', 'data' => $doctors]);
    } elseif ($action === 'add') {
        $name = $data['name'] ?? '';
        $spec = $data['spec'] ?? '';
        $qual = $data['qual'] ?? '';
        $exp  = $data['exp'] ?? '';
        $fee  = $data['fee'] ?? 0;
        $avail = $data['availability'] ?? '';
        $avatar = $data['avatar'] ?? null;

        // Count existing doctors
        $cntStmt = $pdo->prepare("SELECT COUNT(*) FROM hospital_doctors WHERE hospital_id = ?");
        $cntStmt->execute([$hospitalId]);
        $count = $cntStmt->fetchColumn();

        if ($count >= 5) {
            echo json_encode(['status' => 'error', 'message' => 'Maximum of 5 doctors allowed.']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO hospital_doctors (hospital_id, doctor_name, specialization, qualification, experience, consultation_fee, availability_json, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$hospitalId, $name, $spec, $qual, $exp, $fee, $avail, $avatar]);
        echo json_encode(['status' => 'success', 'message' => 'Doctor added successfully!']);
    } elseif ($action === 'update') {
        $id = (int)$data['id'];
        $name = $data['name'] ?? '';
        $spec = $data['spec'] ?? '';
        $qual = $data['qual'] ?? '';
        $exp  = $data['exp'] ?? '';
        $fee  = $data['fee'] ?? 0;
        $avail = $data['availability'] ?? '';
        $avatar = $data['avatar'] ?? null;
        $status = $data['status'] ?? 'active';

        $stmt = $pdo->prepare("UPDATE hospital_doctors SET doctor_name = ?, specialization = ?, qualification = ?, experience = ?, consultation_fee = ?, availability_json = ?, avatar = ?, status = ? WHERE id = ? AND hospital_id = ?");
        $stmt->execute([$name, $spec, $qual, $exp, $fee, $avail, $avatar, $status, $id, $hospitalId]);
        echo json_encode(['status' => 'success', 'message' => 'Doctor updated successfully!']);
    } elseif ($action === 'delete') {
        $id = (int)($_GET['id'] ?? $data['id'] ?? 0);
        $stmt = $pdo->prepare("DELETE FROM hospital_doctors WHERE id = ? AND hospital_id = ?");
        $stmt->execute([$id, $hospitalId]);
        echo json_encode(['status' => 'success', 'message' => 'Doctor removed successfully!']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
