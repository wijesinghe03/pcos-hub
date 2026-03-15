<?php
/**
 * PCOS CARE HUB — Admin Auth Handler (auth_handler.php)
 */

require_once '../db_connect.php';

header('Content-Type: application/json');

function handleLogin($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['identity']) || !isset($data['password'])) {
        echo json_encode(['status' => 'error', 'message' => 'Username/Email and password are required.']);
        return;
    }

    $identity = $data['identity'];
    $password = $data['password'];

    try {
        // Search by both email OR username
        $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE email = ? OR username = ?");
        $stmt->execute([$identity, $identity]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            // Update last login
            $updateStmt = $pdo->prepare("UPDATE admin_users SET last_login = NOW() WHERE id = ?");
            $updateStmt->execute([$user['id']]);

            echo json_encode([
                'status' => 'success',
                'message' => 'Login successful',
                'user' => [
                    'name' => $user['full_name'],
                    'role' => $user['role'],
                    'email' => $user['email']
                ]
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid email or password.']);
        }
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'System error: ' . $e->getMessage()]);
    }
}

// Check request method
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    handleLogin($pdo);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
?>
