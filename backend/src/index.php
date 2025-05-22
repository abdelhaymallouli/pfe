<?php
/**
 * Index file
 * Entry point for the API
 */

// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Return API info
echo json_encode([
    "name" => "PHP Authentication API",
    "version" => "1.0.0",
    "description" => "RESTful API for user authentication with MySQL PDO",
    "endpoints" => [
        "/api/signup.php" => "Register a new user",
        "/api/login.php" => "Authenticate user and get token",
        "/api/verify.php" => "Verify user account with token",
        "/api/verify_auth.php" => "Verify authentication token",
        "/api/request_reset.php" => "Request password reset",
        "/api/reset_password.php" => "Reset password with token",
        "/api/events.php" => "Manage events (GET: list, POST: create)"
        ]
]);
?>
