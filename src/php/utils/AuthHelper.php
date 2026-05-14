<?php

namespace App\Utils;

class AuthHelper
{
    /**
     * Checks if the current session belongs to an administrator.
     * @return bool
     */
    public static function isAdmin(): bool
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $role = $_SESSION['user_role'] ?? '';
        $adminRoles = ['admin', 'superadmin', 'Super Admin', 'Admin'];
        
        return in_array($role, $adminRoles);
    }

    /**
     * Rejects the request if the user is not an admin.
     */
    public static function requireAdmin()
    {
        if (!self::isAdmin()) {
            header('Content-Type: application/json');
            echo json_encode(['status' => 'error', 'message' => 'Unauthorized access. Administrative privileges required.']);
            exit;
        }
    }
}
