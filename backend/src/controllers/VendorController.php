<?php
// controllers/VendorController.php
require_once __DIR__ . '/../models/VendorModel.php';

class VendorController {
    private $vendorModel;

    public function __construct($pdo) {
        $this->vendorModel = new VendorModel($pdo);
    }

    public function getVendors() {
        $vendors = $this->vendorModel->getAllVendors();
        header('Content-Type: application/json');
        echo json_encode($vendors);
    }
}
