<?php
// backend/config/cors.php

// Set allowed origins (adjust as needed)
$allowedOrigins = ['http://localhost:5173'];

// Get the request's origin
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Check if the origin is allowed
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Optionally allow all origins for development (less secure)
    header("Access-Control-Allow-Origin: *");
}

// Allow specific methods, including PUT
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Allow specific headers
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Allow credentials (if needed, e.g., for authenticated requests)
header("Access-Control-Allow-Credentials: true");

// Set max age for preflight request caching
header("Access-Control-Max-Age: 86400");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
?>