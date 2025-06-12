<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth_config.php';
require_once __DIR__ . '/../models/oauth.php';
require_once __DIR__ . '/../utils/api_response.php';
require_once __DIR__ . '/../utils/jwt.php';

$database = new Database();
$db = $database->getConnection();

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    ApiResponse::error("Authorization token is required", 401);
}

$token = $matches[1];
$jwt = new JWT();
if (!$jwt->validate($token)) {
    ApiResponse::error("Invalid or expired token", 401);
}

$userId = $jwt->getUserId($token);
$oauth = new OAuth($db);
$providers = $oauth->getUserProviders($userId);

ApiResponse::success(
    ["providers" => $providers],
    "OAuth providers retrieved successfully"
);
?>