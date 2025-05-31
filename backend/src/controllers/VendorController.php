<?php
// backend/src/controllers/VendorController.php
require_once __DIR__ . '/../models/VendorModel.php';

class VendorController {
    private $vendorModel;

    public function __construct($pdo) {
        $this->vendorModel = new VendorModel($pdo);
    }

    public function getVendors() {
        try {
            $vendors = $this->vendorModel->getAllVendors();
            header('Content-Type: application/json; charset=UTF-8');
            echo json_encode($vendors);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch vendors: ' . $e->getMessage()]);
        }
    }

    public function getVendorById($id) {
        try {
            $vendor = $this->vendorModel->getVendorById($id);
            if ($vendor) {
                header('Content-Type: application/json; charset=UTF-8');
                echo json_encode($vendor);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Vendor not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch vendor: ' . $e->getMessage()]);
        }
    }

    public function getVendorsByType($type_id) {
        try {
            $vendors = $this->vendorModel->getVendorsByType($type_id);
            header('Content-Type: application/json; charset=UTF-8');
            echo json_encode($vendors);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch vendors by type: ' . $e->getMessage()]);
        }
    }
}
?>