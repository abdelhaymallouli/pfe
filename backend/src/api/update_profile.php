<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../models/user.php';
require_once __DIR__ . '/../../config/cors.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->id) || empty($data->username) || empty($data->email)) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "error" => "All fields are required"
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

$user = new User($db);
$user->id = $data->id;
$user->name = $data->username;
$user->email = $data->email;

if ($user->getById($data->id)) {
    // Check if email is already used by another user
    $query = "SELECT id_client FROM client WHERE email = :email AND id_client != :id_client";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $data->email);
    $stmt->bindParam(':id_client', $data->id);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "error" => "Email already in use"
        ]);
        exit;
    }

    $query = "UPDATE client SET name = :name, email = :email WHERE id_client = :id_client";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':name', $data->username);
    $stmt->bindParam(':email', $data->email);
    $stmt->bindParam(':id_client', $data->id);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Profile updated successfully"
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "error" => "Failed to update profile"
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