<?php

// PCOS CARE HUB — Personalized Health Report Generator
header('Content-Type: text/plain');

require_once '../db_connect.php';

$patient_id = $_GET['patient_id'] ?? null;

if (!$patient_id) {
    echo "Error: Patient ID required.";
    exit;
}

try {
    // 1. Profile
    $stmt = $pdo->prepare("SELECT * FROM patients WHERE id = ?");
    $stmt->execute([$patient_id]);
    $p = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$p) {
        echo "Error: Patient not found.";
        exit;
    }

    $filename = "PCOS_Health_Report_" . str_replace(' ', '_', $p['full_name']) . ".txt";
    header('Content-Disposition: attachment; filename="' . $filename . '"');

    echo "===========================================================\n";
    echo "            PCOS CARE HUB — PERSONAL HEALTH REPORT          \n";
    echo "===========================================================\n\n";

    echo "PATIENT INFORMATION:\n";
    echo "--------------------\n";
    echo "Full Name:   " . $p['full_name'] . "\n";
    echo "Email:       " . $p['email'] . "\n";
    echo "Phone:       " . ($p['phone'] ?? 'N/A') . "\n";
    echo "Address:     " . ($p['address'] ?? 'N/A') . "\n";
    echo "Blood Group: " . ($p['blood_group'] ?? 'Unknown') . "\n";
    echo "Report Generated: " . date('Y-m-d H:i:s') . "\n\n";

    // 2. Recent Symptoms
    echo "RECENT SYMPTOM LOGS:\n";
    echo "--------------------\n";
    $stmt = $pdo->prepare("SELECT log_date, severity, symptoms FROM symptom_logs WHERE patient_id = ? ORDER BY log_date DESC LIMIT 5");
    $stmt->execute([$patient_id]);
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if ($logs) {
        foreach ($logs as $l) {
            echo "[" . $l['log_date'] . "] Severity: " . strtoupper($l['severity']) . " - Symptoms: " . $l['symptoms'] . "\n";
        }
    } else {
        echo "No recent symptoms logged.\n";
    }
    echo "\n";

    // 3. Menstrual Cycle
    echo "MENSTRUAL CYCLE HISTORY (Last 3):\n";
    echo "---------------------------------\n";
    $stmt = $pdo->prepare("SELECT period_start, period_end, cycle_length FROM cycle_logs WHERE patient_id = ? ORDER BY period_start DESC LIMIT 3");
    $stmt->execute([$patient_id]);
    $cycles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if ($cycles) {
        foreach ($cycles as $c) {
            echo "Cycle Start: " . $c['period_start'] . " | End: " . $c['period_end'] . " | Length: " . $c['cycle_length'] . " days\n";
        }
    } else {
        echo "No menstrual cycle data found.\n";
    }
    echo "\n";

    // 4. Medical Reports Summary
    echo "OFFICIAL MEDICAL DOCUMENTS:\n";
    echo "---------------------------\n";
    $stmt = $pdo->prepare("SELECT report_name, report_type, hospital_name, report_date FROM patient_reports WHERE patient_id = ? ORDER BY report_date DESC");
    $stmt->execute([$patient_id]);
    $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if ($reports) {
        foreach ($reports as $r) {
            echo "● " . $r['report_name'] . " (" . strtoupper($r['report_type']) . ") - " . $r['hospital_name'] . " [" . $r['report_date'] . "]\n";
        }
    } else {
        echo "No medical reports uploaded.\n";
    }
    echo "\n";

    // 5. Lifestyle Insight
    echo "LIFESTYLE SNAPSHOT (Recent Activity):\n";
    echo "-------------------------------------\n";
    $stmt = $pdo->prepare("SELECT exercise_name, duration_minutes, log_date FROM lifestyle_exercises WHERE patient_id = ? ORDER BY log_date DESC LIMIT 3");
    $stmt->execute([$patient_id]);
    $ex = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if ($ex) {
        foreach ($ex as $e) {
            echo "Exercise: " . $e['exercise_name'] . " (" . $e['duration_minutes'] . " mins) on " . $e['log_date'] . "\n";
        }
    } else {
        echo "No lifestyle activities found.\n";
    }
    echo "\n";

    echo "===========================================================\n";
    echo "  This document is for information purposes. Consult a MD. \n";
    echo "          Generated securely via PCOS Care Hub ©           \n";
    echo "===========================================================\n";
} catch (PDOException $e) {
    echo "Error generating report: " . $e->getMessage();
}
