<?php
require_once 'src/php/db_connect.php';

$sql = file_get_contents('database/roles_setup.sql');

try {
    $pdo->exec($sql);
    echo "✅ Roles and Permissions setup successfully.\n";
} catch (PDOException $e) {
    echo "❌ Error setting up Roles and Permissions: " . $e->getMessage() . "\n";
}
