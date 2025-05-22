<?php
// models/VendorModel.php

class VendorModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    // Fetch all vendors
    public function getAllVendors() {
        $stmt = $this->pdo->prepare("SELECT * FROM vendors");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

}
