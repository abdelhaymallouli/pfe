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

    public function getDashboardData($page = 1, $limit = 10) {
        $offset = ($page - 1) * $limit;
        return [
            'clients' => $this->model->getAllClients($this->pdo, $limit, $offset),
            'events' => $this->model->getAllEvents($this->pdo, $limit, $offset),
            'vendors' => $this->model->getAllVendors($this->pdo, $limit, $offset),
            'requests' => $this->model->getAllRequests($this->pdo, $limit, $offset),
            'transactions' => $this->model->getAllTransactions($this->pdo, $limit, $offset),
            'types' => $this->model->getAllTypes($this->pdo)
        ];
    }

    public function login($email, $password) {
        $admin = $this->model->getAdminByEmail($this->pdo, $email);
        if (!$admin || !password_verify(password: $password, hash: $admin['password'])) {
            throw new Exception('Invalid email or password', 401);
        }
        // Generate a simple token (replace with JWT or similar in production)
        $token = bin2hex(random_bytes(16));
        // Optionally store token in a sessions table
        return $token;
    }

    public function addVendor($data) {
        if (!isset($data['nom']) || !isset($data['email'])) {
            throw new Exception('Name and email are required', 400);
        }
        $nom = filter_var($data['nom'], FILTER_SANITIZE_STRING);
        $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
        $phone = isset($data['phone']) ? filter_var($data['phone'], FILTER_SANITIZE_STRING) : null;
        $note = isset($data['note']) ? (float)$data['note'] : null;

        return $this->model->addVendor($this->pdo, $nom, $email, $phone, $note);
    }

    public function updateVendor($id_vendor, $data) {
        if (!isset($data['nom']) || !isset($data['email'])) {
            throw new Exception('Name and email are required', 400);
        }
        $nom = filter_var($data['nom'], FILTER_SANITIZE_STRING);
        $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
        $phone = isset($data['phone']) ? filter_var($data['phone'], FILTER_SANITIZE_STRING) : null;
        $note = isset($data['note']) ? (float)$data['note'] : null;

        return $this->model->updateVendor($this->pdo, $id_vendor, $nom, $email, $phone, $note);
    }

    public function deleteVendor($id_vendor) {
        return $this->model->deleteVendor($this->pdo, $id_vendor);
    }
}