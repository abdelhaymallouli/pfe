<?php
// backend/src/api/vendor.php
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php_errors.log');

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../controllers/VendorController.php';

header('Content-Type: application/json; charset=UTF-8');
ob_clean();

try {
    $db = new Database();
    $pdo = $db->getConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

$controller = new VendorController($pdo);

// Check for 'id' or 'type_id' query parameter
if (isset($_GET['id']) && is_numeric($_GET['id'])) {
    $controller->getVendorById((int)$_GET['id']);
} elseif (isset($_GET['type_id']) && is_numeric($_GET['type_id'])) {
    $controller->getVendorsByType((int)$_GET['type_id']);
} else {
    $controller->getVendors();
}
?>