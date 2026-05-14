-- PCOS CARE HUB — Registered Hospitals Migration
-- Run this in phpMyAdmin or via MySQL CLI
-- Creates: registered_hospitals, hospital_verifications
-- Updates: approval_status column, indexes

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+05:30";

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. registered_hospitals  (primary hospital account table)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `registered_hospitals` (
  `id`              int(11)      NOT NULL AUTO_INCREMENT,
  `hosp_name`       varchar(150) NOT NULL,
  `username`        varchar(50)  NOT NULL,
  `email`           varchar(100) NOT NULL,
  `password`        varchar(255) NOT NULL,
  `reg_number`      varchar(50)  NOT NULL,
  `phone`           varchar(25)  DEFAULT NULL,
  `address`         text         DEFAULT NULL,
  `location`        varchar(255) DEFAULT NULL,
  `contact_fname`   varchar(80)  DEFAULT NULL,
  `contact_lname`   varchar(80)  DEFAULT NULL,
  `contact_person`  varchar(160) DEFAULT NULL,
  `hospital_type`   varchar(50)  DEFAULT NULL,
  `specialties`     text         DEFAULT NULL,
  `approval_status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `is_verified`     tinyint(1)   NOT NULL DEFAULT 0,
  `approved_at`     datetime     DEFAULT NULL,
  `rejection_reason` text        DEFAULT NULL,
  `avatar`          varchar(500) DEFAULT NULL,
  `status`          enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `created_at`      timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_rh_username`   (`username`),
  UNIQUE KEY `uq_rh_email`      (`email`),
  UNIQUE KEY `uq_rh_reg_number` (`reg_number`),
  KEY `idx_rh_approval`         (`approval_status`),
  KEY `idx_rh_location`         (`location`(50))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. hospital_verifications  (temporary table for OTP-pending signups)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `hospital_verifications` (
  `id`              int(11)      NOT NULL AUTO_INCREMENT,
  `hosp_name`       varchar(150) NOT NULL,
  `username`        varchar(50)  NOT NULL,
  `email`           varchar(100) NOT NULL,
  `password_hash`   varchar(255) NOT NULL,
  `reg_number`      varchar(50)  NOT NULL,
  `phone`           varchar(25)  DEFAULT NULL,
  `address`         text         DEFAULT NULL,
  `location`        varchar(255) DEFAULT NULL,
  `contact_fname`   varchar(80)  DEFAULT NULL,
  `contact_lname`   varchar(80)  DEFAULT NULL,
  `hospital_type`   varchar(50)  DEFAULT NULL,
  `specialties`     text         DEFAULT NULL,
  `otp_code`        varchar(6)   NOT NULL,
  `expires_at`      datetime     NOT NULL,
  `created_at`      timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_hv_email`    (`email`),
  KEY `idx_hv_expires`        (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. hospital_documents  (approval docs — linked to registered_hospitals)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `hospital_documents` (
  `id`          int(11)      NOT NULL AUTO_INCREMENT,
  `hospital_id` int(11)      NOT NULL,
  `file_name`   varchar(255) NOT NULL,
  `file_path`   varchar(500) NOT NULL,
  `file_size`   int(11)      DEFAULT NULL,
  `file_type`   varchar(80)  DEFAULT NULL,
  `uploaded_at` timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_hd_hospital` (`hospital_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Seed: copy any existing approved hospitals into registered_hospitals
-- ─────────────────────────────────────────────────────────────────────────────
INSERT IGNORE INTO `registered_hospitals`
  (hosp_name, username, email, password, reg_number, location,
   contact_person, phone, hospital_type, specialties, address,
   approval_status, is_verified, created_at)
SELECT
  hosp_name,
  username,
  email,
  password,
  reg_number,
  location,
  contact_person,
  IFNULL(phone,''),
  IFNULL(hospital_type,''),
  IFNULL(specialties,''),
  IFNULL(address,''),
  IFNULL(approval_status,'pending'),
  is_verified,
  created_at
FROM `hospitals`
ON DUPLICATE KEY UPDATE hosp_name = VALUES(hosp_name);

COMMIT;
