<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../models/user.php';
require_once __DIR__ . '/../../config/cors.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->id) || empty($data->currentPassword) || empty($data->newPassword)) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "error" => "All fields are required"
    ]);
    exit;
}

$user = new User($db);
$user->id = $data->id;

if ($user->getById($data->id)) {
    if ($user->verifyPassword($data->currentPassword)) {
        if (strlen($data->newPassword) < 8) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "error" => "New password must be at least 8 characters"
            ]);
            exit;
        }

        $user->password = password_hash($data->newPassword, PASSWORD_BCRYPT);
        if ($user->updatePassword()) {
            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Password changed successfully"
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "error" => "Failed to change password"
            ]);
        }
    } else {
        http_response_code(401);
        echo json_encode([
            "status" => "error",
            "error" => "Current password is incorrect"
        ]);
    }
} else {
    http_response_code(404);
    echo json_encode([
        "status" => "error",
        "error" => "User not found"
    ]);
}
?>