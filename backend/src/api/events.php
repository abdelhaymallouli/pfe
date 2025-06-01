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

    if ($method === 'GET') {
        if (isset($_GET['id']) && is_numeric($_GET['id'])) {
            $event = $controller->getEventById((int)$_GET['id']);
            ob_clean();
            if ($event) {
                http_response_code(200);
                $event['budget'] = (float)$event['budget'];
                $event['id_type'] = (int)$event['id_type'];
                echo json_encode([
                    'success' => true,
                    'data' => $event
                ], JSON_THROW_ON_ERROR);
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Event not found'
                ], JSON_THROW_ON_ERROR);
            }
            exit;
        }

        // Handle user-specific events
        if (isset($_GET['userId']) && is_numeric($_GET['userId'])) {
            $userId = (int)$_GET['userId'];
            $events = $controller->getEventsByUserId($userId); // New method to filter by user
            ob_clean();
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => array_map(function($event) {
                    $event['budget'] = (float)$event['budget'];
                    $event['id_type'] = (int)$event['id_type'];
                    return $event;
                }, $events)
            ], JSON_THROW_ON_ERROR);
            exit;
        } else {
            ob_clean();
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'userId parameter is required'
            ], JSON_THROW_ON_ERROR);
            exit;
        }
    }

    if ($method === 'POST') {
        $rawInput = file_get_contents('php://input');
        error_log("Raw POST input: " . $rawInput);
        
        $input = json_decode($rawInput, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            ob_clean();
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid JSON: ' . json_last_error_msg()
            ], JSON_THROW_ON_ERROR);
            exit;
        }

        error_log("Parsed POST input: " . json_encode($input));

        $required = ['user_id', 'title', 'type_id', 'date', 'location', 'expected_guests'];
        foreach ($required as $field) {
            if (!isset($input[$field])) {
                ob_clean();
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => "Field '$field' is missing"
                ], JSON_THROW_ON_ERROR);
                exit;
            }
            if (in_array($field, ['title', 'location']) && is_string($input[$field]) && empty(trim($input[$field]))) {
                ob_clean();
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => "Field '$field' cannot be empty"
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
            error_log('Stack trace: ' . $e->getTraceAsString());
            ob_clean();
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to create event: ' . $e->getMessage()
            ], JSON_THROW_ON_ERROR);
        }
        exit;
    }

    if ($method === 'PUT') {
        $rawInput = file_get_contents('php://input');
        error_log("Raw PUT input: " . $rawInput);
        
        $input = json_decode($rawInput, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            ob_clean();
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid JSON: ' . json_last_error_msg()
            ], JSON_THROW_ON_ERROR);
            exit;
        }

        error_log("Parsed PUT input: " . json_encode($input));

        $required = ['id', 'user_id', 'title', 'type_id', 'date', 'location', 'expected_guests'];
        foreach ($required as $field) {
            if (!isset($input[$field])) {
                ob_clean();
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => "Field '$field' is missing"
                ], JSON_THROW_ON_ERROR);
                exit;
            }
            if (in_array($field, ['title', 'location']) && is_string($input[$field]) && empty(trim($input[$field]))) {
                ob_clean();
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => "Field '$field' cannot be empty"
                ], JSON_THROW_ON_ERROR);
                exit;
            }
        }

        try {
            $controller->updateEvent($input);
            ob_clean();
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Event updated successfully'
            ], JSON_THROW_ON_ERROR);
        } catch (Exception $e) {
            error_log('Event update failed: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            ob_clean();
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to update event: ' . $e->getMessage()
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
    error_log('Stack trace: ' . $e->getTraceAsString());
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ], JSON_THROW_ON_ERROR);
}
ob_end_flush();
?>