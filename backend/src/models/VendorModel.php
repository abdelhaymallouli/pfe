<?php
// backend/src/models/VendorModel.php
class VendorModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getVendorById($id) {
        $stmt = $this->pdo->prepare("
            SELECT 
                v.id_vendor AS id,
                v.name AS name,
                v.description,
                v.phone AS contactPhone,
                v.email AS contactEmail,
                v.image,
                v.rating AS rating,
                COALESCE(v.category, 'Uncategorized') AS category, 
                COALESCE(GROUP_CONCAT(CONCAT(t.type_name, ':', vt.price)), '') AS prices -- Use type_name for prices
            FROM vendor v
            LEFT JOIN vendor_type vt ON v.id_vendor = vt.id_vendor
            LEFT JOIN type t ON vt.id_type = t.id_type
            WHERE v.id_vendor = ?
            GROUP BY v.id_vendor
        ");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Other methods (getAllVendors, getVendorsByType) remain unchanged
    public function getAllVendors() {
        $stmt = $this->pdo->prepare("
            SELECT 
                v.id_vendor AS id,
                v.name AS name,
                v.description,
                v.phone AS contactPhone,
                v.email AS contactEmail,
                v.image,
                v.rating AS rating,
                COALESCE(v.category, 'Uncategorized') AS category,
                MIN(vt.price) AS price
            FROM vendor v
            LEFT JOIN vendor_type vt ON v.id_vendor = vt.id_vendor
            LEFT JOIN type t ON vt.id_type = t.id_type
            GROUP BY v.id_vendor
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getVendorsByType($type_id) {
        $stmt = $this->pdo->prepare("
            SELECT 
                v.id_vendor AS id,
                v.name AS name,
                v.description,
                v.phone AS contactPhone,
                v.email AS contactEmail,
                v.image,
                v.rating AS rating,
                COALESCE(v.category, 'Uncategorized') AS category,
                vt.price AS price
            FROM vendor v
            JOIN vendor_type vt ON v.id_vendor = vt.id_vendor
            JOIN type t ON vt.id_type = t.id_type
            WHERE vt.id_type = ?
        ");
        $stmt->execute([$type_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

?>