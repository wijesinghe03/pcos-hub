-- PCOS CARE HUB — Isolated Database Schema
-- Last Updated: 2026-04-06

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+05:30";

-- --------------------------------------------------------
-- 1. Table structure for table `admin_users` (INTERNAL)
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT 'admin',
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `admin_users` (`full_name`, `username`, `email`, `password`, `role`) VALUES
('Amanda', 'amanda', 'amanda@pcoscare.lk', '$2y$10$sQocpiz7hGOfF0XvxVEQTeG/pWaYmXAtApYNOtSQfyOEPas6ujFle', 'superadmin');

-- --------------------------------------------------------
-- 2. Table structure for table `patients` (PUBLIC)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `patients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `dob` date DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `blood_group` varchar(5) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 3. Table structure for table `hospitals` (PUBLIC)
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `hospitals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hosp_name` varchar(150) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `reg_number` varchar(50) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `reg_number` (`reg_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 4. Table structure for table `patient_reports` (PATIENT DATA)
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `patient_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `report_name` varchar(255) NOT NULL,
  `report_type` enum('lab','scan','prescription','imaging','other') NOT NULL DEFAULT 'other',
  `hospital_name` varchar(150) DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int(11) DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `status` enum('uploaded','pending','reviewed') NOT NULL DEFAULT 'uploaded',
  `notes` text DEFAULT NULL,
  `report_date` date DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_patient_reports` (`patient_id`),
  KEY `idx_report_date` (`report_date`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_report_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 5. Table structure for table `cycle_logs` (PATIENT DATA)
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `cycle_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `cycle_length` int(3) NOT NULL DEFAULT 28,
  `period_duration` int(2) NOT NULL DEFAULT 5,
  `flow_intensity` enum('light','normal','heavy') NOT NULL,
  `notes` text DEFAULT NULL,
  `next_predicted` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_patient_id` (`patient_id`),
  KEY `idx_period_start` (`period_start`),
  CONSTRAINT `fk_cycle_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 6. lifestyle_meals
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `lifestyle_meals` (
  `id`              int(11)      NOT NULL AUTO_INCREMENT,
  `patient_id`      int(11)      NOT NULL,
  `meal_type`       enum('breakfast','lunch','dinner','snack') NOT NULL,
  `meal_name`       varchar(255) NOT NULL,
  `food_categories` varchar(255) DEFAULT NULL,
  `meal_time`       time         DEFAULT NULL,
  `calories`        int(5)       DEFAULT NULL,
  `notes`           text         DEFAULT NULL,
  `log_date`        date         NOT NULL DEFAULT (CURDATE()),
  `created_at`      timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lm_patient` (`patient_id`),
  KEY `idx_lm_date`    (`log_date`),
  CONSTRAINT `fk_lm_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 7. lifestyle_exercises
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `lifestyle_exercises` (
  `id`               int(11)    NOT NULL AUTO_INCREMENT,
  `patient_id`       int(11)    NOT NULL,
  `exercise_type`    enum('cardio','strength','yoga','walking','swimming','stretching','other') NOT NULL,
  `exercise_name`    varchar(255) NOT NULL,
  `duration_minutes` int(4)     NOT NULL,
  `intensity`        enum('light','moderate','vigorous') NOT NULL DEFAULT 'moderate',
  `exercise_time`    time       DEFAULT NULL,
  `calories_burned`  int(5)     DEFAULT NULL,
  `notes`            text       DEFAULT NULL,
  `log_date`         date       NOT NULL DEFAULT (CURDATE()),
  `created_at`       timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_le_patient` (`patient_id`),
  KEY `idx_le_date`    (`log_date`),
  CONSTRAINT `fk_le_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 8. lifestyle_water
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `lifestyle_water` (
  `id`         int(11)   NOT NULL AUTO_INCREMENT,
  `patient_id` int(11)   NOT NULL,
  `amount_ml`  int(5)    NOT NULL,
  `log_date`   date      NOT NULL DEFAULT (CURDATE()),
  `logged_at`  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lw_patient` (`patient_id`),
  KEY `idx_lw_date`    (`log_date`),
  CONSTRAINT `fk_lw_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 9. lifestyle_sleep
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `lifestyle_sleep` (
  `id`             int(11)      NOT NULL AUTO_INCREMENT,
  `patient_id`     int(11)      NOT NULL,
  `sleep_date`     date         NOT NULL,
  `bedtime`        time         NOT NULL,
  `wake_time`      time         NOT NULL,
  `duration_hours` decimal(4,2) DEFAULT NULL,
  `sleep_quality`  enum('poor','fair','good','excellent') DEFAULT NULL,
  `notes`          text         DEFAULT NULL,
  `created_at`     timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ls_patient` (`patient_id`),
  KEY `idx_ls_date`    (`sleep_date`),
  CONSTRAINT `fk_ls_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Dumping initial data
-- --------------------------------------------------------

INSERT INTO `patients` (`full_name`, `username`, `email`, `password`, `dob`, `phone`) VALUES
('Amanda Patient', 'patient', 'amanda.p@gmail.com', '$2y$10$YXspfsGWPmdXdxXo/I4Stufz4KXHBslezh20WQ8.L24Rm1xStMos2', '1995-05-15', '0771234567');

INSERT INTO `hospitals` (`hosp_name`, `username`, `email`, `password`, `reg_number`, `location`) VALUES
('City Hospital Colombo', 'hospital', 'info@cityhospital.lk', '$2y$10$0D4H0LuSxgaooO8cisY3qO75kbSwV9AJJ3kOIGTo3nWR3QVZtsvxK', 'HOSP-2025-001', 'Colombo 03');

COMMIT;
