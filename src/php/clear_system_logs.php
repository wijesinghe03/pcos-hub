<?php

require_once 'db_connect.php';
require_once __DIR__ . '/utils/Logger.php';
header('Content-Type: application/json');

// Check for POST method and basic session/admin role could be added here
// For now, assuming request is from a validated admin session context

try {
    // Optional: Only allow clear if specifically requested
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $stmt = $pdo->query("DELETE FROM system_logs");

        \App\Utils\Logger::log('system', 'critical', 'All system activity logs cleared by administrator', 'LogManager');

        echo json_encode([
            'status' => 'success',
            'message' => 'All system logs have been cleared successfully.'
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
