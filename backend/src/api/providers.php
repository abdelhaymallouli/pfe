<?php
/**
 * OAuth providers endpoint
 * Returns the OAuth providers linked to the user's account
 */

// Headers
require_once __DIR__ . '/../../config/cors.php';
// Include required files
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../models/user.php';
require_once __DIR__ . '/../models/oauth.php';
require_once __DIR__ . '/../utils/api_response.php';
require_once __DIR__ . '/../utils/jwt.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Get headers
$headers = getallheaders();

// Check if Authorization header exists
if (!isset($headers['Authorization'])) {
    ApiResponse::error("Authorization header is required", 401);
}

// Get the token
$authHeader = $headers['Authorization'];
$arr = explode(" ", $authHeader);

// Check if token format is valid
if (count($arr) != 2 || $arr[0] != 'Bearer') {
    ApiResponse::error("Invalid token format", 401);
}

$token = $arr[1];

// Validate token
$payload = JWT::validate($token);

if (!$payload) {
    ApiResponse::error("Invalid or expired token", 401);
}

// Create OAuth instance
$oauth = new OAuth($db);

// Get user's OAuth providers
$providers = $oauth->getUserProviders($payload['user_id']);

// Return success with providers
ApiResponse::success(
    [
        "providers" => $providers
    ],
    "OAuth providers retrieved successfully"
);
?>
