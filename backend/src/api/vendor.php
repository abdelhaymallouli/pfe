<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../controllers/VendorController.php';

header('Content-Type: application/json');

// Create DB connection
$db = new Database();
$pdo = $db->getConnection();

$controller = new VendorController($pdo);
$controller->getVendors();
