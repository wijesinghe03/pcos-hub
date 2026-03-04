<?php
/**
 * PCOS CARE HUB — Test Connection (test_connection.php)
 * Checks if the database connection is working.
 */

require_once 'db_connect.php';

header('Content-Type: application/json');

if (isset($pdo)) {
    echo json_encode([
        'status' => 'success',
        'message' => 'Successfully connected to the pcos_hub database!',
        'database' => 'pcos_hub',
        'server' => $_SERVER['SERVER_SOFTWARE']
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'PDO instance not found.'
    ]);
}
?>
