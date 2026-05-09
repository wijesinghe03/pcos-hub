<?php

header('Content-Type: application/json');
require_once 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $role_location = trim($_POST['role_location'] ?? '');
    $rating = (int)($_POST['rating'] ?? 5);
    $review_text = trim($_POST['review_text'] ?? '');

    if (empty($name) || empty($review_text)) {
        echo json_encode(['status' => 'error', 'message' => 'Name and review text are required.']);
        exit;
    }

    if ($rating < 1 || $rating > 5) {
        $rating = 5;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO reviews (name, role_location, rating, review_text) VALUES (?, ?, ?, ?)");
        $stmt->execute([$name, $role_location, $rating, $review_text]);
        echo json_encode(['status' => 'success', 'message' => 'Review submitted successfully.']);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
