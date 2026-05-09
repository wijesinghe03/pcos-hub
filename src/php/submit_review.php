<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
    exit;
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!isset($data['hospital_id']) || !isset($data['rating'])) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields.']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO hospital_reviews (hospital_id, rating, comment) VALUES (?, ?, ?)");
    $stmt->execute([
        $data['hospital_id'],
        $data['rating'],
        $data['comment'] ?? null
    ]);

    // Log the review activity
    require_once __DIR__ . '/utils/Logger.php';
    Logger::log('patient', 'info', "New hospital review submitted: Rating {$data['rating']}/5 for Hospital ID: {$data['hospital_id']}", 'Patient');

    echo json_encode(['status' => 'success', 'message' => 'Review submitted successfully!']);
} catch (Exception $e) {
    require_once __DIR__ . '/utils/Logger.php';
    Logger::log('database', 'error', "Failed to save hospital review: " . $e->getMessage(), 'System');
    echo json_encode(['status' => 'error', 'message' => 'Failed to save review: ' . $e->getMessage()]);
}
