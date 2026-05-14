<?php
require_once 'db_connect.php';
require_once __DIR__ . '/utils/Logger.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $role_id = $data['role_id'] ?? null;
    $permissions = $data['permissions'] ?? []; // Array of permission IDs

    if (!$role_id) {
        echo json_encode(['status' => 'error', 'message' => 'Missing role ID.']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // 1. Clear existing permissions for this role
        $stmt = $pdo->prepare("DELETE FROM role_permissions WHERE role_id = ?");
        $stmt->execute([$role_id]);

        // 2. Insert new permissions
        if (!empty($permissions)) {
            $stmt = $pdo->prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)");
            foreach ($permissions as $perm_id) {
                $stmt->execute([$role_id, $perm_id]);
            }
        }

        // 3. Log the action
        $role_name_stmt = $pdo->prepare("SELECT name FROM roles WHERE id = ?");
        $role_name_stmt->execute([$role_id]);
        $role_name = $role_name_stmt->fetchColumn();
        
        \App\Utils\Logger::log('system', 'info', "Updated permissions for role: $role_name", 'PermissionManager');

        $pdo->commit();
        echo json_encode(['status' => 'success', 'message' => 'Permissions updated successfully.']);

    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
