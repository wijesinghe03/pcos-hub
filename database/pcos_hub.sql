-- PCOS CARE HUB — Isolated Database Schema
-- Last Updated: 2026-03-04

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
-- Dumping initial data
-- --------------------------------------------------------

INSERT INTO `patients` (`full_name`, `username`, `email`, `password`, `dob`, `phone`) VALUES
('Amanda Patient', 'patient', 'amanda.p@gmail.com', '$2y$10$YXspfsGWPmdXdxXo/I4Stufz4KXHBslezh20WQ8.L24Rm1xStMos2', '1995-05-15', '0771234567');

INSERT INTO `hospitals` (`hosp_name`, `username`, `email`, `password`, `reg_number`, `location`) VALUES
('City Hospital Colombo', 'hospital', 'info@cityhospital.lk', '$2y$10$0D4H0LuSxgaooO8cisY3qO75kbSwV9AJJ3kOIGTo3nWR3QVZtsvxK', 'HOSP-2025-001', 'Colombo 03');

COMMIT;
