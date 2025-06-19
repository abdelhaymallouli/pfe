<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/auth_config.php';
require_once __DIR__ . '/../models/user.php';
require_once __DIR__ . '/../utils/jwt.php';
require_once __DIR__ . '/../utils/api_response.php';

ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php_errors.log');
ini_set('display_errors', 0);

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->email) || empty($data->password)) {
    error_log("Login.php: Missing email or password");
    ApiResponse::error("Email and password are required", 400);
    exit;
}

$user = new User($db);
$user->email = $data->email;

if ($user->emailExists()) {
    error_log("Login.php: User found for email: {$data->email}, stored password hash: {$user->password}");
    if (password_verify($data->password, $user->password)) {
        $payload = [
            'user_id' => $user->id,
            'username' => $user->name,
            'email' => $user->email,
            'iat' => time(),
            'exp' => time() + (defined('JWT_EXPIRATION') ? JWT_EXPIRATION : 86400)
        ];
        $token = JWT::generate($user->id, $user->name, $payload);
        error_log("Login.php: Generated token for user ID {$user->id}: $token");
        ApiResponse::success(
            [
                "token" => $token,
                "user" => [
                    "id" => $user->id,
                    "username" => $user->name,
                    "email" => $user->email
                ]
            ],
            "Login successful"
        );
    } else {
        error_log("Login.php: Password verification failed for email: {$data->email}");
        ApiResponse::error("Invalid email or password", 401);
    }
} else {
    error_log("Login.php: No user found for email: {$data->email}");
    ApiResponse::error("Invalid email or password", 401);
}
?>