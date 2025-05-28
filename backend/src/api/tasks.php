<?php
// backend/src/api/tasks.php
ob_start();
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../controllers/TaskController.php';

header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');

try {
    $database = new Database();
    $pdo = $database->getConnection();
    $controller = new TaskController($pdo);
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        if (isset($_GET['id']) && is_numeric($_GET['id'])) {
            $task = $controller->getTaskById((int)$_GET['id']);
            ob_clean();
            if ($task) {
                http_response_code(200);
                echo json_encode(['success' => true, 'data' => $task], JSON_THROW_ON_ERROR);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Task not found'], JSON_THROW_ON_ERROR);
            }
        } elseif (isset($_GET['event_id']) && is_numeric($_GET['event_id'])) {
            $tasks = $controller->getTasksByEventId((int)$_GET['event_id']);
            ob_clean();
            http_response_code(200);
            echo json_encode(['success' => true, 'data' => $tasks], JSON_THROW_ON_ERROR);
        } else {
            $tasks = $controller->getTasks();
            ob_clean();
            http_response_code(200);
            echo json_encode(['success' => true, 'data' => $tasks], JSON_THROW_ON_ERROR);
        }
        exit;
    }

    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            ob_clean();
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON'], JSON_THROW_ON_ERROR);
            exit;
        }

        $required = ['eventId', 'title', 'dueDate', 'priority', 'status', 'category'];
        foreach ($required as $field) {
            if (!isset($input[$field]) || (is_string($input[$field]) && empty(trim($input[$field])))) {
                ob_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => "Field '$field' is required"], JSON_THROW_ON_ERROR);
                exit;
            }
        }

        $taskId = $controller->addTask($input);
        ob_clean();
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Task created', 'id' => $taskId], JSON_THROW_ON_ERROR);
        exit;
    }

    if ($method === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            ob_clean();
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON'], JSON_THROW_ON_ERROR);
            exit;
        }

        if (!isset($input['id']) || !is_numeric($input['id'])) {
            ob_clean();
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Task ID required'], JSON_THROW_ON_ERROR);
            exit;
        }

        $controller->updateTask($input);
        ob_clean();
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Task updated'], JSON_THROW_ON_ERROR);
        exit;
    }

    if ($method === 'DELETE') {
        if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
            ob_clean();
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Task ID required'], JSON_THROW_ON_ERROR);
            exit;
        }

        $controller->deleteTask((int)$_GET['id']);
        ob_clean();
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Task deleted'], JSON_THROW_ON_ERROR);
        exit;
    }

    ob_clean();
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed'], JSON_THROW_ON_ERROR);

} catch (Exception $e) {
    error_log('Error in tasks.php: ' . $e->getMessage());
    ob_clean();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()], JSON_THROW_ON_ERROR);
}
exit;
?>