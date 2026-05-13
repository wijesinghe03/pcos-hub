<?php

/**
 * PCOS CARE HUB — Isolated Signup Handler (signup_handler.php)
 * Handles registration for Patients and Hospitals into separate tables.
 */

require_once '../db_connect.php';
header('Content-Type: application/json');

function handleSignup($pdo)
{

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    if (!$data || !isset($data['role'])) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid data provided.']);
        return;
    }

    $role = $data['role'];
// patient or hospital
    $username = trim($data['username']);
    $email = trim($data['email']);
    $regNumber = isset($data['reg_number']) ? trim($data['reg_number']) : null;
    $password = password_hash($data['password'], PASSWORD_BCRYPT);
    try {
        if ($role === 'patient') {
            $stmt = $pdo->prepare("INSERT INTO patients (full_name, username, email, password, dob, phone, address, blood_group, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['full_name'],
                $username,
                $email,
                $password,
                $data['dob'] ?? null,
                $data['phone'] ?? null,
                $data['address'] ?? null,
                $data['blood_group'] ?? null,
                $data['gender'] ?? null
            ]);
        } elseif ($role === 'hospital') {
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
        } elseif ($role === 'admin') {
            $stmt = $pdo->prepare("INSERT INTO admin_users (full_name, username, email, password, role) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['full_name'],
                $username,
                $email,
                $password,
                'admin'
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid role for public signup.']);
            return;
        }

        // Send Welcome Email
        try {
            require_once '../utils/Mailer.php';
            $subject = "Welcome to PCOS Care Hub!";
            $name = $data['full_name'];
            if ($role === 'patient') {
                $emailBody = "
                    <p>Hi <strong>$name</strong>,</p>
                    <p>Welcome to <strong>PCOS Care Hub</strong>! We're thrilled to have you join our community.</p>
                    <p>Our platform is designed to help you track your symptoms, manage your lifestyle, and connect with healthcare providers specialized in PCOS care.</p>
                    <p>Log in now to start your journey towards better health management.</p>
                    <a href='#' class='button'>Go to Dashboard</a>
                ";
            } else {
                $emailBody = "
                    <p>Hello <strong>$name</strong> Team,</p>
                    <p>Welcome to <strong>PCOS Care Hub</strong>! We are excited to partner with your institution.</p>
                    <p>Your hospital account is now active. You can start managing patient appointments and health records through our secure platform.</p>
                    <p>Our team will review your registration details shortly to ensure full verification.</p>
                    <a href='#' class='button'>Go to Hospital Dashboard</a>
                ";
            }

            \App\Utils\Mailer::send($email, $subject, $emailBody);
        } catch (Throwable $e) {
            error_log("Welcome email failed: " . $e->getMessage());
        }

        // Log the signup
        \App\Utils\Logger::log('auth', 'info', "New account registered: " . $username . " (Role: " . $role . ")", $data['full_name']);

        echo json_encode([
            'status' => 'success',
            'message' => 'Account created successfully!',
            'user' => [
                'id' => $pdo->lastInsertId(),
                'name' => $data['full_name'],
                'role' => $role,
                'email' => $data['email'],
                'username' => $data['username'],
                'dob' => $data['dob'] ?? null,
                'phone' => $data['phone'] ?? null,
                'gender' => $data['gender'] ?? null,
                'address' => $data['address'] ?? null,
                'blood_group' => $data['blood_group'] ?? null,
                'reg_number' => $data['reg_number'] ?? null,
                'location' => $data['location'] ?? null
            ]
        ]);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            echo json_encode(['status' => 'error', 'message' => 'An account with this username or email already exists. Try signing in instead.']);
        } else {
            \App\Utils\Logger::log('database', 'error', "Registration failed for " . $username . ": " . $e->getMessage(), 'System');
            echo json_encode(['status' => 'error', 'message' => 'Registration failed: ' . $e->getMessage()]);
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    handleSignup($pdo);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
