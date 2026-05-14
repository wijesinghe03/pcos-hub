<?php
session_start();
require_once 'db_connect.php';
require_once __DIR__ . '/utils/Logger.php';

header('Content-Type: application/json');

// Security Check: Only admins can clear cache
if (empty($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized access.']);
    exit;
}

try {
    // 1. Clear session cache (simulated or actual if needed)
    // 2. Clear temp uploads
    $tempDir = __DIR__ . '/../../uploads/temp/';
    $filesCleared = 0;

    if (is_dir($tempDir)) {
        $files = glob($tempDir . '*');
        foreach ($files as $file) {
            if (is_file($file)) {
                unlink($file);
                $filesCleared++;
            }
        }
    }

    \App\Utils\Logger::log('system', 'warning', "System cache cleared by administrator ($filesCleared files removed)", 'CacheManager');

    echo json_encode([
        'status' => 'success',
        'message' => 'System cache cleared successfully. ' . $filesCleared . ' temporary files removed.'
    ]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Failed to clear cache: ' . $e->getMessage()]);
}
