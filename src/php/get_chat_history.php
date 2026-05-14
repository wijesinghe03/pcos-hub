<?php
// ============================================================
// PCOS CARE HUB — Fetch Chat History (get_chat_history.php)
// ============================================================

require_once 'db_connect.php';
session_start();
header('Content-Type: application/json');

$userId = $_SESSION['user_id'] ?? null;
$userRole = $_SESSION['user_role'] ?? null;

if (!$userId) {
    echo json_encode(['status' => 'error', 'message' => 'Not logged in.']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT message, sender, created_at FROM chatbot_history WHERE user_id = ? AND user_role = ? ORDER BY created_at ASC");
    $stmt->execute([$userId, $userRole]);
    $history = $stmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'history' => $history
    ]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
