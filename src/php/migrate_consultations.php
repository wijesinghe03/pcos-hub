<?php
$host = 'localhost';
$db   = 'pcos_hub';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    
    // Create consultations table
    $sql = "CREATE TABLE IF NOT EXISTS consultations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hospital_name VARCHAR(255) NOT NULL,
        doctor_name VARCHAR(255) DEFAULT 'Hospital Consultant',
        patient_id INT NULL,
        patient_name VARCHAR(255) NOT NULL,
        patient_email VARCHAR(255) NOT NULL,
        patient_phone VARCHAR(50),
        type VARCHAR(100) DEFAULT 'consultation',
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (patient_id),
        INDEX (patient_email),
        INDEX (hospital_name)
    ) ENGINE=InnoDB;";
    
    $pdo->exec($sql);
    echo "Table 'consultations' created successfully.\n";
    
} catch (\PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
