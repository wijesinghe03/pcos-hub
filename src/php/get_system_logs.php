<?php
require_once 'db_connect.php';
require_once __DIR__ . '/utils/Logger.php';
header('Content-Type: application/json');

try {
    \App\Utils\Logger::log('system', 'info', 'System activity logs viewed by administrator', 'LogViewer');
    $severity = $_GET['severity'] ?? 'all';
    $category = $_GET['category'] ?? 'all';
    $search = $_GET['search'] ?? '';
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 15;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

    $queryBase = "FROM system_logs WHERE 1=1";
    $params = [];

    if ($severity !== 'all') {
        $queryBase .= " AND severity = ?";
        $params[] = $severity;
    }
    if ($category !== 'all') {
        $queryBase .= " AND category = ?";
        $params[] = $category;
    }
    if ($search !== '') {
        $queryBase .= " AND (message LIKE ? OR log_id LIKE ? OR user_identifier LIKE ?)";
        $searchParam = "%$search%";
        $params[] = $searchParam;
        $params[] = $searchParam;
        $params[] = $searchParam;
    }

    // Get Total Count
    $countStmt = $pdo->prepare("SELECT COUNT(*) " . $queryBase);
    $countStmt->execute($params);
    $totalCount = $countStmt->fetchColumn();

    // Get Data
    $query = "SELECT * " . $queryBase . " ORDER BY timestamp DESC LIMIT ? OFFSET ?";
    $stmt = $pdo->prepare($query);
    $stmt->bindValue(count($params) + 1, $limit, PDO::PARAM_INT);
    $stmt->bindValue(count($params) + 2, $offset, PDO::PARAM_INT);
    
    // Bind previous params
    for ($i = 0; $i < count($params); $i++) {
        $stmt->bindValue($i + 1, $params[$i]);
    }
    
    $stmt->execute();
    $logs = $stmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'data' => $logs,
        'total' => (int)$totalCount,
        'limit' => $limit,
        'offset' => $offset
    ]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
