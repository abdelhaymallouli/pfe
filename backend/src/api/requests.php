<?php
// backend/src/api/requests.php
ob_start();
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../controllers/RequestController.php';

header('Content-Type: application/json; charset=UTF-8');

try {
    $database = new Database();
    $pdo = $database->getConnection();
    $controller = new RequestController($pdo);
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            if (!isset($_GET['id_event']) || !is_numeric($_GET['id_event'])) {
                ob_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid or missing event ID']);
                exit;
            }
            $id_event = (int)$_GET['id_event'];
            $id_client = isset($_GET['id_client']) && is_numeric($_GET['id_client']) ? (int)$_GET['id_client'] : null;
            error_log("Fetching requests for id_event: $id_event" . ($id_client ? " and id_client: $id_client" : ""));

            // Verify event ownership if id_client is provided
            if ($id_client !== null) {
                $sql = "SELECT id_event FROM event WHERE id_event = :id_event AND id_client = :id_client";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([':id_event' => $id_event, ':id_client' => $id_client]);
                if (!$stmt->fetch()) {
                    ob_clean();
                    http_response_code(403);
                    echo json_encode(['success' => false, 'message' => 'Event does not belong to the client']);
                    exit;
                }
            }
            $requests = $controller->getRequestsByEventId($id_event);
            ob_clean();
            http_response_code(200);
            echo json_encode(['success' => true, 'data' => $requests], JSON_THROW_ON_ERROR);
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                ob_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid JSON: ' . json_last_error_msg()]);
                exit;
            }
            $required = ['id_event', 'title', 'amount', 'id_client'];
            foreach ($required as $field) {
                if (!isset($input[$field]) || (is_string($input[$field]) && empty(trim($input[$field])))) {
                    ob_clean();
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => "Missing or empty required field: $field"]);
                    exit;
                }
            }
            if (!is_numeric($input['id_event']) || !is_numeric($input['amount']) || !is_numeric($input['id_client'])) {
                ob_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'id_event, amount, and id_client must be numeric']);
                exit;
            }
            if (isset($input['id_vendor']) && !is_numeric($input['id_vendor'])) {
                ob_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'id_vendor must be numeric']);
                exit;
            }
            if (isset($input['deadline']) && (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $input['deadline']) || !strtotime($input['deadline']))) {
                ob_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid deadline format, expected YYYY-MM-DD']);
                exit;
            }
            if (isset($input['status']) && !in_array($input['status'], ['Open', 'In Progress', 'Completed', 'Cancelled'])) {
                ob_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid status value']);
                exit;
            }
            // Verify event ownership
            $sql = "SELECT id_event FROM event WHERE id_event = :id_event AND id_client = :id_client";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':id_event' => (int)$input['id_event'], ':id_client' => (int)$input['id_client']]);
            if (!$stmt->fetch()) {
                ob_clean();
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Event does not belong to the client']);
                exit;
            }
            try {
                $request_id = $controller->addTransactionAndRequest($input);
                ob_clean();
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'id_request' => $request_id,
                    'message' => 'Request created successfully'
                ], JSON_THROW_ON_ERROR);
            } catch (Exception $e) {
                error_log("Request creation failed: " . $e->getMessage());
                ob_clean();
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to create request: ' . $e->getMessage()]);
            }
            break;

        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                ob_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid JSON: ' . json_last_error_msg()]);
                exit;
            }
            $required = ['id_request', 'id_event', 'id_client'];
            foreach ($required as $field) {
                if (!isset($input[$field])) {
                    ob_clean();
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
                    exit;
                }
            }
            if (!is_numeric($input['id_request']) || !is_numeric($input['id_event']) || !is_numeric($input['id_client'])) {
                ob_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'id_request, id_event, and id_client must be numeric']);
                exit;
            }
            if (isset($input['amount']) && (!is_numeric($input['amount']) || $input['amount'] <= 0)) {
                ob_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'amount must be a positive number']);
                exit;
            }
            if (isset($input['id_vendor']) && !is_numeric($input['id_vendor'])) {
                ob_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'id_vendor must be numeric']);
                exit;
            }
            if (isset($input['deadline']) && (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $input['deadline']) || !strtotime($input['deadline']))) {
                ob_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid deadline format, expected YYYY-MM-DD']);
                exit;
            }
            if (isset($input['status']) && !in_array($input['status'], ['Open', 'In Progress', 'Completed', 'Cancelled'])) {
                ob_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid status value']);
                exit;
            }
            // Verify event ownership
            $sql = "SELECT id_event FROM event WHERE id_event = :id_event AND id_client = :id_client";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':id_event' => (int)$input['id_event'], ':id_client' => (int)$input['id_client']]);
            if (!$stmt->fetch()) {
                ob_clean();
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Event does not belong to the client']);
                exit;
            }
            try {
                $controller->updateRequest($input);
                ob_clean();
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Request updated successfully'
                ], JSON_THROW_ON_ERROR);
            } catch (Exception $e) {
                error_log("Request update failed for ID {$input['id_request']}: " . $e->getMessage());
                ob_clean();
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to update request: ' . $e->getMessage()]);
            }
            break;

        case 'DELETE':
            if (!isset($_GET['id_request']) || !is_numeric($_GET['id_request']) || !isset($_GET['id_event']) || !is_numeric($_GET['id_event']) || !isset($_GET['id_client']) || !is_numeric($_GET['id_client'])) {
                ob_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid or missing id_request, id_event, or id_client']);
                exit;
            }
            $id_request = (int)$_GET['id_request'];
            $id_event = (int)$_GET['id_event'];
            $id_client = (int)$_GET['id_client'];
            // Verify event ownership
            $sql = "SELECT id_event FROM event WHERE id_event = :id_event AND id_client = :id_client";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':id_event' => $id_event, ':id_client' => $id_client]);
            if (!$stmt->fetch()) {
                ob_clean();
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Event does not belong to the client']);
                exit;
            }
            try {
                $controller->deleteRequest($id_request, $id_event);
                ob_clean();
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Request deleted successfully'
                ], JSON_THROW_ON_ERROR);
            } catch (Exception $e) {
                error_log("Request deletion failed for ID $id_request: " . $e->getMessage());
                ob_clean();
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to delete request: ' . $e->getMessage()]);
            }
            break;

        default:
            ob_clean();
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    error_log("Server error in requests.php: " . $e->getMessage());
    ob_clean();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
ob_end_flush();
?>