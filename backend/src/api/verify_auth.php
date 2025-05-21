<?php
/**
 * Authentication verification endpoint
 * Verifies JWT token and returns user data
 */


// Headers
require_once __DIR__ . '/../../config/cors.php';
// Include required files
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../models/user.php';
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

// Create user instance
$user = new User($db);

// Get user by ID
if ($user->getById($payload['user_id'])) {
    // Check if user is verified and active
    if (!$user->is_verified) {
        ApiResponse::error("Account not verified", 401);
    }
    
    if (!$user->is_active) {
        ApiResponse::error("Account is disabled", 401);
    }
    
    // Return user data
    ApiResponse::success(
        [
            "user" => [
                "id" => $user->id,
                "username" => $user->username,
                "email" => $user->email
            ]
        ],
        "Authentication verified"
    );
} else {
    ApiResponse::error("User not found", 404);
}
?>
