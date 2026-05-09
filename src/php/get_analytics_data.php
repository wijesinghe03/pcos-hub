<?php
require_once 'db_connect.php';
require_once __DIR__ . '/utils/Logger.php';
header('Content-Type: application/json');

try {
    Logger::log('system', 'info', 'Analytics data engine queried for dashboard metrics', 'AnalyticsEngine');
    // 1. User Growth (Last 6 Months)
    $growth_data = [];
    for ($i = 5; $i >= 0; $i--) {
        $month = date('Y-m', strtotime("-$i months"));
        $month_label = date('M', strtotime("-$i months"));
        
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM patients WHERE created_at <= LAST_DAY(STR_TO_DATE(?, '%Y-%m-01'))");
        $stmt->execute([$month]);
        $count = $stmt->fetch()['count'];
        
        $growth_data[] = [
            'label' => $month_label,
            'count' => (int)$count
        ];
    }

    // 2. User Distribution
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM patients");
    $p_count = $stmt->fetch()['count'];
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM hospitals");
    $h_count = $stmt->fetch()['count'];
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM admin_users");
    $a_count = $stmt->fetch()['count'];

    // 3. Regional Distribution (Mocking based on locations if data exists, otherwise spreading)
    $stmt = $pdo->query("SELECT location, COUNT(*) as count FROM hospitals GROUP BY location ORDER BY count DESC LIMIT 5");
    $locations = $stmt->fetchAll();

    // 4. Top Performing Hospitals (Real counts from appointments and reviews)
    $stmt = $pdo->query("
        SELECT 
            h.id, 
            h.hosp_name, 
            h.location, 
            COALESCE(AVG(r.rating), 0) as avg_rating,
            (SELECT COUNT(DISTINCT pa.patient_id) FROM patient_appointments pa WHERE pa.hospital_name = h.hosp_name) as active_patients,
            COUNT(r.id) as review_count
        FROM hospitals h
        LEFT JOIN hospital_reviews r ON h.id = r.hospital_id
        WHERE h.approval_status = 'approved'
        GROUP BY h.id
        ORDER BY avg_rating DESC, active_patients DESC
        LIMIT 10
    ");
    $top_hospitals = $stmt->fetchAll();

    // 5. High-level Summary Metrics
    $stmt = $pdo->query("SELECT COUNT(*) FROM hospital_reviews");
    $total_reviews = $stmt->fetchColumn();
    
    $stmt = $pdo->query("SELECT COUNT(DISTINCT patient_id) FROM patient_appointments");
    $active_engaged_patients = $stmt->fetchColumn();

    echo json_encode([
        'status' => 'success',
        'data' => [
            'growth' => $growth_data,
            'distribution' => [
                'patients' => (int)$p_count,
                'hospitals' => (int)$h_count,
                'admins' => (int)$a_count
            ],
            'locations' => $locations,
            'top_hospitals' => $top_hospitals,
            'metrics' => [
                'total_reviews' => (int)$total_reviews,
                'engaged_patients' => (int)$active_engaged_patients
            ]
        ]
    ]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
