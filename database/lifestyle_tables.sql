-- ============================================================
-- PCOS CARE HUB — Lifestyle Log Tables Migration
-- Run this in terminal via: mysql -u root pcos_hub < lifestyle_tables.sql
-- ============================================================

USE pcos_hub;

-- --------------------------------------------------------
-- 1. lifestyle_meals
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `lifestyle_meals` (
  `id`              int(11)      NOT NULL AUTO_INCREMENT,
  `patient_id`      int(11)      NOT NULL,
  `meal_type`       enum('breakfast','lunch','dinner','snack') NOT NULL,
  `meal_name`       varchar(255) NOT NULL,
  `food_categories` varchar(255) DEFAULT NULL COMMENT 'comma-separated: protein,vegetables,fruits,grains,dairy,fats',
  `meal_time`       time         DEFAULT NULL,
  `calories`        int(5)       DEFAULT NULL,
  `notes`           text         DEFAULT NULL,
  `log_date`        date         NOT NULL DEFAULT (CURDATE()),
  `created_at`      timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lm_patient`  (`patient_id`),
  KEY `idx_lm_date`     (`log_date`),
  CONSTRAINT `fk_lm_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 2. lifestyle_exercises
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
-- 3. lifestyle_water
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `lifestyle_water` (
  `id`         int(11)   NOT NULL AUTO_INCREMENT,
  `patient_id` int(11)   NOT NULL,
  `amount_ml`  int(5)    NOT NULL COMMENT 'millilitres per entry',
  `log_date`   date      NOT NULL DEFAULT (CURDATE()),
  `logged_at`  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lw_patient` (`patient_id`),
  KEY `idx_lw_date`    (`log_date`),
  CONSTRAINT `fk_lw_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- 4. lifestyle_sleep
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `lifestyle_sleep` (
  `id`            int(11)    NOT NULL AUTO_INCREMENT,
  `patient_id`    int(11)    NOT NULL,
  `sleep_date`    date       NOT NULL,
  `bedtime`       time       NOT NULL,
  `wake_time`     time       NOT NULL,
  `duration_hours` decimal(4,2) DEFAULT NULL COMMENT 'auto-calculated',
  `sleep_quality` enum('poor','fair','good','excellent') DEFAULT NULL,
  `notes`         text       DEFAULT NULL,
  `created_at`    timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ls_patient` (`patient_id`),
  KEY `idx_ls_date`    (`sleep_date`),
  CONSTRAINT `fk_ls_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Done
SELECT 'Lifestyle tables created successfully!' AS result;
