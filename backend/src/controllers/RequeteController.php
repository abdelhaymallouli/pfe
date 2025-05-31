<?php
// backend/src/controllers/RequeteController.php
require_once __DIR__ . '/../models/RequeteModel.php';

class RequeteController {
    private $model;

    public function __construct($db) {
        $this->model = new RequeteModel($db);
    }

    public function getRequetesByEventId(int $eventId) {
        try {
            return $this->model->getRequetesByEventId($eventId);
        } catch (Exception $e) {
            error_log("Error getting requetes for event ID $eventId: " . $e->getMessage());
            return [];
        }
    }

    public function updateRequeteStatus(int $id, string $status) {
        try {
            if (!in_array($status, ['Open', 'In Progress', 'Completed', 'Cancelled'])) {
                throw new Exception('Invalid status value');
            }
            return $this->model->updateRequeteStatus($id, $status);
        } catch (Exception $e) {
            error_log("Error updating requete ID $id: " . $e->getMessage());
            throw $e;
        }
    }

    public function addTransactionAndRequete($data) {
        try {
            return $this->model->addTransactionAndRequete($data);
        } catch (Exception $e) {
            error_log("Error adding transaction and requete: " . $e->getMessage());
            error_log("Data received: " . json_encode($data));
            throw $e;
        }
    }
}
?>