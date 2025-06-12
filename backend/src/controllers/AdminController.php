<?php
require_once __DIR__ . '/../models/AdminModel.php';
require_once __DIR__ . '/../../config/auth_config.php';

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
        if (!$admin || !password_verify($password, $admin['password'])) {
            throw new Exception('Invalid email or password', 401);
        }
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode(['admin_id' => $admin['id_admin'], 'exp' => time() + JWT_EXPIRATION]);
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public function logout($adminId) {
        return $this->model->logout($this->pdo, $adminId);
    }

    // Client Management
    public function getAllClients() {
        return $this->model->getAllClients($this->pdo);
    }

    public function getClientById($id_client) {
        return $this->model->getClientById($this->pdo, $id_client);
    }

    public function addClient($data) {
        if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
            throw new Exception('Name, email, and password are required', 400);
        }
        $name = filter_var($data['name'], FILTER_SANITIZE_STRING);
        $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
        $password = password_hash($data['password'], PASSWORD_DEFAULT);
        return $this->model->addClient($this->pdo, $name, $email, $password);
    }

    public function updateClient($id_client, $data) {
        if (!isset($data['name']) || !isset($data['email'])) {
            throw new Exception('Name and email are required', 400);
        }
        $name = filter_var($data['name'], FILTER_SANITIZE_STRING);
        $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
        $password = isset($data['password']) ? password_hash($data['password'], PASSWORD_DEFAULT) : null;
        return $this->model->updateClient($this->pdo, $id_client, $name, $email, $password);
    }

    public function deleteClient($id_client) {
        return $this->model->deleteClient($this->pdo, $id_client);
    }

    // Event Management
    public function getAllEvents() {
        return $this->model->getAllEvents($this->pdo);
    }

    public function addEvent($data) {
        $required = ['title', 'date', 'location', 'id_client', 'id_type'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                throw new Exception("$field is required", 400);
            }
        }
        $title = filter_var($data['title'], FILTER_SANITIZE_STRING);
        $date = $data['date'];
        $location = filter_var($data['location'], FILTER_SANITIZE_STRING);
        $description = isset($data['description']) ? filter_var($data['description'], FILTER_SANITIZE_STRING) : '';
        $expected_guests = isset($data['expected_guests']) ? (int)$data['expected_guests'] : null;
        $budget = isset($data['budget']) ? (float)$data['budget'] : null;
        $id_client = (int)$data['id_client'];
        $id_type = (int)$data['id_type'];
        return $this->model->addEvent($this->pdo, $title, $date, $location, $description, $expected_guests, $budget, $id_client, $id_type);
    }

    public function updateEvent($id_event, $data) {
        $required = ['title', 'date', 'location', 'status', 'id_client', 'id_type'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                throw new Exception("$field is required", 400);
            }
        }
        $title = filter_var($data['title'], FILTER_SANITIZE_STRING);
        $date = $data['date'];
        $location = filter_var($data['location'], FILTER_SANITIZE_STRING);
        $description = isset($data['description']) ? filter_var($data['description'], FILTER_SANITIZE_STRING) : '';
        $expected_guests = isset($data['expected_guests']) ? (int)$data['expected_guests'] : null;
        $budget = isset($data['budget']) ? (float)$data['budget'] : null;
        $status = $data['status'];
        $id_client = (int)$data['id_client'];
        $id_type = (int)$data['id_type'];
        return $this->model->updateEvent($this->pdo, $id_event, $title, $date, $location, $description, $expected_guests, $budget, $status, $id_client, $id_type);
    }

    public function deleteEvent($id_event) {
        return $this->model->deleteEvent($this->pdo, $id_event);
    }

    // Vendor Management
    public function getAllVendorsWithPrices() {
        $vendors = $this->model->getAllVendors($this->pdo);
        foreach ($vendors as &$vendor) {
            $vendor['type_prices'] = $this->model->getVendorPrices($this->pdo, $vendor['id_vendor']);
        }
        return $vendors;
    }

    public function getVendorById($id_vendor) {
        $vendor = $this->model->getVendorById($this->pdo, $id_vendor);
        if ($vendor) {
            $vendor['type_prices'] = $this->model->getVendorPrices($this->pdo, $id_vendor);
        }
        return $vendor;
    }

    public function addVendor($data) {
        if (!isset($data['nom']) || !isset($data['email']) || !isset($data['category']) || !isset($data['type_prices'])) {
            throw new Exception('Name, email, category, and type prices are required', 400);
        }
        $this->pdo->beginTransaction();
        try {
            $id = $this->model->addVendor($this->pdo, $data);
            foreach ($data['type_prices'] as $typePrice) {
                $this->model->addVendorPrice($this->pdo, $id, $typePrice['id_type'], $typePrice['price']);
            }
            $this->pdo->commit();
            return $id;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    public function updateVendor($id_vendor, $data) {
        if (!isset($data['nom']) || !isset($data['email']) || !isset($data['category']) || !isset($data['type_prices'])) {
            throw new Exception('Name, email, category, and type prices are required', 400);
        }
        $this->pdo->beginTransaction();
        try {
            $result = $this->model->updateVendor($this->pdo, $id_vendor, $data);
            $this->model->deleteVendorPrices($this->pdo, $id_vendor);
            foreach ($data['type_prices'] as $typePrice) {
                $this->model->addVendorPrice($this->pdo, $id_vendor, $typePrice['id_type'], $typePrice['price']);
            }
            $this->pdo->commit();
            return $result;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    public function deleteVendor($id_vendor) {
        $this->pdo->beginTransaction();
        try {
            $this->model->deleteVendorPrices($this->pdo, $id_vendor);
            $result = $this->model->deleteVendor($this->pdo, $id_vendor);
            $this->pdo->commit();
            return $result;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    // Category Management (Types)
    public function getAllTypes() {
        return $this->model->getAllTypes($this->pdo);
    }

    // Request Management
    public function getAllRequests() {
        return $this->model->getAllRequests($this->pdo);
    }

    public function addRequest($data) {
        $required = ['title', 'id_event'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                throw new Exception("$field is required", 400);
            }
        }
        $title = filter_var($data['title'], FILTER_SANITIZE_STRING);
        $description = isset($data['description']) ? filter_var($data['description'], FILTER_SANITIZE_STRING) : null;
        $deadline = isset($data['deadline']) ? $data['deadline'] : null;
        $id_event = (int)$data['id_event'];
        $id_vendor = isset($data['id_vendor']) ? (int)$data['id_vendor'] : null;
        return $this->model->addRequest($this->pdo, $title, $description, $deadline, $id_event, $id_vendor);
    }

    public function updateRequest($id_request, $data) {
        $required = ['title', 'status'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                throw new Exception("$field is required", 400);
            }
        }
        $title = filter_var($data['title'], FILTER_SANITIZE_STRING);
        $description = isset($data['description']) ? filter_var($data['description'], FILTER_SANITIZE_STRING) : null;
        $deadline = isset($data['deadline']) ? $data['deadline'] : null;
        $status = $data['status'];
        $id_vendor = isset($data['id_vendor']) ? (int)$data['id_vendor'] : null;
        return $this->model->updateRequest($this->pdo, $id_request, $title, $description, $deadline, $status, $id_vendor);
    }

    public function updateRequestStatus($id_request, $status) {
        return $this->model->updateRequestStatus($this->pdo, $id_request, $status);
    }

    public function deleteRequest($id_request) {
        return $this->model->deleteRequest($this->pdo, $id_request);
    }

    // Analytics
    public function getAnalyticsData() {
        return $this->model->getAnalyticsData($this->pdo);
    }

    // Backup
    public function createBackup() {
        $backupDir = __DIR__ . '/../../backups/';
        if (!is_dir($backupDir)) {
            if (!mkdir($backupDir, 0755, true)) {
                throw new Exception('Failed to create backups directory', 500);
            }
        }
        $backup = $this->model->createBackup($this->pdo);
        return $backup;
    }
}
?>