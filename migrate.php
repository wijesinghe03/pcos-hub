<?php
require_once 'src/php/db_connect.php';

try {
    // Add gender column to patients
    $pdo->exec("ALTER TABLE patients ADD COLUMN gender VARCHAR(20) DEFAULT NULL AFTER blood_group");
    echo "Successfully added 'gender' column to 'patients' table.\n";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), "Duplicate column name") !== false) {
        echo "Column 'gender' already exists in 'patients' table.\n";
    } else {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
?>
