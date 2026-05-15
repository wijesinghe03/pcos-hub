-- ============================================================
-- PCOS CARE HUB — Hospital Dashboard Seed Data (Revised)
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+05:30";

-- 1. Ensure patients have NIC and proper status
ALTER TABLE `patients` MODIFY COLUMN `status` enum('active','deactivated','pending','archived') DEFAULT 'active';
ALTER TABLE `patients` ADD COLUMN IF NOT EXISTS `nic` varchar(20) DEFAULT NULL;

-- 2. Seed some more realistic patients if they don't exist
INSERT IGNORE INTO `patients` (`id`, `full_name`, `username`, `email`, `password`, `dob`, `phone`, `nic`, `status`) VALUES
(30, 'Nimesha Rathnayake', 'nimesha_r', 'nimesha.r@example.com', '$2y$10$YXspfsGWPmdXdxXo/I4Stufz4KXHBslezh20WQ8.L24Rm1xStMos2', '2001-08-14', '0712345678', '010234567V', 'active'),
(31, 'Sachini Jayawardena', 'sachini_j', 'sachini.j@example.com', '$2y$10$YXspfsGWPmdXdxXo/I4Stufz4KXHBslezh20WQ8.L24Rm1xStMos2', '1998-03-22', '0776543210', '980123456V', 'active'),
(32, 'Lakshmi Silva', 'lakshmi_s', 'lakshmi.s@example.com', '$2y$10$YXspfsGWPmdXdxXo/I4Stufz4KXHBslezh20WQ8.L24Rm1xStMos2', '1995-11-03', '0779876543', '950456789V', 'active');

-- 3. Seed Today's Appointments into patient_appointments
-- Note: 'Selected Hospital' seems to be the default for some records. I'll use 'City Hospital Colombo' as in the mock.
INSERT INTO `patient_appointments` (`patient_id`, `hospital_name`, `doctor_name`, `appointment_date`, `appointment_time`, `appointment_type`, `status`, `reason`) VALUES
(30, 'City Hospital Colombo', 'Dr. Kamalini Perera', CURDATE(), '09:00:00', 'consultation', 'upcoming', 'Follow-up'),
(31, 'City Hospital Colombo', 'Dr. Kamalini Perera', CURDATE(), '10:30:00', 'follow-up', 'upcoming', 'Review results'),
(32, 'City Hospital Colombo', 'Dr. Nishantha Silva', CURDATE(), '14:00:00', 'consultation', 'upcoming', 'General checkup');

-- 4. Seed Lab Results
INSERT INTO `patient_labresults` (`patient_id`, `test_name`, `test_type`, `hospital_name`, `report_date`, `status`, `results_data`) VALUES
(30, 'Blood Panel', 'Blood Test', 'City Hospital Colombo', CURDATE(), 'received', '{"result_flag": "normal", "value": "036 Normal"}'),
(31, 'Hormone Panel', 'Hormone Panel', 'City Hospital Colombo', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'received', '{"result_flag": "high_lh", "value": "High LH"}'),
(32, 'Ultrasound', 'Imaging', 'City Hospital Colombo', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'pending', '{"result_flag": "pending", "value": "Pending"}');

-- 5. Seed Reports
INSERT INTO `patient_reports` (`patient_id`, `report_name`, `report_type`, `hospital_name`, `file_name`, `file_path`, `status`, `report_date`) VALUES
(30, 'Initial Assessment', 'lab', 'City Hospital Colombo', 'report1.pdf', '/uploads/report1.pdf', 'reviewed', CURDATE()),
(31, 'Hormone Study', 'lab', 'City Hospital Colombo', 'report2.pdf', '/uploads/report2.pdf', 'pending', DATE_SUB(CURDATE(), INTERVAL 1 DAY));

COMMIT;
