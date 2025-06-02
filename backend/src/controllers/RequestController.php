<?php
// backend/src/controllers/RequestController.php
require_once __DIR__ . '/../models/RequestModel.php';

class RequestController {
    private $model;

    public function __construct($db) {
        $this->model = new RequestModel($db);
    }

    public function getRequestsByEventId(int $id_event) {
        try {
            return $this->model->getByEventId($id_event);
        } catch (Exception $e) {
            error_log("Error getting requests for event ID $id_event: " . $e->getMessage());
            return [];
        }
    }

    public function addTransactionAndRequest($data) {
        try {
            $required = ['id_event', 'title', 'amount', 'id_client'];
            foreach ($required as $field) {
                if (!isset($data[$field]) || (is_string($data[$field]) && empty(trim($data[$field])))) {
                    throw new Exception("Missing or empty required field: $field");
                }
            }
            if (!is_numeric($data['id_event']) || !is_numeric($data['amount']) || !is_numeric($data['id_client'])) {
                throw new Exception('id_event, amount, and id_client must be numeric');
            }
            if (isset($data['id_vendor']) && !is_numeric($data['id_vendor'])) {
                throw new Exception('id_vendor must be numeric');
            }
            if (isset($data['deadline']) && (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data['deadline']) || !strtotime($data['deadline']))) {
                throw new Exception('Invalid deadline format, expected YYYY-MM-DD');
            }
            if (isset($data['status']) && !in_array($data['status'], ['Open', 'In Progress', 'Completed', 'Cancelled'])) {
                throw new Exception('Invalid status value');
            }
            return $this->model->addTransactionAndRequest($data);
        } catch (Exception $e) {
            error_log("Error adding transaction and request: " . $e->getMessage());
            error_log("Data received: " . json_encode($data));
            throw $e;
        }
    }

    public function updateRequest($data) {
        try {
            $required = ['id_request', 'id_event', 'id_client'];
            foreach ($required as $field) {
                if (!isset($data[$field])) {
                    throw new Exception("Missing required field: $field");
                }
            }
            if (!is_numeric($data['id_request']) || !is_numeric($data['id_event']) || !is_numeric($data['id_client'])) {
                throw new Exception('id_request, id_event, and id_client must be numeric');
            }
            if (isset($data['amount']) && (!is_numeric($data['amount']) || $data['amount'] <= 0)) {
                throw new Exception('amount must be a positive number');
            }
            if (isset($data['id_vendor']) && !is_numeric($data['id_vendor'])) {
                throw new Exception('id_vendor must be numeric');
            }
            if (isset($data['deadline']) && (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data['deadline']) || !strtotime($data['deadline']))) {
                throw new Exception('Invalid deadline format, expected YYYY-MM-DD');
            }
            if (isset($data['status']) && !in_array($data['status'], ['Open', 'In Progress', 'Completed', 'Cancelled'])) {
                throw new Exception('Invalid status value');
            }
            $this->model->updateRequest($data);
            return true;
        } catch (Exception $e) {
            error_log("Error updating request ID {$data['id_request']}: " . $e->getMessage());
            throw $e;
        }
    }

    public function deleteRequest(int $id_request, int $id_event) {
        try {
            $deleted = $this->model->deleteRequest($id_request, $id_event);
            if (!$deleted) {
                throw new Exception("No request found with ID $id_request for event ID $id_event");
            }
            return true;
        } catch (Exception $e) {
            error_log("Error deleting request ID $id_request: " . $e->getMessage());
            throw $e;
        }
    }
}
?>