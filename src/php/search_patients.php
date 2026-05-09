<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

// PCOS CARE HUB - Search Patients API
// Used by Hospitals to find patients by Name, ID (id), or Username (often used as NIC/ID)

$searchId = $_GET['id'] ?? '';
$searchName = $_GET['name'] ?? '';
$statusFilter = $_GET['status'] ?? '';

try {
    // $pdo is already established in db_connect.php
    $sql = "SELECT id, full_name, username, email, phone, status, created_at FROM patients WHERE 1=1";
    $params = [];

    if (!empty($searchId)) {
        $sql .= " AND (id LIKE ? OR username LIKE ?)";
        $params[] = "%$searchId%";
        $params[] = "%$searchId%";
    }

    if (!empty($searchName)) {
        $sql .= " AND full_name LIKE ?";
        $params[] = "%$searchName%";
    }

    if (!empty($statusFilter)) {
        $sql .= " AND status = ?";
        $params[] = $statusFilter;
    }

    $sql .= " ORDER BY full_name ASC LIMIT 50";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $patients = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format for frontend
    $results = [];
    foreach ($patients as $p) {
        $results[] = [
            'id' => 'P-' . str_pad($p['id'], 4, '0', STR_PAD_LEFT),
            'raw_id' => $p['id'],
            'name' => $p['full_name'],
            'nic' => $p['username'], // Using username as NIC for now as per project convention
            'status' => $p['status'],
            'lastVisit' => 'N/A', // Would require joining with appointments table
            'diagnosis' => 'PCOS', // Placeholder
            'reports' => 0, // Would require joining with reports table
            'email' => $p['email'],
            'phone' => $p['phone'] ?: 'N/A'
        ];
    }

    echo json_encode(['status' => 'success', 'data' => $results]);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
