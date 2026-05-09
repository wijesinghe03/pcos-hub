<?php

// PCOS CARE HUB — Patient Data Export Handler (v2 - Full Integrity)
header('Content-Type: application/json');

require_once '../db_connect.php';

$patient_id = $_GET['patient_id'] ?? null;

if (!$patient_id) {
    echo json_encode(['status' => 'error', 'message' => 'Patient ID required']);
    exit;
}

try {
    $exportData = [
        'export_metadata' => [
            'generated_at' => date('Y-m-d H:i:s'),
            'system' => 'PCOS Care Hub',
            'version' => '2.0-Alpha'
        ]
    ];

    // 1. Profile Info
    $stmt = $pdo->prepare("SELECT id, full_name, username, email, dob, phone, address, blood_group, created_at FROM patients WHERE id = ?");
    $stmt->execute([$patient_id]);
    $exportData['profile'] = $stmt->fetch(PDO::FETCH_ASSOC);

    // 2. Symptom History
    $stmt = $pdo->prepare("SELECT * FROM symptom_logs WHERE patient_id = ? ORDER BY log_date DESC");
    $stmt->execute([$patient_id]);
    $exportData['symptom_history'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Menstrual Cycle Logs
    $stmt = $pdo->prepare("SELECT * FROM cycle_logs WHERE patient_id = ? ORDER BY period_start DESC");
    $stmt->execute([$patient_id]);
    $exportData['menstrual_cycles'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. Appointments
    $stmt = $pdo->prepare("SELECT * FROM patient_appointments WHERE patient_id = ? ORDER BY appointment_date DESC");
    $stmt->execute([$patient_id]);
    $exportData['appointments'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 5. Medical Reports (Master List)
    $stmt = $pdo->prepare("SELECT * FROM patient_reports WHERE patient_id = ? ORDER BY report_date DESC");
    $stmt->execute([$patient_id]);
    $exportData['medical_reports'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 6. Lab Results (Detailed Data)
    $stmt = $pdo->prepare("SELECT * FROM patient_labresults WHERE patient_id = ? ORDER BY report_date DESC");
    $stmt->execute([$patient_id]);
    $exportData['lab_detailed_results'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 7. Lifestyle Logs
    $exportData['lifestyle'] = [
        'meals'    => [],
        'activity' => [],
        'hydration' => [],
        'sleep'    => []
    ];

    $stmt = $pdo->prepare("SELECT * FROM lifestyle_meals WHERE patient_id = ? ORDER BY log_date DESC");
    $stmt->execute([$patient_id]);
    $exportData['lifestyle']['meals'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $pdo->prepare("SELECT * FROM lifestyle_exercises WHERE patient_id = ? ORDER BY log_date DESC");
    $stmt->execute([$patient_id]);
    $exportData['lifestyle']['activity'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $pdo->prepare("SELECT * FROM lifestyle_water WHERE patient_id = ? ORDER BY log_date DESC");
    $stmt->execute([$patient_id]);
    $exportData['lifestyle']['hydration'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $pdo->prepare("SELECT * FROM lifestyle_sleep WHERE patient_id = ? ORDER BY sleep_date DESC");
    $stmt->execute([$patient_id]);
    $exportData['lifestyle']['sleep'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 8. Saved Hospitals / Connections
    $stmt = $pdo->prepare("SELECT * FROM patient_hospitals WHERE patient_id = ?");
    $stmt->execute([$patient_id]);
    $exportData['connected_hospitals'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Output as JSON file
    $filename = "PCOS_FullArchive_" . (isset($exportData['profile']['username']) ? $exportData['profile']['username'] : 'User') . "_" . date('Ymd_His') . ".json";
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    echo json_encode($exportData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Full Export failed: ' . $e->getMessage()]);
}
