<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth_config.php';
require_once __DIR__ . '/../models/oauth.php';
require_once __DIR__ . '/../utils/api_response.php';
require_once __DIR__ . '/../utils/jwt.php';

ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php_errors.log');
ini_set('display_errors', 0);

$database = new Database();
$db = $database->getConnection();

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
error_log("Providers.php: Authorization header: $authHeader");

if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    error_log("Providers.php: Missing or invalid Authorization header");
    ApiResponse::error("Authorization token is required", 401);
    exit;
}

$token = $matches[1];
error_log("Providers.php: Token received: $token");

$jwt = new JWT();
$payload = $jwt->validate($token);
if (!$payload) {
    error_log("Providers.php: Token validation failed");
    ApiResponse::error("Invalid or expired token", 401);
    exit;
}

if (!isset($payload['user_id'])) {
    error_log("Providers.php: Token payload missing user_id");
    ApiResponse::error("Invalid token payload", 401);
    exit;
}

$userId = $payload['user_id'];
error_log("Providers.php: Validated user ID: $userId");

$oauth = new OAuth($db);
$providers = $oauth->getUserProviders($userId);
error_log("Providers.php: Providers for user $userId: " . json_encode($providers));

ApiResponse::success(
    ["providers" => $providers],
    "OAuth providers retrieved successfully"
);
?>