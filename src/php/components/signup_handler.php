<?php
/**
 * PCOS CARE HUB — Isolated Signup Handler (signup_handler.php)
 * Handles registration for Patients and Hospitals into separate tables.
 */

require_once '../db_connect.php';

header('Content-Type: application/json');

function handleSignup($pdo) {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (!$data || !isset($data['role'])) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid data provided.']);
        return;
    }

    $role = $data['role']; // patient or hospital
    $username = $data['username'];
    $email = $data['email'];
    $password = password_hash($data['password'], PASSWORD_BCRYPT);

    try {
        if ($role === 'patient') {
            $stmt = $pdo->prepare("INSERT INTO patients (full_name, username, email, password, dob, phone) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['full_name'],
                $username,
                $email,
                $password,
                $data['dob'] ?? null,
                $data['phone'] ?? null
            ]);
        } else if ($role === 'hospital') {
            $stmt = $pdo->prepare("INSERT INTO hospitals (hosp_name, username, email, password, reg_number, location, contact_person) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['full_name'], // Used as hosp_name
                $username,
                $email,
                $password,
                $data['reg_number'] ?? null,
                $data['location'] ?? null,
                $data['contact_person'] ?? null
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid role for public signup.']);
            return;
        }

        echo json_encode([
            'status' => 'success',
            'message' => 'Account created successfully!',
            'user' => [
                'name' => $data['full_name'],
                'role' => $role
            ]
        ]);

    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            echo json_encode(['status' => 'error', 'message' => 'Username, Email, or Registration Number already exists.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Registration failed: ' . $e->getMessage()]);
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    handleSignup($pdo);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
?>
