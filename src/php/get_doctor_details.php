<?php

require_once __DIR__ . '/db_connect.php';
header('Content-Type: application/json');

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$id) {
    echo json_encode(['status' => 'error', 'message' => 'Doctor ID is required.']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, doctor_name, specialization, qualification, experience, avatar, consultation_fee, availability_json, status FROM hospital_doctors WHERE id = ?");
    $stmt->execute([$id]);
    $doctor = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$doctor) {
        echo json_encode(['status' => 'error', 'message' => 'Doctor not found.']);
    } else {
        echo json_encode(['status' => 'success', 'data' => $doctor]);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
