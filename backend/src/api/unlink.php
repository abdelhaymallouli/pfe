<?php
/**
 * OAuth unlink endpoint
 * Unlinks an OAuth provider from a user account
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

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Check if provider is provided
if (empty($data->provider)) {
    ApiResponse::error("Provider is required", 400);
}

$provider = $data->provider;

// Create OAuth instance
$oauth = new OAuth($db);

// Get user's OAuth providers
$providers = $oauth->getUserProviders($payload['user_id']);

// Check if user has at least one other authentication method
$hasPassword = false;
$hasOtherProvider = false;

// Check if user has a password
$user = new User($db);
if ($user->getById($payload['user_id'])) {
    // Check if password is set (not empty)
    if (!empty($user->password)) {
        $hasPassword = true;
    }
}

// Check if user has other OAuth providers
foreach ($providers as $p) {
    if ($p['provider'] !== $provider) {
        $hasOtherProvider = true;
        break;
    }
}

// Prevent unlinking if it's the only authentication method
if (!$hasPassword && !$hasOtherProvider && count($providers) <= 1) {
    ApiResponse::error("Cannot unlink the only authentication method. Add a password or link another provider first.", 400);
}

// Unlink provider
if ($oauth->unlinkProviderFromUser($payload['user_id'], $provider)) {
    ApiResponse::success(null, "Provider unlinked successfully");
} else {
    ApiResponse::error("Failed to unlink provider", 500);
}
?>
