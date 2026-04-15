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

// Create patient_appointments table
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `patient_appointments` (
            `id`               INT(11) NOT NULL AUTO_INCREMENT,
            `patient_id`       INT(11) NOT NULL,
            `hospital_name`    VARCHAR(255) NOT NULL,
            `doctor_name`      VARCHAR(255) DEFAULT NULL,
            `appointment_date` DATE NOT NULL,
            `appointment_time` TIME NOT NULL,
            `appointment_type` ENUM('consultation','check-up','follow-up','lab-test','other') DEFAULT 'consultation',
            `reason`           TEXT DEFAULT NULL,
            `status`           ENUM('upcoming','completed','cancelled','rescheduled') DEFAULT 'upcoming',
            `created_at`       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_appt_patient` (`patient_id`, `appointment_date`),
            CONSTRAINT `fk_appt_patient`
                FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    ");
    $migrations[] = "✅ Table 'patient_appointments' created (or already exists).";
} catch (PDOException $e) {
    $migrations[] = "❌ patient_appointments error: " . $e->getMessage();
}

// Create patient_reports table
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `patient_reports` (
            `id`               INT(11) NOT NULL AUTO_INCREMENT,
            `patient_id`       INT(11) NOT NULL,
            `report_name`      VARCHAR(255) NOT NULL,
            `report_type`      VARCHAR(100) NOT NULL,
            `hospital_name`    VARCHAR(255) DEFAULT NULL,
            `doctor_name`      VARCHAR(255) DEFAULT NULL,
            `file_name`        VARCHAR(255) DEFAULT NULL,
            `file_path`        VARCHAR(255) DEFAULT NULL,
            `file_size`        INT(11) DEFAULT 0,
            `file_type`        VARCHAR(100) DEFAULT NULL,
            `status`           ENUM('uploaded','pending','reviewed') DEFAULT 'uploaded',
            `notes`            TEXT DEFAULT NULL,
            `report_date`      DATE NOT NULL,
            `created_at`       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_report_patient` (`patient_id`, `report_date`),
            CONSTRAINT `fk_report_patient`
                FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    ");
    $migrations[] = "✅ Table 'patient_reports' created (or already exists).";
} catch (PDOException $e) {
    $migrations[] = "❌ patient_reports error: " . $e->getMessage();
}

// Create patient_labresults table
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `patient_labresults` (
            `id`               INT(11) NOT NULL AUTO_INCREMENT,
            `patient_id`       INT(11) NOT NULL,
            `report_id`        INT(11) DEFAULT NULL,
            `test_name`        VARCHAR(255) NOT NULL,
            `test_type`        VARCHAR(100) DEFAULT NULL,
            `hospital_name`    VARCHAR(255) DEFAULT NULL,
            `doctor_name`      VARCHAR(255) DEFAULT NULL,
            `report_date`      DATE NOT NULL,
            `file_path`        VARCHAR(255) DEFAULT NULL,
            `status`           ENUM('received','pending','processing') DEFAULT 'received',
            `results_data`     TEXT DEFAULT NULL,
            `created_at`       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_lab_patient` (`patient_id`, `report_date`),
            CONSTRAINT `fk_lab_patient`
                FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    ");
    $migrations[] = "✅ Table 'patient_labresults' created (or already exists).";
} catch (PDOException $e) {
    $migrations[] = "❌ patient_labresults error: " . $e->getMessage();
}

// Create patient_hospitals table
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `patient_hospitals` (
            `id`                INT(11) NOT NULL AUTO_INCREMENT,
            `patient_id`        INT(11) NOT NULL,
            `hospital_name`     VARCHAR(255) NOT NULL,
            `address`           TEXT DEFAULT NULL,
            `contact_number`    VARCHAR(20) DEFAULT NULL,
            `email`             VARCHAR(100) DEFAULT NULL,
            `website`           VARCHAR(255) DEFAULT NULL,
            `specialist_doctor` VARCHAR(255) DEFAULT NULL,
            `is_primary`        TINYINT(1) DEFAULT 0,
            `registered_at`     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_hosp_patient` (`patient_id`),
            CONSTRAINT `fk_hosp_patient`
                FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    ");
    $migrations[] = "✅ Table 'patient_hospitals' created (or already exists).";
} catch (PDOException $e) {
    $migrations[] = "❌ patient_hospitals error: " . $e->getMessage();
}

echo "\n=== Migration Results ===\n";
foreach ($migrations as $msg) echo $msg . "\n";
echo "========================\n\n";
?>
