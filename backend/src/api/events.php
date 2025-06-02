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
                $event['id_client'] = (int)$event['id_client'];
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

        if (isset($_GET['id_client']) && is_numeric($_GET['id_client'])) {
            $id_client = (int)$_GET['id_client'];
            $events = $controller->getEventsByClientId($id_client);
            ob_clean();
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => array_map(function($event) {
                    $event['budget'] = (float)$event['budget'];
                    $event['id_type'] = (int)$event['id_type'];
                    $event['id_client'] = (int)$event['id_client'];
                    return $event;
                }, $events)
            ], JSON_THROW_ON_ERROR);
            exit;
        }

        ob_clean();
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'id_client parameter is required'
        ], JSON_THROW_ON_ERROR);
        exit;
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

        $required = ['id_client', 'title', 'id_type', 'event_date', 'location', 'expected_guests'];
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

        // Validate event_date format (YYYY-MM-DD)
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $input['event_date']) || !strtotime($input['event_date'])) {
            ob_clean();
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid event_date format, expected YYYY-MM-DD'
            ], JSON_THROW_ON_ERROR);
            exit;
        }

        // Validate status if provided
        if (isset($input['status']) && !in_array($input['status'], ['Planned', 'Ongoing', 'Completed', 'Cancelled'])) {
            ob_clean();
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid status value'
            ], JSON_THROW_ON_ERROR);
            exit;
        }

        // Validate requests if provided
        if (isset($input['requests']) && is_array($input['requests'])) {
            foreach ($input['requests'] as $request) {
                if (!isset($request['title']) || empty(trim($request['title']))) {
                    ob_clean();
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Request title is required'
                    ], JSON_THROW_ON_ERROR);
                    exit;
                }
                if (isset($request['amount']) && (!is_numeric($request['amount']) || $request['amount'] <= 0)) {
                    ob_clean();
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Request amount must be a positive number'
                    ], JSON_THROW_ON_ERROR);
                    exit;
                }
                if (isset($request['id_vendor']) && !is_numeric($request['id_vendor'])) {
                    ob_clean();
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Request id_vendor must be numeric'
                    ], JSON_THROW_ON_ERROR);
                    exit;
                }
                if (isset($request['deadline']) && (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $request['deadline']) || !strtotime($request['deadline']))) {
                    ob_clean();
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Invalid request deadline format, expected YYYY-MM-DD'
                    ], JSON_THROW_ON_ERROR);
                    exit;
                }
                if (isset($request['status']) && !in_array($request['status'], ['Open', 'In Progress', 'Completed', 'Cancelled'])) {
                    ob_clean();
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Invalid request status value'
                    ], JSON_THROW_ON_ERROR);
                    exit;
                }
            }
        }

        try {
            $newEventId = $controller->addEvent($input);
            ob_clean();
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Event created successfully',
                'id' => $newEventId
            ], JSON_THROW_ON_ERROR);
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

        if (!isset($input['id']) || !is_numeric($input['id'])) {
            ob_clean();
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Event ID is required and must be numeric'
            ], JSON_THROW_ON_ERROR);
            exit;
        }

        // Validate event_date format if provided
        if (isset($input['event_date']) && (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $input['event_date']) || !strtotime($input['event_date']))) {
            ob_clean();
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid event_date format, expected YYYY-MM-DD'
            ], JSON_THROW_ON_ERROR);
            exit;
        }

        // Validate status if provided
        if (isset($input['status']) && !in_array($input['status'], ['Planned', 'Ongoing', 'Completed', 'Cancelled'])) {
            ob_clean();
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid status value'
            ], JSON_THROW_ON_ERROR);
            exit;
        }

        // Validate requests if provided
        if (isset($input['requests']) && is_array($input['requests'])) {
            foreach ($input['requests'] as $request) {
                if (!isset($request['id_request']) || !is_numeric($request['id_request'])) {
                    ob_clean();
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Request ID is required and must be numeric'
                    ], JSON_THROW_ON_ERROR);
                    exit;
                }
                if (!isset($request['title']) || empty(trim($request['title']))) {
                    ob_clean();
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Request title is required'
                    ], JSON_THROW_ON_ERROR);
                    exit;
                }
                if (isset($request['amount']) && (!is_numeric($request['amount']) || $request['amount'] <= 0)) {
                    ob_clean();
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Request amount must be a positive number'
                    ], JSON_THROW_ON_ERROR);
                    exit;
                }
                if (isset($request['id_vendor']) && !is_numeric($request['id_vendor'])) {
                    ob_clean();
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Request id_vendor must be numeric'
                    ], JSON_THROW_ON_ERROR);
                    exit;
                }
                if (isset($request['deadline']) && (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $request['deadline']) || !strtotime($request['deadline']))) {
                    ob_clean();
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Invalid request deadline format, expected YYYY-MM-DD'
                    ], JSON_THROW_ON_ERROR);
                    exit;
                }
                if (isset($request['status']) && !in_array($request['status'], ['Open', 'In Progress', 'Completed', 'Cancelled'])) {
                    ob_clean();
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Invalid request status value'
                    ], JSON_THROW_ON_ERROR);
                    exit;
                }
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

    if ($method === 'DELETE') {
        if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
            ob_clean();
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Event ID is required and must be numeric'
            ], JSON_THROW_ON_ERROR);
            exit;
        }

        try {
            $controller->deleteEvent((int)$_GET['id']);
            ob_clean();
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Event deleted successfully'
            ], JSON_THROW_ON_ERROR);
        } catch (Exception $e) {
            error_log('Event deletion failed: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            ob_clean();
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to delete event: ' . $e->getMessage()
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