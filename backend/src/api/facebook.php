<?php
/**
 * Facebook OAuth endpoint
 * Handles Facebook OAuth authentication
 */

// Headers
require_once __DIR__ . '/../../config/cors.php';
// Include required files
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth_config.php';
require_once __DIR__ . '/../models/user.php';
require_once __DIR__ . '/../models/oauth.php';
require_once __DIR__ . '/../utils/api_response.php';
require_once __DIR__ . '/../utils/jwt.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Check if token is provided
if (empty($data->accessToken) || empty($data->userID)) {
    ApiResponse::error("Facebook access token and user ID are required", 400);
}

// Verify Facebook token
$fbAccessToken = $data->accessToken;
$fbUserId = $data->userID;
$fbAppId = getenv('FACEBOOK_APP_ID') ?: 'YOUR_FACEBOOK_APP_ID'; // Should be set in environment
$fbAppSecret = getenv('FACEBOOK_APP_SECRET') ?: 'YOUR_FACEBOOK_APP_SECRET'; // Should be set in environment

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

// Check if user ID matches
if ($tokenInfo->data->user_id !== $fbUserId) {
    ApiResponse::error("User ID mismatch", 400);
}

// Get user info from Facebook
$userInfoUrl = "https://graph.facebook.com/v18.0/{$fbUserId}?fields=id,name,email,first_name,last_name,picture&access_token={$fbAccessToken}";
$userResponse = file_get_contents($userInfoUrl);

if (!$userResponse) {
    ApiResponse::error("Failed to get user info from Facebook", 400);
}

$userInfo = json_decode($userResponse);

// Extract user data
$email = isset($userInfo->email) ? $userInfo->email : '';
$name = isset($userInfo->name) ? $userInfo->name : '';
$firstName = isset($userInfo->first_name) ? $userInfo->first_name : '';
$lastName = isset($userInfo->last_name) ? $userInfo->last_name : '';
$picture = isset($userInfo->picture->data->url) ? $userInfo->picture->data->url : '';

// If email is not provided, generate a placeholder
if (empty($email)) {
    $email = "fb_" . $fbUserId . "@placeholder.com";
}

// Create OAuth instance
$oauth = new OAuth($db);

// Check if user exists with this Facebook ID
$user = $oauth->findUserByOAuth('facebook', $fbUserId);

if (!$user) {
    // User doesn't exist, check if email exists
    $userModel = new User($db);
    $userModel->email = $email;
    
    if ($userModel->emailExists()) {
        // Email exists, link Facebook account to existing user
        $oauth->linkProviderToUser(
            $userModel->id, 
            'facebook', 
            $fbUserId, 
            json_encode([
                'name' => $name,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'picture' => $picture,
                'email' => $email
            ])
        );
        
        // Get user data
        $userId = $userModel->id;
        $username = $userModel->username;
    } else {
        // Create new user with Facebook data
        $username = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $firstName . $lastName)) . rand(100, 999);
        
        $userId = $oauth->createUserWithOAuth(
            'facebook',
            $fbUserId,
            $email,
            $username,
            json_encode([
                'name' => $name,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'picture' => $picture,
                'email' => $email
            ])
        );
    }
} else {
    // User exists
    $userId = $user['id'];
    $username = $user['username'];
}

// Generate JWT token
$token = JWT::generate($userId, $username);

// Return success with token
ApiResponse::success(
    [
        "token" => $token,
        "user" => [
            "id" => $userId,
            "username" => $username,
            "email" => $email
        ]
    ],
    "Facebook authentication successful"
);
?>
