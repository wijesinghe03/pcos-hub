<?php
require_once 'db_connect.php';
require_once __DIR__ . '/utils/Logger.php';
header('Content-Type: application/json');

try {
    Logger::log('system', 'info', 'System activity logs viewed by administrator', 'LogViewer');
    $severity = $_GET['severity'] ?? 'all';
    $category = $_GET['category'] ?? 'all';
    $search = $_GET['search'] ?? '';

    $query = "SELECT * FROM system_logs WHERE 1=1";
    $params = [];

    if ($severity !== 'all') {
        $query .= " AND severity = ?";
        $params[] = $severity;
    }
    if ($category !== 'all') {
        $query .= " AND category = ?";
        $params[] = $category;
    }
    if ($search !== '') {
        $query .= " AND (message LIKE ? OR log_id LIKE ? OR user_identifier LIKE ?)";
        $searchParam = "%$search%";
        $params[] = $searchParam;
        $params[] = $searchParam;
        $params[] = $searchParam;
    }

    $query .= " ORDER BY timestamp DESC LIMIT 50";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $logs = $stmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'data' => $logs
    ]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
