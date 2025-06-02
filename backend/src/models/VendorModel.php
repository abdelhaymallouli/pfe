<?php
// backend/src/models/VendorModel.php
class VendorModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

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
                GROUP_CONCAT(t.type_name) AS category,
                MIN(vt.price) AS price
            FROM vendor v
            LEFT JOIN vendor_type vt ON v.id_vendor = vt.id_vendor
            LEFT JOIN type t ON vt.id_type = t.id_type
            GROUP BY v.id_vendor
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
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
                COALESCE(GROUP_CONCAT(t.type_name), 'Uncategorized') AS category,
                COALESCE(GROUP_CONCAT(CONCAT(t.id_type, ':', vt.price)), '') AS prices
            FROM vendor v
            LEFT JOIN vendor_type vt ON v.id_vendor = vt.id_vendor
            LEFT JOIN type t ON vt.id_type = t.id_type
            WHERE v.id_vendor = ?
            GROUP BY v.id_vendor
        ");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
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
                t.type_name AS category,
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