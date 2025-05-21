<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../models/user.php';
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/auth_config.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Connect to database
$database = new Database();
$db = $database->getConnection();

// Get POST data (assume JSON input)
$data = json_decode(file_get_contents("php://input"));

if (
    empty($data->username) ||
    empty($data->email) ||
    empty($data->password) ||
    empty($data->confirm_password)
) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "error" => "Please fill all required fields"
    ]);
    exit;
}

if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "error" => "Invalid email address"
    ]);
    exit;
}

if ($data->password !== $data->confirm_password) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "error" => "Passwords do not match"
    ]);
    exit;
}

if (strlen($data->password) < 8) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "error" => "Password must be at least 8 characters"
    ]);
    exit;
}

// Create User object
$user = new User($db);
$user->name = $data->username;
$user->email = $data->email;

// Check if email exists
if ($user->emailExists()) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "error" => "Email already registered"
    ]);
    exit;
}

// Hash password
$user->password = password_hash($data->password, PASSWORD_BCRYPT);

// Create user in database
if ($user->create()) {
    http_response_code(201);
    echo json_encode([
        "status" => "success",
        "message" => "User registered successfully"
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "error" => "Failed to register user"
    ]);
}
