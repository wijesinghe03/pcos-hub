<?php

error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once '../db_connect.php';

header('Content-Type: application/json');

$email = $_GET['email'] ?? '';

if (!$email) {
    echo json_encode(['exists' => false]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id FROM patients WHERE email = ?");
    $stmt->execute([$email]);
    $id = $stmt->fetchColumn();

    if ($id) {
        echo json_encode(['exists' => true]);
    } else {
        echo json_encode(['exists' => false]);
    }
} catch (PDOException $e) {
    echo json_encode(['exists' => false, 'error' => $e->getMessage()]);
}
