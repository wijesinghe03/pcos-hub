<?php
require_once 'src/php/db_connect.php';
$patient_id = 18;
$url = "http://localhost/pcos-hub/src/php/components/appointment_handler.php?patient_id=$patient_id&filter=all&search=";
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);
echo "Response: " . $response . "\n";
?>
