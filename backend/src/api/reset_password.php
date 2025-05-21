<?php
/**
 * Reset password endpoint
 * Handles password reset using token
 */

// Headers
require_once __DIR__ . '/../../config/cors.php';
// Include required files
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth_config.php';
require_once __DIR__ . '/../models/user.php';
require_once __DIR__ . '/../utils/api_response.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Check if data is complete
if (
    empty($data->token) ||
    empty($data->password) ||
    empty($data->confirm_password)
) {
    ApiResponse::error("Please provide all required fields: token, password, confirm_password", 400);
}

// Check if passwords match
if ($data->password !== $data->confirm_password) {
    ApiResponse::error("Passwords do not match", 400);
}

// Check password length
if (strlen($data->password) < PASSWORD_MIN_LENGTH) {
    ApiResponse::error("Password must be at least " . PASSWORD_MIN_LENGTH . " characters", 400);
}

// Create user instance
$user = new User($db);

// Verify reset token
if ($user->verifyResetToken($data->token)) {
    // Hash the new password
    $user->password = password_hash($data->password, PASSWORD_BCRYPT, ['cost' => BCRYPT_COST]);
    
    // Reset password
    if ($user->resetPassword()) {
        ApiResponse::success(null, "Password has been reset successfully. You can now login with your new password.");
    } else {
        ApiResponse::error("Failed to reset password", 500);
    }
} else {
    ApiResponse::error("Invalid or expired reset token", 400);
}
?>
