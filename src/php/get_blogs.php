<?php

/**
 * PCOS CARE HUB — Fetch Blogs (get_blogs.php)
 * Fetches all blogs or a specific blog by ID.
 */

require_once 'db_connect.php';
header('Content-Type: application/json');

try {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

    if ($id) {
        $stmt = $pdo->prepare("SELECT * FROM blogs WHERE id = ?");
        $stmt->execute([$id]);
        $blog = $stmt->fetch();

        if ($blog) {
            echo json_encode(['status' => 'success', 'data' => $blog]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Blog not found.']);
        }
    } else {
        $stmt = $pdo->query("SELECT * FROM blogs ORDER BY created_at DESC");
        $blogs = $stmt->fetchAll();
        echo json_encode(['status' => 'success', 'data' => $blogs]);
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
