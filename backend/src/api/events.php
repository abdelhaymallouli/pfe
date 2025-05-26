<?php
// Prevent any output before headers
ob_start();

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../controllers/EventController.php';

// Set content type first
header('Content-Type: application/json');

try {
    // Create database connection instance
    $database = new Database();
    $pdo = $database->getConnection();
    
    $controller = new EventController($pdo);
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'GET') {
        $events = $controller->getEvents();
        
        // Clean any output buffer and send JSON
        ob_clean();
        echo json_encode([
            'success' => true,
            'data' => $events
        ]);
        exit;
    }
    
    if ($method === 'POST') {
        // Get the raw POST data (JSON)
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Check if JSON decode was successful
        if (json_last_error() !== JSON_ERROR_NONE) {
            ob_clean();
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid JSON data'
            ]);
            exit;
        }
        
        // Simple validation - check required fields
        $required = ['title', 'type', 'date', 'location', 'expectedGuests'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                ob_clean();
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => "Field '$field' is required"
                ]);
                exit;
            }
        }
        
        $newEventId = $controller->addEvent($input);
        
        if ($newEventId) {
            ob_clean();
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Event created successfully',
                'id' => $newEventId
            ]);
        } else {
            ob_clean();
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to create event'
            ]);
        }
        exit;
    }
    
    // For other methods
    ob_clean();
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    
} catch (Exception $e) {
    // Handle any exceptions
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}

exit;
?>