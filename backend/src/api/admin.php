<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../controllers/AdminController.php';
require_once __DIR__ . '/../../config/auth_config.php';

ob_start();
header('Content-Type: application/json');
ini_set('display_errors', 0);
error_reporting(E_ALL);

function authenticate() {
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authorization header missing']);
        exit;
    }
    $token = str_replace('Bearer ', '', $headers['Authorization']);
    $tokenParts = explode('.', $token);
    if (count($tokenParts) !== 3) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid token format']);
        exit;
    }
    list($header, $payload, $signature) = $tokenParts;
    $decodedHeader = base64_decode(str_replace(['-', '_'], ['+', '/'], $header));
    $decodedPayload = base64_decode(str_replace(['-', '_'], ['+', '/'], $payload));
    if ($decodedHeader === false || $decodedPayload === false) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid token encoding']);
        exit;
    }
    $headerData = json_decode($decodedHeader, true);
    $payloadData = json_decode($decodedPayload, true);
    if ($headerData === null || $payloadData === null) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid token JSON']);
        exit;
    }
    $expectedSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(hash_hmac('sha256', $header . '.' . $payload, JWT_SECRET, true)));
    if ($signature !== $expectedSignature) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid token signature']);
        exit;
    }
    if (isset($payloadData['exp']) && $payloadData['exp'] < time()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Token expired']);
        exit;
    }
    return $payloadData;
}

try {
    $database = new Database();
    $pdo = $database->getConnection();
    if (!$pdo) throw new Exception('Database connection failed');

    $controller = new AdminController($pdo);
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';

    if ($action === 'login' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || !isset($input['email']) || !isset($input['password'])) {
            throw new Exception('Email and password are required', 400);
        }
        $token = $controller->login($input['email'], $input['password']);
        echo json_encode(['success' => true, 'token' => $token]);
        exit;
    }

    if ($action === 'logout' && $method === 'POST') {
        $userData = authenticate();
        $result = $controller->logout($userData['admin_id']);
        echo json_encode(['success' => $result, 'message' => $result ? 'Logged out successfully' : 'Failed to logout']);
        exit;
    }

    $userData = authenticate();

    switch ($action) {
        case 'dashboard':
            if ($method === 'GET') {
                $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
                $data = $controller->getDashboardData($page, $limit);
                echo json_encode(['success' => true, 'data' => $data]);
            }
            break;

        case 'getUsers':
            if ($method === 'GET') {
                $clients = $controller->getAllClients();
                echo json_encode(['success' => true, 'data' => $clients]);
            }
            break;

        case 'getUser':
            if ($method === 'GET') {
                $id_client = $_GET['id_client'] ?? null;
                if (!$id_client) throw new Exception('Client ID is required', 400);
                $client = $controller->getClientById($id_client);
                echo json_encode(['success' => true, 'data' => $client]);
            }
            break;

        case 'addUser':
            if ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $id = $controller->addClient($input);
                echo json_encode(['success' => true, 'id' => $id, 'message' => 'User added successfully']);
            }
            break;

        case 'updateUser':
            if ($method === 'PUT') {
                $input = json_decode(file_get_contents('php://input'), true);
                $id_client = $input['id_client'] ?? null;
                if (!$id_client) throw new Exception('Client ID is required', 400);
                $result = $controller->updateClient($id_client, $input);
                echo json_encode(['success' => $result, 'message' => $result ? 'User updated successfully' : 'Failed to update user']);
            }
            break;

        case 'deleteUser':
            if ($method === 'DELETE') {
                $id_client = $_GET['id_client'] ?? null;
                if (!$id_client) throw new Exception('Client ID missing', 400);
                $result = $controller->deleteClient($id_client);
                echo json_encode(['success' => $result, 'message' => $result ? 'User deleted successfully' : 'Failed to delete user']);
            }
            break;

        case 'getEvents':
            if ($method === 'GET') {
                $events = $controller->getAllEvents();
                echo json_encode(['success' => true, 'data' => $events]);
            }
            break;

        case 'addEvent':
            if ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $id = $controller->addEvent($input);
                echo json_encode(['success' => true, 'id' => $id, 'message' => 'Event added successfully']);
            }
            break;

        case 'updateEvent':
            if ($method === 'PUT') {
                $input = json_decode(file_get_contents('php://input'), true);
                $id_event = $input['id_event'] ?? null;
                if (!$id_event) throw new Exception('Event ID is required', 400);
                $result = $controller->updateEvent($id_event, $input);
                echo json_encode(['success' => $result, 'message' => $result ? 'Event updated successfully' : 'Failed to update event']);
            }
            break;

        case 'deleteEvent':
            if ($method === 'DELETE') {
                $id_event = $_GET['id_event'] ?? null;
                if (!$id_event) throw new Exception('Event ID is required', 400);
                $result = $controller->deleteEvent($id_event);
                echo json_encode(['success' => $result, 'message' => $result ? 'Event deleted successfully' : 'Failed to delete event']);
            }
            break;

        case 'getVendorsWithPrices':
            if ($method === 'GET') {
                $vendors = $controller->getAllVendorsWithPrices();
                echo json_encode(['success' => true, 'data' => $vendors]);
            }
            break;

        case 'getVendor':
            if ($method === 'GET') {
                $id_vendor = $_GET['id_vendor'] ?? null;
                if (!$id_vendor) throw new Exception('Vendor ID is required', 400);
                $vendor = $controller->getVendorById($id_vendor);
                echo json_encode(['success' => true, 'data' => $vendor]);
            }
            break;

        case 'addVendor':
            if ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $id = $controller->addVendor($input);
                echo json_encode(['success' => true, 'id' => $id, 'message' => 'Vendor added successfully']);
            }
            break;

        case 'updateVendor':
            if ($method === 'PUT') {
                $input = json_decode(file_get_contents('php://input'), true);
                $id_vendor = $input['id_vendor'] ?? null;
                if (!$id_vendor) throw new Exception('Vendor ID is required', 400);
                $result = $controller->updateVendor($id_vendor, $input);
                echo json_encode(['success' => $result, 'message' => $result ? 'Vendor updated successfully' : 'Failed to update vendor']);
            }
            break;

        case 'deleteVendor':
            if ($method === 'DELETE') {
                $input = json_decode(file_get_contents('php://input'), true);
                $id_vendor = $input['id_vendor'] ?? null;
                if (!$id_vendor) throw new Exception('Vendor ID is required', 400);
                $result = $controller->deleteVendor($id_vendor);
                echo json_encode(['success' => $result, 'message' => $result ? 'Vendor deleted successfully' : 'Failed to delete vendor']);
            }
            break;

        case 'getTypes':
            if ($method === 'GET') {
                $types = $controller->getAllTypes();
                echo json_encode(['success' => true, 'data' => $types]);
            }
            break;

        case 'getRequests':
            if ($method === 'GET') {
                $requests = $controller->getAllRequests();
                echo json_encode(['success' => true, 'data' => $requests]);
            }
            break;

        case 'addRequest':
            if ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $id = $controller->addRequest($input);
                echo json_encode(['success' => true, 'id' => $id, 'message' => 'Request added successfully']);
            }
            break;

        case 'updateRequest':
            if ($method === 'PUT') {
                $input = json_decode(file_get_contents('php://input'), true);
                $id_request = $input['id_request'] ?? null;
                if (!$id_request) throw new Exception('Request ID is required', 400);
                $result = $controller->updateRequest($id_request, $input);
                echo json_encode(['success' => $result, 'message' => $result ? 'Request updated successfully' : 'Failed to update request']);
            }
            break;

        case 'updateRequestStatus':
            if ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $id_request = $input['id_request'] ?? null;
                $status = $input['status'] ?? null;
                if (!$id_request || !$status) throw new Exception('Request ID and status are required', 400);
                $result = $controller->updateRequestStatus($id_request, $status);
                echo json_encode(['success' => $result, 'message' => $result ? 'Request status updated successfully' : 'Failed to update request status']);
            }
            break;

        case 'deleteRequest':
            if ($method === 'DELETE') {
                $id_request = $_GET['id_request'] ?? null;
                if (!$id_request) throw new Exception('Request ID is required', 400);
                $result = $controller->deleteRequest($id_request);
                echo json_encode(['success' => $result, 'message' => $result ? 'Request deleted successfully' : 'Failed to delete request']);
            }
            break;

        case 'getAnalytics':
            if ($method === 'GET') {
                $analytics = $controller->getAnalyticsData();
                echo json_encode(['success' => true, 'data' => $analytics]);
            }
            break;

        case 'createBackup':
            if ($method === 'POST') {
                $backup = $controller->createBackup();
                header('Content-Type: application/octet-stream');
                header('Content-Disposition: attachment; filename="' . $backup['filename'] . '"');
                header('Content-Length: ' . $backup['size']);
                ob_clean();
                readfile($backup['filepath']);
                unlink($backup['filepath']);
                exit;
            }
            break;

        default:
            throw new Exception('Invalid action', 400);
    }
} catch (Exception $e) {
    $code = $e->getCode() ?: 500;
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $e->getMessage(), 'code' => $code]);
} finally {
    ob_end_flush();
}
?>