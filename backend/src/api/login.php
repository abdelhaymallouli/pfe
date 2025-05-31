<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../models/user.php';
require_once __DIR__ . '/../../config/cors.php'; 
require_once __DIR__ . '/../../config/auth_config.php';


$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->email) || empty($data->password)) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "error" => "Email and password are required"
    ]);
    exit;
}

// Create user instance
$user = new User($db);
$user->email = $data->email;

// Check if email exists and load user data
if ($user->emailExists()) {
    // Verify password
    if (password_verify($data->password, $user->password)) {
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Login successful",
            "data" => [
                "user" => [
                    "id" => $user->id,
                    "username" => $user->name,
                    "email" => $user->email
                ]
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            "status" => "error",
            "error" => "Invalid email or password"
        ]);
    }
} else {
    http_response_code(401);
    echo json_encode([
        "status" => "error",
        "error" => "Invalid email or password"
    ]);
}
