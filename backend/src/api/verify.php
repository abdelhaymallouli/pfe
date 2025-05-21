<?php
/**
 * Verify account endpoint
 * Handles email verification
 */


// Headers
require_once __DIR__ . '/../../config/cors.php';
// Include required files
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../models/user.php';
require_once __DIR__ . '/../utils/api_response.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Check if token is provided
if (empty($_GET['token'])) {
    ApiResponse::error("Verification token is required", 400);
}

$token = $_GET['token'];

// Create user instance
$user = new User($db);

// Verify account
if ($user->verifyAccount($token)) {
    ApiResponse::success(null, "Account verified successfully. You can now login.");
} else {
    ApiResponse::error("Invalid or expired verification token", 400);
}
?>
