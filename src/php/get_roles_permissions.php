<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

try {
    // 1. Get all roles with user counts
    $roles_stmt = $pdo->query("
        SELECT r.id, r.name, r.description, r.icon,
        (
            CASE 
                WHEN r.name = 'Patient' THEN (SELECT COUNT(*) FROM patients)
                ELSE (SELECT COUNT(*) FROM admin_users WHERE role = r.name OR (role = 'superadmin' AND r.name = 'Super Admin'))
            END
        ) as user_count
        FROM roles r
        ORDER BY r.id ASC
    ");
    $roles = $roles_stmt->fetchAll();

    // 2. Get all permissions grouped by category
    $perms_stmt = $pdo->query("SELECT * FROM permissions ORDER BY category ASC, id ASC");
    $all_permissions = $perms_stmt->fetchAll();
    
    $grouped_permissions = [];
    foreach ($all_permissions as $p) {
        $grouped_permissions[$p['category']][] = $p;
    }

    // 3. Get mapping of role_id to permission_id
    $mapping_stmt = $pdo->query("SELECT role_id, permission_id FROM role_permissions");
    $mapping = $mapping_stmt->fetchAll();
    
    $role_perms_map = [];
    foreach ($mapping as $m) {
        $role_perms_map[$m['role_id']][] = (int)$m['permission_id'];
    }

    echo json_encode([
        'status' => 'success',
        'data' => [
            'roles' => $roles,
            'permissions_matrix' => $grouped_permissions,
            'role_permissions' => $role_perms_map
        ]
    ]);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
