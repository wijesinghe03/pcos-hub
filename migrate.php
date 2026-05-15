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

// Create hospital_appointments table (Missing in previous version)
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `hospital_appointments` (
            `id`                 INT(11) NOT NULL AUTO_INCREMENT,
            `hospital_name`      VARCHAR(255) NOT NULL,
            `doctor_name`        VARCHAR(255) NOT NULL,
            `patient_name`       VARCHAR(255) NOT NULL,
            `email`              VARCHAR(100) NOT NULL,
            `contact_number`     VARCHAR(20) NOT NULL,
            `appointment_number` VARCHAR(50) NOT NULL,
            `appointment_date`   DATE NOT NULL,
            `appointment_time`   TIME NOT NULL,
            `status`             ENUM('pending','confirmed','cancelled','completed') DEFAULT 'pending',
            `created_at`         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_ha_hospital` (`hospital_name`),
            KEY `idx_ha_date` (`appointment_date`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    ");
    $migrations[] = "✅ Table 'hospital_appointments' created.";
} catch (PDOException $e) {
    $migrations[] = "❌ hospital_appointments error: " . $e->getMessage();
}

// Create hospital_reviews table
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `hospital_reviews` (
            `id`             INT(11) NOT NULL AUTO_INCREMENT,
            `hospital_id`    INT(11) NOT NULL,
            `reviewer_name`  VARCHAR(100) DEFAULT 'Guest',
            `rating`         TINYINT(1) NOT NULL,
            `comment`        TEXT DEFAULT NULL,
            `created_at`     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_hr_hospital` (`hospital_id`),
            CONSTRAINT `fk_hr_hospital` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    ");
    $migrations[] = "✅ Table 'hospital_reviews' created.";
} catch (PDOException $e) {
    $migrations[] = "❌ hospital_reviews error: " . $e->getMessage();
}

// Create hospital_doctors table
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `hospital_doctors` (
            `id`             INT(11) NOT NULL AUTO_INCREMENT,
            `hospital_id`    INT(11) NOT NULL,
            `doctor_name`    VARCHAR(150) NOT NULL,
            `specialization` VARCHAR(100) DEFAULT NULL,
            `qualification`  VARCHAR(255) DEFAULT NULL,
            `experience`     VARCHAR(50) DEFAULT NULL,
            `consultation_fee` DECIMAL(10,2) DEFAULT 0.00,
            `availability_json` TEXT DEFAULT NULL,
            `bio`            TEXT DEFAULT NULL,
            `avatar`         LONGTEXT DEFAULT NULL,
            `status`         ENUM('active','inactive') DEFAULT 'active',


            `created_at`     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_hd_hospital` (`hospital_id`),
            CONSTRAINT `fk_hd_hospital` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    ");
    $migrations[] = "✅ Table 'hospital_doctors' created.";
} catch (PDOException $e) {
    $migrations[] = "❌ hospital_doctors error: " . $e->getMessage();
}

// Create system_logs table
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `system_logs` (
            `id`              INT(11) NOT NULL AUTO_INCREMENT,
            `log_id`          VARCHAR(20) NOT NULL,
            `category`        VARCHAR(50) NOT NULL,
            `severity`        ENUM('info','warning','error','critical') DEFAULT 'info',
            `message`         TEXT NOT NULL,
            `user_identifier` VARCHAR(100) DEFAULT 'System',
            `ip_address`      VARCHAR(45) DEFAULT NULL,
            `created_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    ");
    $migrations[] = "✅ Table 'system_logs' created.";
} catch (PDOException $e) {
    $migrations[] = "❌ system_logs error: " . $e->getMessage();
}


// Add missing columns to hospitals table
try {
    $pdo->exec("ALTER TABLE `hospitals` ADD COLUMN `description` TEXT DEFAULT NULL");
    $migrations[] = "✅ Added 'description' to hospitals.";
} catch (PDOException $e) { /* Ignore if column exists */ }

try {
    $pdo->exec("ALTER TABLE `hospitals` ADD COLUMN `phone` VARCHAR(25) DEFAULT NULL");
    $migrations[] = "✅ Added 'phone' to hospitals.";
} catch (PDOException $e) { /* Ignore if column exists */ }

try {
    $pdo->exec("ALTER TABLE `hospitals` ADD COLUMN `hospital_type` VARCHAR(50) DEFAULT NULL");
    $migrations[] = "✅ Added 'hospital_type' to hospitals.";
} catch (PDOException $e) { /* Ignore if column exists */ }

try {
    $pdo->exec("ALTER TABLE `hospitals` ADD COLUMN `specialties` TEXT DEFAULT NULL");
    $migrations[] = "✅ Added 'specialties' to hospitals.";
} catch (PDOException $e) { /* Ignore if column exists */ }

try {
    $pdo->exec("ALTER TABLE `hospitals` ADD COLUMN `address` TEXT DEFAULT NULL");
    $migrations[] = "✅ Added 'address' to hospitals.";
} catch (PDOException $e) { /* Ignore if column exists */ }

try {
    $pdo->exec("ALTER TABLE `hospitals` ADD COLUMN `approval_status` ENUM('pending','approved','rejected') DEFAULT 'approved'");
    $migrations[] = "✅ Added 'approval_status' to hospitals.";
} catch (PDOException $e) { /* Ignore if column exists */ }


echo "\n=== Migration Results ===\n";
foreach ($migrations as $msg) {
    echo $msg . "\n";
}
echo "========================\n\n";
