<?php
/**
 * Google OAuth endpoint
 * Handles Google OAuth authentication
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
if (empty($data->token)) {
    ApiResponse::error("Google token is required", 400);
}

// Verify Google token
$googleToken = $data->token;
$googleClientId = getenv('GOOGLE_CLIENT_ID') ?: 'YOUR_GOOGLE_CLIENT_ID'; // Should be set in environment

$verifyUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" . $googleToken;
$response = file_get_contents($verifyUrl);

if (!$response) {
    ApiResponse::error("Failed to verify Google token", 400);
}

$tokenInfo = json_decode($response);

// Check if token is valid
if (!isset($tokenInfo->sub) || !isset($tokenInfo->email)) {
    ApiResponse::error("Invalid Google token", 400);
}

// Check if token was issued for our app
if ($tokenInfo->aud !== $googleClientId) {
    ApiResponse::error("Token was not issued for this application", 400);
}

// Get user info from token
$googleId = $tokenInfo->sub;
$email = $tokenInfo->email;
$name = isset($tokenInfo->name) ? $tokenInfo->name : '';
$givenName = isset($tokenInfo->given_name) ? $tokenInfo->given_name : '';
$familyName = isset($tokenInfo->family_name) ? $tokenInfo->family_name : '';
$picture = isset($tokenInfo->picture) ? $tokenInfo->picture : '';

// Create OAuth instance
$oauth = new OAuth($db);

// Check if user exists with this Google ID
$user = $oauth->findUserByOAuth('google', $googleId);

if (!$user) {
    // User doesn't exist, check if email exists
    $userModel = new User($db);
    $userModel->email = $email;
    
    if ($userModel->emailExists()) {
        // Email exists, link Google account to existing user
        $oauth->linkProviderToUser(
            $userModel->id, 
            'google', 
            $googleId, 
            json_encode([
                'name' => $name,
                'given_name' => $givenName,
                'family_name' => $familyName,
                'picture' => $picture,
                'email' => $email
            ])
        );
        
        // Get user data
        $userId = $userModel->id;
        $username = $userModel->username;
    } else {
        // Create new user with Google data
        $username = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $givenName . $familyName)) . rand(100, 999);
        
        $userId = $oauth->createUserWithOAuth(
            'google',
            $googleId,
            $email,
            $username,
            json_encode([
                'name' => $name,
                'given_name' => $givenName,
                'family_name' => $familyName,
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
    "Google authentication successful"
);
?>
