<?php
// backend/config/cors.php

$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173', // Add both for safety
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Max-Age: 86400");

    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
} else {
    // Reject disallowed origins
    error_log("CORS: Origin $origin not allowed");
    header('Content-Type: application/json');
    http_response_code(403);
    echo json_encode([
        'status' => 'error',
        'error' => 'CORS origin not allowed'
    ]);
    exit;
}
?>
