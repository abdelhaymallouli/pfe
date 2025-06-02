<?php
// backend/src/controllers/RequeteController.php
require_once __DIR__ . '/../models/RequeteModel.php';

class RequeteController {
    private $model;

    public function __construct($db) {
        $this->model = new RequeteModel($db);
    }

    public function getRequetesByEventId(int $eventId, ?int $userId = null) {
        try {
            return $this->model->getByEventId($eventId, $userId);
        } catch (Exception $e) {
            error_log("Error getting requetes for event ID $eventId" . ($userId ? " and user ID $userId" : "") . ": " . $e->getMessage());
            return [];
        }
    }

    public function updateRequeteStatus(int $id, string $status) {
        try {
            $updated = $this->model->updateRequeteStatus($id, $status);
            if (!$updated) {
                throw new Exception("No requete found with ID $id or status unchanged");
            }
            return true;
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