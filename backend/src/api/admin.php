<?php
// backend/src/api/admin.php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../controllers/AdminController.php';

ob_start();
ini_set('display_errors', 0);
error_reporting(E_ALL);
header('Content-Type: application/json');

try {
    $database = new Database();
    $pdo = $database->getConnection();
    $controller = new AdminController($pdo);
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET' && isset($_GET['action']) && $_GET['action'] === 'get_admins') {
        $data = $controller->getAdmins();
        echo json_encode(['success' => true, 'data' => $data]);
        exit;
    }

    if ($method === 'GET') {
        $data = $controller->getDashboardData();
        echo json_encode(['success' => true, 'data' => $data]);
        exit;
    }

    if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'add_vendor') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            throw new Exception('Invalid JSON input');
        }
        $id = $controller->addVendor($input);
        http_response_code(201);
        echo json_encode(['success' => true, 'data' => ['id_vendor' => $id]]);
        exit;
    }

    if ($method === 'PUT' && isset($_GET['action']) && $_GET['action'] === 'update_vendor') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || !isset($_GET['id_vendor'])) {
            throw new Exception('id_vendor required');
        }
        $controller->updateVendor($_GET['id_vendor'], $input);
        echo json_encode(['success' => true, 'message' => 'Vendor updated']);
        exit;
    }

    if ($method === 'DELETE' && isset($_GET['action']) && $_GET['action'] === 'delete_vendor') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || !isset($input['id_vendor'])) {
            throw new Exception('id_vendor required');
        }
        $controller->deleteVendor($input['id_vendor']);
        echo json_encode(['success' => true, 'message' => 'Vendor deleted']);
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

ob_end_flush();
?>