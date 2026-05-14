<?php
/**
 * system_settings_handler.php
 * Handles retrieving and updating global system settings.
 */

require_once '../db_connect.php';
require_once __DIR__ . '/../utils/Logger.php';
session_start();
header('Content-Type: application/json');

use App\Utils\Logger;

// Check session and admin role
if (!isset($_SESSION['user_id']) || !in_array($_SESSION['user_role'], ['admin', 'superadmin'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized access.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT setting_key, setting_value FROM system_settings");
        $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        echo json_encode(['status' => 'success', 'data' => $settings]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || !isset($data['settings'])) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid data.']);
        exit;
    }

    try {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare("UPDATE system_settings SET setting_value = ? WHERE setting_key = ?");
        
        foreach ($data['settings'] as $key => $value) {
            $stmt->execute([$value, $key]);
        }
        
        $pdo->commit();
        
        Logger::log('system', 'info', 'System settings updated by Admin ID: ' . $_SESSION['user_id'], $_SESSION['user_name']);
        
        echo json_encode(['status' => 'success', 'message' => 'Settings updated successfully.']);
    } catch (PDOException $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
