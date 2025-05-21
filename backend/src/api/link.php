<?php
/**
 * OAuth link endpoint
 * Links an OAuth provider to an existing user account
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

// Check if data is complete
if (empty($data->provider) || empty($data->token)) {
    ApiResponse::error("Provider and token are required", 400);
}

$provider = $data->provider;
$providerToken = $data->token;

// Create OAuth instance
$oauth = new OAuth($db);

// Handle different providers
if ($provider === 'google') {
    // Verify Google token
    $googleClientId = getenv('GOOGLE_CLIENT_ID') ?: 'YOUR_GOOGLE_CLIENT_ID';
    $verifyUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" . $providerToken;
    $response = file_get_contents($verifyUrl);
    
    if (!$response) {
        ApiResponse::error("Failed to verify Google token", 400);
    }
    
    $tokenInfo = json_decode($response);
    
    // Check if token is valid
    if (!isset($tokenInfo->sub)) {
        ApiResponse::error("Invalid Google token", 400);
    }
    
    // Check if token was issued for our app
    if ($tokenInfo->aud !== $googleClientId) {
        ApiResponse::error("Token was not issued for this application", 400);
    }
    
    // Get user info from token
    $providerId = $tokenInfo->sub;
    $email = $tokenInfo->email;
    $name = isset($tokenInfo->name) ? $tokenInfo->name : '';
    $givenName = isset($tokenInfo->given_name) ? $tokenInfo->given_name : '';
    $familyName = isset($tokenInfo->family_name) ? $tokenInfo->family_name : '';
    $picture = isset($tokenInfo->picture) ? $tokenInfo->picture : '';
    
    // Link Google account to user
    $oauth->linkProviderToUser(
        $payload['user_id'], 
        'google', 
        $providerId, 
        json_encode([
            'name' => $name,
            'given_name' => $givenName,
            'family_name' => $familyName,
            'picture' => $picture,
            'email' => $email
        ])
    );
} else if ($provider === 'facebook') {
    // Verify Facebook token
    $fbAccessToken = $data->token;
    $fbUserId = $data->userID;
    $fbAppId = getenv('FACEBOOK_APP_ID') ?: 'YOUR_FACEBOOK_APP_ID';
    $fbAppSecret = getenv('FACEBOOK_APP_SECRET') ?: 'YOUR_FACEBOOK_APP_SECRET';
    
    // Verify token with Facebook Graph API
    $verifyUrl = "https://graph.facebook.com/debug_token?input_token={$fbAccessToken}&access_token={$fbAppId}|{$fbAppSecret}";
    $response = file_get_contents($verifyUrl);
    
    if (!$response) {
        ApiResponse::error("Failed to verify Facebook token", 400);
    }
    
    $tokenInfo = json_decode($response);
    
    // Check if token is valid
    if (!isset($tokenInfo->data->is_valid) || $tokenInfo->data->is_valid !== true) {
        ApiResponse::error("Invalid Facebook token", 400);
    }
    
    // Check if token was issued for our app
    if ($tokenInfo->data->app_id !== $fbAppId) {
        ApiResponse::error("Token was not issued for this application", 400);
    }
    
    // Get user info from Facebook
    $userInfoUrl = "https://graph.facebook.com/v18.0/{$fbUserId}?fields=id,name,email,first_name,last_name,picture&access_token={$fbAccessToken}";
    $userResponse = file_get_contents($userInfoUrl);
    
    if (!$userResponse) {
        ApiResponse::error("Failed to get user info from Facebook", 400);
    }
    
    $userInfo = json_decode($userResponse);
    
    // Extract user data
    $providerId = $fbUserId;
    $email = isset($userInfo->email) ? $userInfo->email : '';
    $name = isset($userInfo->name) ? $userInfo->name : '';
    $firstName = isset($userInfo->first_name) ? $userInfo->first_name : '';
    $lastName = isset($userInfo->last_name) ? $userInfo->last_name : '';
    $picture = isset($userInfo->picture->data->url) ? $userInfo->picture->data->url : '';
    
    // Link Facebook account to user
    $oauth->linkProviderToUser(
        $payload['user_id'], 
        'facebook', 
        $providerId, 
        json_encode([
            'name' => $name,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'picture' => $picture,
            'email' => $email
        ])
    );
} else {
    ApiResponse::error("Unsupported provider", 400);
}

// Return success
ApiResponse::success(null, "Provider linked successfully");
?>
