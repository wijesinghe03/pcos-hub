<?php
/**
 * PCOS CARE HUB — Session Logout Handler (logout_handler.php)
 * Destroys the PHP session on the server side.
 * Called by logout.html via fetch() to ensure the server-side
 * session is invalidated even though auth is primarily localStorage-based.
 */

session_start();
header('Content-Type: application/json');

$_SESSION = [];

if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params['path'],
        $params['domain'],
        $params['secure'],
        $params['httponly']
    );
}

session_destroy();

echo json_encode(['status' => 'success', 'message' => 'Session destroyed.']);
