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

$data = json_decode(file_get_contents("php://input"));
if (empty($data->provider) || empty($data->token)) {
    ApiResponse::error("Provider and token are required", 400);
}

$userId = $jwt->getUserId($token);
$provider = $data->provider;
$providerToken = $data->token;

$oauth = new OAuth($db);

// Validate provider token (simplified; add specific validation for each provider if needed)
if ($provider === 'google') {
    $verifyUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" . $providerToken;
    $response = file_get_contents($verifyUrl);
    if (!$response) {
        ApiResponse::error("Failed to verify Google token", 400);
    }
    $tokenInfo = json_decode($response);
    if (!isset($tokenInfo->sub)) {
        ApiResponse::error("Invalid Google token", 400);
    }
    $providerId = $tokenInfo->sub;
    $providerData = json_encode([
        'name' => $tokenInfo->name ?? '',
        'email' => $tokenInfo->email ?? '',
        'picture' => $tokenInfo->picture ?? ''
    ]);
} elseif ($provider === 'facebook') {
    $fbAppId = getenv('FACEBOOK_APP_ID') ?: 'YOUR_FACEBOOK_APP_ID';
    $fbAppSecret = getenv('FACEBOOK_APP_SECRET') ?: 'YOUR_FACEBOOK_APP_SECRET';
    $verifyUrl = "https://graph.facebook.com/debug_token?input_token={$providerToken}&access_token={$fbAppId}|{$fbAppSecret}";
    $response = file_get_contents($verifyUrl);
    if (!$response) {
        ApiResponse::error("Failed to verify Facebook token", 400);
    }
    $tokenInfo = json_decode($response);
    if (!isset($tokenInfo->data->is_valid) || !$tokenInfo->data->is_valid) {
        ApiResponse::error("Invalid Facebook token", 400);
    }
    $providerId = $tokenInfo->data->user_id;
    $userInfoUrl = "https://graph.facebook.com/v18.0/{$providerId}?fields=id,name,email,picture&access_token={$providerToken}";
    $userResponse = file_get_contents($userInfoUrl);
    $userInfo = json_decode($userResponse);
    $providerData = json_encode([
        'name' => $userInfo->name ?? '',
        'email' => $userInfo->email ?? '',
        'picture' => $userInfo->picture->data->url ?? ''
    ]);
} else {
    ApiResponse::error("Unsupported provider", 400);
}

$oauth->linkProviderToUser($userId, $provider, $providerId, $providerData);

ApiResponse::success([], "Provider linked successfully");
?>