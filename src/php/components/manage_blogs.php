<?php

/**
 * PCOS CARE HUB — Admin Blog Management (manage_blogs.php)
 * Handles Create, Update, and Delete operations for blogs, including image uploads.
 */

session_start();
require_once '../db_connect.php';
require_once __DIR__ . '/../utils/Logger.php';
header('Content-Type: application/json');

use App\Utils\Logger;

// Guard: only authenticated admins may manage blogs
if (empty($_SESSION['user_role']) || !in_array($_SESSION['user_role'], ['admin', 'superadmin'])) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized. Admin access required.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Handle both JSON and Multipart/Form-Data
    $data = $_POST;
    if (empty($data)) {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
    }

    if (!$data || !isset($data['action'])) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid request. Action required.']);
        exit;
    }

    $action = $data['action'];

    try {
        if ($action === 'create' || $action === 'update') {
            $imageUrl = $data['image_url'] ?? '';

            // Handle Image Upload
            if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $file = $_FILES['image'];
                $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
                $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

                if (in_array($ext, $allowed)) {
                    $fileName = 'blog_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
                    $targetDir = dirname(dirname(dirname(__DIR__))) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'blog' . DIRECTORY_SEPARATOR;

                    if (!is_dir($targetDir)) {
                        mkdir($targetDir, 0777, true);
                    }

                    if (move_uploaded_file($file['tmp_name'], $targetDir . $fileName)) {
                        $imageUrl = 'uploads/blog/' . $fileName;
                    }
                }
            }

            if ($action === 'create') {
                $stmt = $pdo->prepare("
                    INSERT INTO blogs (
                        title_en, category, image_url, 
                        description_en, content_en, read_time
                    ) VALUES (?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $data['title_en'], $data['category'], $imageUrl,
                    $data['description_en'], $data['content_en'],
                    $data['read_time'] ?? 5
                ]);
                Logger::log('blog', 'info', "Created blog: " . $data['title_en'], 'Admin');
                echo json_encode(['status' => 'success', 'message' => 'Blog created successfully!', 'id' => $pdo->lastInsertId()]);
            } else {
                if (!isset($data['id'])) {
                    echo json_encode(['status' => 'error', 'message' => 'Blog ID required for update.']);
                    exit;
                }
                $stmt = $pdo->prepare("
                    UPDATE blogs SET 
                        title_en = ?, category = ?, image_url = ?, 
                        description_en = ?, content_en = ?, read_time = ?
                    WHERE id = ?
                ");
                $stmt->execute([
                    $data['title_en'], $data['category'], $imageUrl,
                    $data['description_en'], $data['content_en'],
                    $data['read_time'] ?? 5,
                    $data['id']
                ]);
                Logger::log('blog', 'info', "Updated blog ID: " . $data['id'], 'Admin');
                echo json_encode(['status' => 'success', 'message' => 'Blog updated successfully!']);
            }
        } elseif ($action === 'delete') {
            if (!isset($data['id'])) {
                echo json_encode(['status' => 'error', 'message' => 'Blog ID required for deletion.']);
                exit;
            }
            $stmt = $pdo->prepare("DELETE FROM blogs WHERE id = ?");
            $stmt->execute([$data['id']]);
            Logger::log('blog', 'warning', "Deleted blog ID: " . $data['id'], 'Admin');
            echo json_encode(['status' => 'success', 'message' => 'Blog deleted successfully!']);
        }
    } catch (PDOException $e) {
        Logger::log('database', 'error', 'Blog management error: ' . $e->getMessage(), 'System');
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
