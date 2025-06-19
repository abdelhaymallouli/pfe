<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth_config.php';
require_once __DIR__ . '/../models/user.php';
require_once __DIR__ . '/../models/oauth.php';
require_once __DIR__ . '/../utils/api_response.php';
require_once __DIR__ . '/../utils/jwt.php';
require_once __DIR__ . '/../../vendor/autoload.php';

ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php_errors.log');
ini_set('display_errors', 0);
error_log("Google.php accessed: " . date('Y-m-d H:i:s'));

try {
    $envPath = __DIR__ . '/../../.env';
    error_log("Checking .env path: $envPath");
    if (!file_exists($envPath)) {
        error_log("Error: .env file not found at $envPath");
        ApiResponse::error("Server configuration error: .env file missing", 500);
    }

    if (!is_readable($envPath)) {
        error_log("Error: .env file not readable at $envPath");
        ApiResponse::error("Server configuration error: .env file not readable", 500);
    }

    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
    $dotenv->load();

    $googleClientId = getenv('GOOGLE_CLIENT_ID');
    $googleClientSecret = getenv('GOOGLE_CLIENT_SECRET');
    $jwtSecret = getenv('JWT_SECRET');
    $jwtExpiration = getenv('JWT_EXPIRATION');

    error_log("GOOGLE_CLIENT_ID: " . ($googleClientId ?: 'Not set'));
    error_log("GOOGLE_CLIENT_SECRET: " . ($googleClientSecret ?: 'Not set'));
    error_log("JWT_SECRET: " . ($jwtSecret ?: 'Not set'));
    error_log("JWT_EXPIRATION: " . ($jwtExpiration ?: 'Not set'));

    // Temporary fallbacks for debugging
    $googleClientId = $googleClientId;
    $googleClientSecret = $googleClientSecret ;
    $jwtSecret = $jwtSecret;
    $jwtExpiration = $jwtExpiration ?: 86400;

    if (!$googleClientId || !$googleClientSecret) {
        error_log("Error: Google client ID or secret not set");
        ApiResponse::error("Server configuration error: Missing Google credentials", 500);
    }

    if (!$jwtSecret) {
        error_log("Error: JWT_SECRET not set");
        ApiResponse::error("Server configuration error: Missing JWT secret", 500);
    }

    define('JWT_SECRET', $jwtSecret);
    define('JWT_EXPIRATION', $jwtExpiration);

    $database = new Database();
    $db = $database->getConnection();
    if (!$db) {
        error_log("Error: Database connection failed");
        ApiResponse::error("Database connection failed", 500);
    }

    $rawInput = file_get_contents("php://input");
    error_log("Raw input: " . $rawInput);
    $data = json_decode($rawInput);

    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("JSON decode error: " . json_last_error_msg());
        ApiResponse::error("Invalid JSON data", 400);
    }

    if (empty($data->code)) {
        error_log("Error: Google authorization code is missing");
        ApiResponse::error("Google authorization code is required", 400);
    }

    $code = $data->code;
    $redirectUri = 'http://localhost:5173';

    error_log("Google Client ID: $googleClientId");
    error_log("Received code: $code");

    $tokenUrl = "https://oauth2.googleapis.com/token";
    $tokenParams = [
        'code' => $code,
        'client_id' => $googleClientId,
        'client_secret' => $googleClientSecret,
        'redirect_uri' => $redirectUri,
        'grant_type' => 'authorization_code',
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $tokenUrl);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($tokenParams));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    $response = curl_exec($ch);
    $curlError = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($curlError) {
        error_log("cURL error exchanging token: " . $curlError);
        ApiResponse::error("Failed to exchange authorization code: cURL error", 500);
    }

    if ($httpCode !== 200) {
        error_log("Token exchange failed with HTTP $httpCode: " . $response);
        ApiResponse::error("Token exchange failed with HTTP $httpCode", 500);
    }

    $tokenInfo = json_decode($response, true);
    error_log("Token exchange response: " . print_r($tokenInfo, true));

    if (isset($tokenInfo['error'])) {
        error_log("Token exchange error: " . $tokenInfo['error']);
        ApiResponse::error("Failed to exchange authorization code: " . $tokenInfo['error'], 400);
    }

    if (!isset($tokenInfo['id_token'])) {
        error_log("Error: No ID token received");
        ApiResponse::error("No ID token received", 400);
    }

    $verifyUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" . $tokenInfo['id_token'];
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $verifyUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    $response = curl_exec($ch);
    $curlError = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($curlError) {
        error_log("cURL error verifying token: $curlError");
        ApiResponse::error("Failed to verify Google token: cURL error", 500);
    }

    if ($httpCode !== 200) {
        error_log("Token verification failed with HTTP $httpCode: " . $response);
        ApiResponse::error("Token verification failed with HTTP $httpCode", 500);
    }

    $tokenInfo = json_decode($response, true);
    error_log("Token info: " . print_r($tokenInfo, true));

    if (!isset($tokenInfo['sub']) || !isset($tokenInfo['email'])) {
        error_log("Error: Invalid Google token - missing sub or email");
        ApiResponse::error("Invalid Google token", 400);
    }

    if ($tokenInfo['aud'] !== $googleClientId) {
        error_log("Error: Token audience mismatch - expected $googleClientId, got " . $tokenInfo['aud']);
        ApiResponse::error("Token was not issued for this application", 400);
    }

    $googleId = $tokenInfo['sub'];
    $email = $tokenInfo['email'];
    $name = $tokenInfo['name'] ?? '';
    $givenName = $tokenInfo['given_name'] ?? '';
    $familyName = $tokenInfo['family_name'] ?? '';
    $picture = $tokenInfo['picture'] ?? '';

    $oauth = new OAuth($db);
    $user = $oauth->findUserByOAuth('google', $googleId);
    error_log("findUserByOAuth result: " . print_r($user, true));

    if (!$user) {
        $userModel = new User($db);
        $userModel->email = $email;

        if ($userModel->emailExists()) {
            if (!isset($userModel->id_client)) {
                error_log("Error: emailExists did not set user ID for email: $email");
                ApiResponse::error("Failed to link Google provider: User ID not found", 500);
            }
            $userId = $userModel->id_client;
            $username = $userModel->name;

            $stmt = $db->prepare("SELECT id_oauth FROM oauth_providers WHERE id_client = ? AND provider = ?");
            $stmt->execute([$userId, 'google']);
            if (!$stmt->fetch()) {
                $result = $oauth->linkProviderToUser(
                    $userId,
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
                if (!$result) {
                    error_log("Error: Failed to link Google provider for user ID: $userId");
                    ApiResponse::error("Failed to link Google provider", 500);
                }
                error_log("Linked Google provider to existing user: $userId");
            } else {
                error_log("Google provider already linked to user: $userId");
            }
        } else {
            $username = !empty($name) ? strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $name)) . rand(100, 999) : 'googleuser' . rand(100, 999);
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
            if (!$userId) {
                error_log("Error: Failed to create user with email: $email");
                ApiResponse::error("Failed to create user with Google provider", 500);
            }
            error_log("Created new user with Google provider: $userId");
        }
    } else {
        $userId = $user['id_client'] ?? null;
        $username = $user['username'];
        error_log("Found existing user with Google provider: $userId");
    }

    if (!$userId) {
        error_log("Error: Failed to retrieve or create user ID for email: $email");
        ApiResponse::error("Failed to authenticate: User ID could not be determined", 500);
    }

    $payload = [
        'user_id' => $userId,
        'username' => $username,
        'email' => $email,
        'iat' => time(),
        'exp' => time() + JWT_EXPIRATION
    ];
    $token = JWT::generate($userId, $username, $payload);
    error_log("Generated JWT for user ID $userId ($email): $token");

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
} catch (Exception $e) {
    error_log("Google.php exception: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());
    ApiResponse::error("Internal server error: " . $e->getMessage(), 500);
}
?>