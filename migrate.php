<?php
/**
 * PCOS Hub — Migration: Create cycle_logs table
 */
require_once 'src/php/db_connect.php';

$migrations = [];

// Create cycle_logs table
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `cycle_logs` (
            `id`               INT(11) NOT NULL AUTO_INCREMENT,
            `patient_id`       INT(11) NOT NULL,
            `period_start`     DATE NOT NULL,
            `period_end`       DATE NOT NULL,
            `cycle_length`     INT(3) NOT NULL DEFAULT 28,
            `period_duration`  INT(2) NOT NULL DEFAULT 5,
            `flow_intensity`   ENUM('light','normal','heavy') NOT NULL DEFAULT 'normal',
            `notes`            TEXT DEFAULT NULL,
            `next_predicted`   DATE DEFAULT NULL,
            `created_at`       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_cycle_patient` (`patient_id`, `period_start`),
            CONSTRAINT `fk_cycle_patient`
                FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    ");
    $migrations[] = "✅ Table 'cycle_logs' created (or already exists).";
} catch (PDOException $e) {
    $migrations[] = "❌ cycle_logs error: " . $e->getMessage();
}

echo "\n=== Migration Results ===\n";
foreach ($migrations as $msg) echo $msg . "\n";
echo "========================\n\n";
?>
