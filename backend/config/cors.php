<?php
// Get the frontend URL from environment variable or use a default
$frontendUrl = getenv('FRONTEND_URL' ) ?: 'http://localhost:5173';

// Allow from specified origin
header("Access-Control-Allow-Origin: $frontendUrl" );
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200 );
    exit();
}
