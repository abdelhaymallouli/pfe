<?php

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../controllers/EventController.php';

header('Content-Type: application/json');

// Create database connection instance
$database = new Database();
$pdo = $database->getConnection();

$controller = new EventController($pdo);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $events = $controller->getEvents();
    echo json_encode($events);
    exit;
}

if ($method === 'POST') {
    // Get the raw POST data (JSON)
    $input = json_decode(file_get_contents('php://input'), true);

    // Simple validation - check required fields (add more if needed)
    $required = ['title', 'type', 'date', 'location', 'expectedGuests'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['message' => "Field '$field' is required"]);
            exit;
        }
    }

    $newEventId = $controller->addEvent($input);

    if ($newEventId) {
        http_response_code(201);
        echo json_encode(['message' => 'Event created successfully', 'id' => $newEventId]);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Failed to create event']);
    }
    exit;
}

// For other methods
http_response_code(405);
echo json_encode(['message' => 'Method not allowed']);
exit;
