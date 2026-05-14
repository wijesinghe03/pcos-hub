<?php

session_start();
require_once 'db_connect.php';
require_once __DIR__ . '/utils/Logger.php';

header('Content-Type: application/json');

require_once 'utils/AuthHelper.php';

// Security Check: Only admins can manage roles
\App\Utils\AuthHelper::requireAdmin();

$input = file_get_contents('php://input');
$data = json_decode($input, true);
$action = $data['action'] ?? '';

try {
    if ($action === 'create') {
        $name = $data['role_name'] ?? '';
        $icon = $data['role_icon'] ?? '👤';
        $desc = $data['role_desc'] ?? '';

        if (empty($name)) {
            echo json_encode(['status' => 'error', 'message' => 'Role name is required.']);
            exit;
        }

        // Check if role exists
        $check = $pdo->prepare("SELECT id FROM roles WHERE name = ?");
        $check->execute([$name]);
        if ($check->fetch()) {
            echo json_encode(['status' => 'error', 'message' => 'A role with this name already exists.']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO roles (name, icon, description) VALUES (?, ?, ?)");
        $stmt->execute([$name, $icon, $desc]);
        $newRoleId = $pdo->lastInsertId();

        \App\Utils\Logger::log('security', 'info', "New system role created: $name (ID: $newRoleId)", 'Admin');

        echo json_encode(['status' => 'success', 'message' => 'Role created successfully.', 'id' => $newRoleId]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid action.']);
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'System error: ' . $e->getMessage()]);
}
