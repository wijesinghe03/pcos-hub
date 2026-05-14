<?php
// ============================================================
// PCOS CARE HUB — AI Chatbot Handler (chatbot_handler.php)
// ============================================================

require_once 'db_connect.php';
session_start();
header('Content-Type: application/json');

$apiKey = "AIzaSyDbArBTCZymlVHVBiwC-J8kK9wpOUQn7CI";
$apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" . $apiKey;

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data || !isset($data['message'])) {
    echo json_encode(['status' => 'error', 'message' => 'Message is required.']);
    exit;
}

$userMessage = $data['message'];
$userId = $_SESSION['user_id'] ?? null;
$userRole = $_SESSION['user_role'] ?? 'guest';

// System Instruction for the AI
$systemInstruction = "You are a helpful assistant for PCOS Care Hub, a digital platform for managing Polycystic Ovary Syndrome in Sri Lanka. 
Your goal is to answer questions about PCOS and the PCOS Care Hub website. 
Be empathetic, informative, and professional. 
PCOS Care Hub features include: 
- Symptom tracking (Track Symptoms page)
- Menstrual cycle logging (Menstrual Cycle page)
- Appointment booking with doctors and hospitals (Hospitals/Appointments pages)
- Lab results viewing (Lab Results page)
- Health reports and analytics (Reports page)
- Lifestyle logging (Lifestyle Log page)
- Educational blogs and articles (Blog page)
Always advise users to consult with a medical professional for personal diagnosis and treatment. 
If a user asks about website features, explain how PCOS Care Hub helps them. 
Keep responses concise and formatted with markdown if needed.";

$contents = [];

// Fetch previous history if logged in to provide context (last 10 messages)
if ($userId) {
    try {
        $stmt = $pdo->prepare("SELECT message, sender FROM chatbot_history WHERE user_id = ? AND user_role = ? ORDER BY created_at DESC LIMIT 10");
        $stmt->execute([$userId, $userRole]);
        $history = array_reverse($stmt->fetchAll());
        
        foreach ($history as $chat) {
            $contents[] = [
                "role" => ($chat['sender'] === 'user' ? 'user' : 'model'),
                "parts" => [["text" => $chat['message']]]
            ];
        }
    } catch (Exception $e) {
        // Continue without history if database fails
    }
}

// Add the current message
$contents[] = [
    "role" => "user",
    "parts" => [["text" => $userMessage]]
];

// Prepare data for Gemini API
$requestData = [
    "contents" => $contents,
    "system_instruction" => [
        "parts" => [
            ["text" => $systemInstruction]
        ]
    ],
    "generationConfig" => [
        "temperature" => 0.7,
        "topK" => 40,
        "topP" => 0.95,
        "maxOutputTokens" => 800,
    ]
];

// Call Gemini API
$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Required for local XAMPP dev
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    $errRes = json_decode($response, true);
    echo json_encode([
        'status' => 'error', 
        'message' => 'AI Service unavailable.', 
        'error' => $errRes['error']['message'] ?? 'Unknown error'
    ]);
    exit;
}

$result = json_decode($response, true);
$botResponse = $result['candidates'][0]['content']['parts'][0]['text'] ?? "I'm sorry, I couldn't process that.";

// Save to history if user is logged in
if ($userId) {
    try {
        $stmt = $pdo->prepare("INSERT INTO chatbot_history (user_id, user_role, message, sender) VALUES (?, ?, ?, 'user')");
        $stmt->execute([$userId, $userRole, $userMessage]);
        
        $stmt = $pdo->prepare("INSERT INTO chatbot_history (user_id, user_role, message, sender) VALUES (?, ?, ?, 'bot')");
        $stmt->execute([$userId, $userRole, $botResponse]);
    } catch (Exception $e) {
        // Silently fail if history saving fails
    }
}

echo json_encode([
    'status' => 'success',
    'reply' => $botResponse
]);
