<?php

// ============================================================
// PCOS CARE HUB — Get All Reviews (get_reviews.php)
// ============================================================

header('Content-Type: application/json');
require_once 'db_connect.php';

try {
    $stmt = $pdo->query("SELECT id, name, role_location, rating, review_text, created_at FROM reviews ORDER BY created_at DESC");
    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'data' => $reviews,
        'total' => count($reviews)
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to fetch reviews: ' . $e->getMessage()
    ]);
}
