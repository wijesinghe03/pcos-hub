<?php
session_start();
require_once 'db_connect.php';

// Security Check: Only admins can export logs
if (empty($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    header('HTTP/1.1 403 Forbidden');
    exit('Unauthorized access.');
}

try {
    $stmt = $pdo->query("SELECT * FROM system_logs ORDER BY timestamp DESC");
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($logs)) {
        exit('No logs found to export.');
    }

    $filename = "pcos_hub_logs_" . date('Y-m-d_H-i-s') . ".csv";

    // Set headers for download
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=' . $filename);

    $output = fopen('php://output', 'w');

    // Add CSV Headers
    fputcsv($output, ['ID', 'Log ID', 'Timestamp', 'Category', 'Severity', 'Message', 'User', 'IP Address']);

    // Add Log Data
    foreach ($logs as $log) {
        fputcsv($output, [
            $log['id'],
            $log['log_id'],
            $log['timestamp'],
            $log['category'],
            $log['severity'],
            $log['message'],
            $log['user_identifier'],
            $log['ip_address']
        ]);
    }

    fclose($output);
    exit;

} catch (Exception $e) {
    exit('Export failed: ' . $e->getMessage());
}
