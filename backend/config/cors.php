<?php
// Get the frontend URL from environment variable or use a default
$frontendUrl = getenv('FRONTEND_URL') ?: 'http://localhost:5173';

// Set CORS headers

header("Access-Control-Allow-Origin: $frontendUrl");
header("Content-Type: application/json; charset=UTF-8");
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
?>