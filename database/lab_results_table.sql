-- Create patient_labresults table
CREATE TABLE IF NOT EXISTS `patient_labresults` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `report_id` int(11) DEFAULT NULL, -- Optional link to patient_reports
  `test_name` varchar(255) NOT NULL,
  `test_type` varchar(150) DEFAULT NULL,
  `hospital_name` varchar(150) DEFAULT NULL,
  `report_date` date DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `status` enum('received','pending','processing') NOT NULL DEFAULT 'received',
  `results_data` text DEFAULT NULL, -- Store JSON data for lab values
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lab_patient` (`patient_id`),
  CONSTRAINT `fk_lab_patient_id` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
