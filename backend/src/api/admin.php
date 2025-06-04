<?php
// backend/src/api/admin.php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../controllers/AdminController.php';

// Start output buffering
ob_start();

// Set JSON content type
header('Content-Type: application/json');

// Disable displaying errors to prevent JSON corruption
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

// Authentication middleware
function authenticate() {
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authorization header missing']);
        exit;
    }
    $token = str_replace('Bearer ', '', $headers['Authorization']);
    // Simple token validation (replace with your auth logic, e.g., JWT)
    if ($token !== 'your_secure_token') { // Replace with actual token validation
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid token']);
        exit;
    }
}

try {
    // Initialize database connection
    $database = new Database();
    $pdo = $database->getConnection();
    
    if (!$pdo) {
        throw new Exception('Failed to connect to the database');
    }

    $controller = new AdminController($pdo);
    $method = $_SERVER['REQUEST_METHOD'];

    // Apply authentication for all routes except login
    if (!isset($_GET['action']) || $_GET['action'] !== 'login') {
        authenticate();
    }

    // Handle GET requests
    if ($method === 'GET') {
        if (isset($_GET['action']) && $_GET['action'] === 'get_admins') {
            $data = $controller->getAdmins();
            echo json_encode(['success' => true, 'data' => $data]);
            exit;
        } elseif (isset($_GET['action']) && $_GET['action'] === 'dashboard') {
            $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
            $limit = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : 10;
            $data = $controller->getDashboardData($page, $limit);
            echo json_encode(['success' => true, 'data' => $data, 'page' => $page, 'limit' => $limit]);
            exit;
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
            exit;
        }
    }

    // Handle POST request for login
    if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'login') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE || !isset($input['email'], $input['password'])) {
            throw new Exception('Invalid JSON input or email/password missing');
        }
        $token = $controller->login($input['email'], $input['password']);
        echo json_encode(['success' => true, 'token' => $token]);
        exit;
    }

    // Handle POST request for adding vendor
    if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'add_vendor') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON input: ' . json_last_error_msg());
        }
        // Validate input
        if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Invalid email format');
        }
        if (isset($input['note']) && ($input['note'] < 0 || $input['note'] > 5)) {
            throw new Exception('Rating must be between 0 and 5');
        }
        $id = $controller->addVendor($input);
        http_response_code(201);
        echo json_encode(['success' => true, 'data' => ['id_vendor' => $id]]);
        exit;
    }

    // Handle PUT request for updating vendor
    if ($method === 'PUT' && isset($_GET['action']) && $_GET['action'] === 'update_vendor') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE || !isset($_GET['id_vendor'])) {
            throw new Exception('Invalid JSON input or id_vendor required');
        }
        if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Invalid email format');
        }
        if (isset($input['note']) && ($input['note'] < 0 || $input['note'] > 5)) {
            throw new Exception('Rating must be between 0 and 5');
        }
        $controller->updateVendor($_GET['id_vendor'], $input);
        echo json_encode(['success' => true, 'message' => 'Vendor updated']);
        exit;
    }

    // Handle DELETE request for deleting vendor
    if ($method === 'DELETE' && isset($_GET['action']) && $_GET['action'] === 'delete_vendor') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE || !isset($input['id_vendor'])) {
            throw new Exception('Invalid JSON input or id_vendor required');
        }
        $controller->deleteVendor($input['id_vendor']);
        echo json_encode(['success' => true, 'message' => 'Vendor deleted']);
        exit;
    }

    // Handle unsupported methods
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
} catch (Exception $e) {
    // Clear any stray output
    ob_clean();
    http_response_code($e->getCode() ?: 500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

// Flush output buffer
ob_end_flush();
?>