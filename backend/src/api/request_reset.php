<?php
/**
 * Request password reset endpoint
 * Handles password reset request
 */

// Headers
// Corrected path to include cors.php
require_once __DIR__ . '/../../config/cors.php';
// Include required files
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../models/user.php';
require_once __DIR__ . '/../utils/api_response.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Check if email is provided
if (empty($data->email)) {
    ApiResponse::error("Email is required", 400);
}

// Validate email
if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
    ApiResponse::error("Invalid email format", 400);
}

// Create user instance
$user = new User($db);

// Set email property
$user->email = $data->email;

// Check if email exists
if ($user->emailExists()) {
    // Create password reset token
    if ($user->createPasswordResetToken()) {
        // In a real application, you would send an email here
        // with a link containing the reset token
        
        ApiResponse::success(
            [
                "reset_token" => $user->reset_token,
                "expires_at" => $user->reset_token_expires_at
            ],
            "Password reset link has been sent to your email"
        );
    } else {
        ApiResponse::error("Failed to create password reset token", 500);
    }
} else {
    // For security reasons, don't reveal that the email doesn't exist
    ApiResponse::success(null, "If your email exists in our system, you will receive a password reset link");
}
?>
