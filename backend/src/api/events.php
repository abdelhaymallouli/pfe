<?php
// backend/src/api/events.php
ob_start();
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../controllers/EventController.php';

header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');

try {
    $database = new Database();
    $pdo = $database->getConnection();
    $controller = new EventController($pdo);
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            ob_clean();
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid JSON: ' . json_last_error_msg()
            ], JSON_THROW_ON_ERROR);
            exit;
        }

        $required = ['user_id', 'title', 'type', 'date', 'location', 'expectedGuests'];
        foreach ($required as $field) {
            if (!isset($input[$field]) || (is_string($input[$field]) && empty(trim($input[$field])))) {
                ob_clean();
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => "Field '$field' is required"
                ], JSON_THROW_ON_ERROR);
                exit;
            }
        }

        try {
            $newEventId = $controller->addEvent($input);
            if ($newEventId) {
                ob_clean();
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Event created successfully',
                    'id' => $newEventId
                ], JSON_THROW_ON_ERROR);
            } else {
                ob_clean();
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Failed to create event: Unknown error'
                ], JSON_THROW_ON_ERROR);
            }
        } catch (Exception $e) {
            error_log('Event creation failed: ' . $e->getMessage());
            ob_clean();
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to create event: ' . $e->getMessage()
            ], JSON_THROW_ON_ERROR);
        }
        exit;
    }

    ob_clean();
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ], JSON_THROW_ON_ERROR);

} catch (Exception $e) {
    error_log('Server error in events.php: ' . $e->getMessage());
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ], JSON_THROW_ON_ERROR);
}
exit;
?>