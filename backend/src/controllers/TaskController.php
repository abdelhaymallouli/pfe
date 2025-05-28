<?php
// backend/src/controllers/TaskController.php
require_once __DIR__ . '/../models/TaskModel.php';

class TaskController {
    private $model;

    public function __construct($pdo) {
        $this->model = new TaskModel($pdo);
    }

    public function getTasks() {
        try {
            return $this->model->getTasks();
        } catch (Exception $e) {
            error_log("Error getting tasks: " . $e->getMessage());
            return [];
        }
    }

    public function getTasksByEventId(int $eventId) {
        try {
            return $this->model->getTasksByEventId($eventId);
        } catch (Exception $e) {
            error_log("Error getting tasks for event ID $eventId: " . $e->getMessage());
            return [];
        }
    }

    public function getTaskById(int $id) {
        try {
            $task = $this->model->getTaskById($id);
            return $task ?: null;
        } catch (Exception $e) {
            error_log("Error getting task ID $id: " . $e->getMessage());
            throw $e;
        }
    }

    public function addTask($data) {
        try {
            $required = ['eventId', 'title', 'dueDate', 'priority', 'status', 'category'];
            foreach ($required as $field) {
                if (!isset($data[$field]) || (is_string($data[$field]) && empty(trim($data[$field])))) {
                    throw new Exception("Field '$field' is required");
                }
            }
            if (!is_numeric($data['eventId'])) {
                throw new Exception('eventId must be numeric');
            }
            if (!in_array($data['priority'], ['low', 'medium', 'high'])) {
                throw new Exception('Invalid priority value');
            }
            if (!in_array($data['status'], ['pending', 'completed', 'overdue'])) {
                throw new Exception('Invalid status value');
            }
            return $this->model->createTask($data);
        } catch (Exception $e) {
            error_log("Error adding task: " . $e->getMessage());
            throw $e;
        }
    }

    public function updateTask($data) {
        try {
            if (!isset($data['id']) || !is_numeric($data['id'])) {
                throw new Exception('Task ID required');
            }
            if (!isset($data['eventId']) || !is_numeric($data['eventId'])) {
                throw new Exception('eventId required and must be numeric');
            }
            $this->model->updateTask($data);
        } catch (Exception $e) {
            error_log("Error updating task ID {$data['id']}: " . $e->getMessage());
            throw $e;
        }
    }

    public function deleteTask($id) {
        try {
            $this->model->deleteTask($id);
        } catch (Exception $e) {
            error_log("Error deleting task ID $id: " . $e->getMessage());
            throw $e;
        }
    }
}
?>