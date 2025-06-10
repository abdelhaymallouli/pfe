<?php
// backend/src/api/admin.php
require_once __DIR__ . 
'/../../config/cors.php';
require_once __DIR__ . 
'/../../config/database.php';
require_once __DIR__ . 
'/../controllers/AdminController.php';
require_once __DIR__ . 
'/../../config/auth_config.php';

// Start output buffering
ob_start();

// Set JSON content type
header('Content-Type: application/json');

// Disable displaying errors to prevent JSON corruption
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Authentication middleware
function authenticate() {
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        error_log('Authentication Error: Authorization header missing');
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authorization header missing']);
        exit;
    }
    $token = str_replace('Bearer ', '', $headers['Authorization']);

    // JWT Validation
    $tokenParts = explode('.', $token);
    if (count($tokenParts) !== 3) {
        error_log('Authentication Error: Invalid token format - ' . $token);
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid token format']);
        exit;
    }
    list($header, $payload, $signature) = $tokenParts;

    // Decode header and payload
    $decodedHeader = base64_decode(str_replace(['-', '_'], ['+', '/'], $header));
    $decodedPayload = base64_decode(str_replace(['-', '_'], ['+', '/'], $payload));

    if ($decodedHeader === false || $decodedPayload === false) {
        error_log('Authentication Error: Base64 decode failed for header or payload');
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid token encoding']);
        exit;
    }

    $headerData = json_decode($decodedHeader, true);
    $payloadData = json_decode($decodedPayload, true);

    if ($headerData === null || $payloadData === null) {
        error_log('Authentication Error: JSON decode failed for header or payload');
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid token JSON']);
        exit;
    }

    // Calculate expected signature
    $expectedSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(hash_hmac('sha256', $header . "." . $payload, JWT_SECRET, true)));

    if ($signature !== $expectedSignature) {
        error_log('Authentication Error: Invalid token signature. Expected: ' . $expectedSignature . ' Got: ' . $signature);
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid token signature']);
        exit;
    }

    // Check token expiration
    if (isset($payloadData['exp']) && $payloadData['exp'] < time()) {
        error_log('Authentication Error: Token expired. Expiration: ' . date('Y-m-d H:i:s', $payloadData['exp']) . ' Current: ' . date('Y-m-d H:i:s'));
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Token expired']);
        exit;
    }

    return $payloadData;
}

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    if (!$pdo) {
        throw new Exception('Database connection failed');
    }

    $controller = new AdminController($pdo);
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';

    // Handle login separately (no authentication required)
    if ($action === 'login' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || !isset($input['email']) || !isset($input['password'])) {
            throw new Exception('Email and password are required', 400);
        }
        
        $token = $controller->login($input['email'], $input['password']);
        echo json_encode(['success' => true, 'token' => $token]);
        exit;
    }

    // All other endpoints require authentication
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

        // Client Management
        case 'getUsers': // Renamed from getClients for clarity
            if ($method === 'GET') {
                $clients = $controller->getAllClients();
                echo json_encode(['success' => true, 'data' => $clients]);
            }
            break;

        case 'getUser': // New action to get a single user by ID
            if ($method === 'GET') {
                $id_client = $_GET['id_client'] ?? null;
                if (!$id_client) {
                    throw new Exception('Client ID is required', 400);
                }
                $client = $controller->getClientById($id_client);
                echo json_encode(['success' => true, 'data' => $client]);
            }
            break;

        case 'addUser': // Renamed from addClient
            if ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $id = $controller->addClient($input);
                echo json_encode(['success' => true, 'id' => $id, 'message' => 'User added successfully']);
            }
            break;

        case 'updateUser': // Renamed from updateClient
            if ($method === 'PUT') {
                $input = json_decode(file_get_contents('php://input'), true);
                $id_client = $input['id_client'] ?? null;
                if (!$id_client) {
                    throw new Exception('Client ID is required', 400);
                }
                $result = $controller->updateClient($id_client, $input);
                echo json_encode(['success' => $result, 'message' => $result ? 'User updated successfully' : 'Failed to update user']);
            }
            break;

        case 'deleteUser': // Renamed from deleteClient
            if ($method === 'DELETE') {
                $id_client = $_GET['id_client'] ?? null; // Changed to GET parameter for simplicity
                if (!$id_client) {
                    throw new Exception('Client ID is required', 400);
                }
                $result = $controller->deleteClient($id_client);
                echo json_encode(['success' => $result, 'message' => $result ? 'User deleted successfully' : 'Failed to delete user']);
            }
            break;

        // Event Management
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
                if (!$id_event) {
                    throw new Exception('Event ID is required', 400);
                }
                $result = $controller->updateEvent($id_event, $input);
                echo json_encode(['success' => $result, 'message' => $result ? 'Event updated successfully' : 'Failed to update event']);
            }
            break;

        case 'deleteEvent':
            if ($method === 'DELETE') {
                $input = json_decode(file_get_contents('php://input'), true);
                $id_event = $input['id_event'] ?? null;
                if (!$id_event) {
                    throw new Exception('Event ID is required', 400);
                }
                $result = $controller->deleteEvent($id_event);
                echo json_encode(['success' => $result, 'message' => $result ? 'Event deleted successfully' : 'Failed to delete event']);
            }
            break;

        // Vendor Management
        case 'getVendors':
            if ($method === 'GET') {
                $vendors = $controller->getAllVendors();
                echo json_encode(['success' => true, 'data' => $vendors]);
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
                if (!$id_vendor) {
                    throw new Exception('Vendor ID is required', 400);
                }
                $result = $controller->updateVendor($id_vendor, $input);
                echo json_encode(['success' => $result, 'message' => $result ? 'Vendor updated successfully' : 'Failed to update vendor']);
            }
            break;

        case 'deleteVendor':
            if ($method === 'DELETE') {
                $input = json_decode(file_get_contents('php://input'), true);
                $id_vendor = $input['id_vendor'] ?? null;
                if (!$id_vendor) {
                    throw new Exception('Vendor ID is required', 400);
                }
                $result = $controller->deleteVendor($id_vendor);
                echo json_encode(['success' => $result, 'message' => $result ? 'Vendor deleted successfully' : 'Failed to delete vendor']);
            }
            break;

        // Category Management (Types)
        case 'getTypes':
            if ($method === 'GET') {
                $types = $controller->getAllTypes();
                echo json_encode(['success' => true, 'data' => $types]);
            }
            break;

        case 'addType':
            if ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $id = $controller->addType($input);
                echo json_encode(['success' => true, 'id' => $id, 'message' => 'Category added successfully']);
            }
            break;

        case 'updateType':
            if ($method === 'PUT') {
                $input = json_decode(file_get_contents('php://input'), true);
                $id_type = $input['id_type'] ?? null;
                if (!$id_type) {
                    throw new Exception('Category ID is required', 400);
                }
                $result = $controller->updateType($id_type, $input);
                echo json_encode(['success' => $result, 'message' => $result ? 'Category updated successfully' : 'Failed to update category']);
            }
            break;

        case 'deleteType':
            if ($method === 'DELETE') {
                $input = json_decode(file_get_contents('php://input'), true);
                $id_type = $input['id_type'] ?? null;
                if (!$id_type) {
                    throw new Exception('Category ID is required', 400);
                }
                $result = $controller->deleteType($id_type);
                echo json_encode(['success' => $result, 'message' => $result ? 'Category deleted successfully' : 'Failed to delete category']);
            }
            break;

        // Request Management
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
                if (!$id_request) {
                    throw new Exception('Request ID is required', 400);
                }
                $result = $controller->updateRequest($id_request, $input);
                echo json_encode(['success' => $result, 'message' => $result ? 'Request updated successfully' : 'Failed to update request']);
            }
            break;

        case 'updateRequestStatus':
            if ($method === 'PUT') {
                $input = json_decode(file_get_contents('php://input'), true);
                $id_request = $input['id_request'] ?? null;
                $status = $input['status'] ?? null;
                if (!$id_request || !$status) {
                    throw new Exception('Request ID and status are required', 400);
                }
                $result = $controller->updateRequestStatus($id_request, $status);
                echo json_encode(['success' => $result, 'message' => $result ? 'Request status updated successfully' : 'Failed to update request status']);
            }
            break;

        case 'deleteRequest':
            if ($method === 'DELETE') {
                $id_request = $_GET['id_request'] ?? null; // Changed to GET parameter for simplicity
                if (!$id_request) {
                    throw new Exception('Request ID is required', 400);
                }
                $result = $controller->deleteRequest($id_request);
                echo json_encode(['success' => $result, 'message' => $result ? 'Request deleted successfully' : 'Failed to delete request']);
            }
            break;

        // Analytics
        case 'getAnalytics':
            if ($method === 'GET') {
                $analytics = $controller->getAnalyticsData();
                echo json_encode(['success' => true, 'data' => $analytics]);
            }
            break;

        // Backup
        case 'createBackup':
            if ($method === 'POST') {
                $backup = $controller->createBackup();
                
                // Set headers for file download
                header('Content-Type: application/octet-stream');
                header('Content-Disposition: attachment; filename="' . $backup['filename'] . '"');
                header('Content-Length: ' . $backup['size']);
                
                // Clear any previous output
                ob_clean();
                
                // Output the file
                readfile($backup['filepath']);
                
                // Clean up the temporary file
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
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'code' => $code
    ]);
} finally {
    // Clean output buffer
    ob_end_flush();
}
?>

