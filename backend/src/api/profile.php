<?php


require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../models/user.php';
require_once __DIR__ . '/../utils/api_response.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

$user = new User($db);
$user_id = null;
$headers = apache_request_headers();

if (isset($headers['Authorization'])) {
    $token = str_replace('Bearer ', '', $headers['Authorization']);
    $user_id = verifyToken($token); // Assumes verifyToken function exists
}

if (!$user_id || !$user->getById($user_id)) {
    ApiResponse::error("Unauthorized or user not found", 401);
}

if ($method === 'GET') {
    // Fetch user profile
    $user->getById($user_id);
    $response_data = [
        'user' => [
            'id' => $user->id,
            'username' => $user->name, // Map name to username for frontend
            'email' => $user->email,
            'created_at' => $user->created_at,
        ],
    ];
    ApiResponse::success($response_data, "Profile retrieved successfully");
} elseif ($method === 'PUT') {
    // Update user profile or password
    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->username) && empty($data->email) && empty($data->password)) {
        ApiResponse::error("Please provide at least one field to update: username, email, or password", 400);
    }

    if (!empty($data->password)) {
        if (empty($data->current_password)) {
            ApiResponse::error("Current password is required to change password", 400);
        }
        if (empty($data->confirm_password) || $data->password !== $data->confirm_password) {
            ApiResponse::error("New passwords do not match", 400);
        }
        if (strlen($data->password) < PASSWORD_MIN_LENGTH) {
            ApiResponse::error("New password must be at least " . PASSWORD_MIN_LENGTH . " characters", 400);
        }
        $user->id = $user_id;
        if (!$user->verifyPassword($data->current_password)) {
            ApiResponse::error("Current password is incorrect", 400);
        }
        $user->password = password_hash($data->password, PASSWORD_BCRYPT, ['cost' => BCRYPT_COST]);
    }

    $updated = false;
    $query = "UPDATE " . $user->table_name . " SET ";
    $params = [];
    $fields = [];

    if (!empty($data->username)) {
        $user->name = htmlspecialchars(strip_tags($data->username));
        $fields[] = "name = :name";
        $params[':name'] = $user->name;
    }

    if (!empty($data->email)) {
        $user->email = htmlspecialchars(strip_tags($data->email));
        $fields[] = "email = :email";
        $params[':email'] = $user->email;
    }

    if (!empty($data->password)) {
        $fields[] = "password = :password";
        $params[':password'] = $user->password;
    }

    if (!empty($fields)) {
        $query .= implode(", ", $fields) . " WHERE id_client = :id_client";
        $params[':id_client'] = $user_id;

        $stmt = $db->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        if ($stmt->execute()) {
            $updated = true;
        }
    }

    if ($updated) {
        $user->getById($user_id);
        $response_data = [
            'user' => [
                'id' => $user->id,
                'username' => $user->name, // Map name to username for frontend
                'email' => $user->email,
                'created_at' => $user->created_at,
            ],
        ];
        ApiResponse::success($response_data, "Profile updated successfully");
    } else {
        ApiResponse::error("Failed to update profile", 500);
    }
} else {
    ApiResponse::error("Method not allowed", 405);
}
?>