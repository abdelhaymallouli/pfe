<?php
// backend/src/controllers/AdminController.php
require_once __DIR__ . '/../models/AdminModel.php';

class AdminController {
    private $pdo;
    private $model;

    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->model = new AdminModel();
    }

    public function getAdmins() {
        return $this->model->getAdmins($this->pdo);
    }

    public function getDashboardData() {
        return [
            'clients' => $this->model->getAllClients($this->pdo),
            'events' => $this->model->getAllEvents($this->pdo),
            'vendors' => $this->model->getAllVendors($this->pdo),
            'requests' => $this->model->getAllRequests($this->pdo),
            'transactions' => $this->model->getAllTransactions($this->pdo),
            'types' => $this->model->getAllTypes($this->pdo)
        ];
    }

    public function addVendor($data) {
        if (!isset($data['nom']) || !isset($data['email'])) {
            throw new Exception('Name and email are required');
        }
        $nom = $data['nom'];
        $email = $data['email'];
        $phone = $data['phone'] ?? null;
        $note = isset($data['note']) ? (float)$data['note'] : null;

        return $this->model->addVendor($this->pdo, $nom, $email, $phone, $note);
    }

    public function updateVendor($id_vendor, $data) {
        if (!isset($data['nom']) || !isset($data['email'])) {
            throw new Exception('Name and email are required');
        }
        $nom = $data['nom'];
        $email = $data['email'];
        $phone = $data['phone'] ?? null;
        $note = isset($data['note']) ? (float)$data['note'] : null;

        return $this->model->updateVendor($this->pdo, $id_vendor, $nom, $email, $phone, $note);
    }

    public function deleteVendor($id_vendor) {
        return $this->model->deleteVendor($this->pdo, $id_vendor);
    }
}
?>
