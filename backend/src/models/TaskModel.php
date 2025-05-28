<?php
// backend/src/models/TaskModel.php
class TaskModel {
    private $pdo;
    private $table = 'tasks';

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getTasks() {
        try {
            $sql = "SELECT id, event_id AS eventId, title, due_date AS dueDate, status, description, priority, category, assigned_to AS assignedTo FROM {$this->table}";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $today = date('Y-m-d');
            foreach ($tasks as &$task) {
                if ($task['status'] === 'pending' && $task['dueDate'] && $task['dueDate'] < $today) {
                    $task['status'] = 'overdue';
                }
            }
            return $tasks;
        } catch (Exception $e) {
            error_log("TaskModel::getTasks failed: " . $e->getMessage());
            throw $e;
        }
    }

    public function getTasksByEventId($eventId) {
        try {
            $sql = "SELECT id, event_id AS eventId, title, due_date AS dueDate, status, description, priority, category, assigned_to AS assignedTo FROM {$this->table} WHERE event_id = :event_id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':event_id' => (int)$eventId]);
            $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $today = date('Y-m-d');
            foreach ($tasks as &$task) {
                if ($task['status'] === 'pending' && $task['dueDate'] && $task['dueDate'] < $today) {
                    $task['status'] = 'overdue';
                }
            }
            return $tasks;
        } catch (Exception $e) {
            error_log("TaskModel::getTasksByEventId failed for event ID $eventId: " . $e->getMessage());
            throw $e;
        }
    }

    public function getTaskById($id) {
        try {
            $sql = "SELECT id, event_id AS eventId, title, due_date AS dueDate, status, description, priority, category, assigned_to AS assignedTo FROM {$this->table} WHERE id = :id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':id' => (int)$id]);
            $task = $stmt->fetch(PDO::FETCH_ASSOC);
            $today = date('Y-m-d');
            if ($task && $task['status'] === 'pending' && $task['dueDate'] && $task['dueDate'] < $today) {
                $task['status'] = 'overdue';
            }
            return $task ?: null;
        } catch (Exception $e) {
            error_log("TaskModel::getTaskById failed for ID $id: " . $e->getMessage());
            throw $e;
        }
    }

    public function createTask($data) {
        try {
            $sql = "INSERT INTO {$this->table} (event_id, title, due_date, status, description, priority, category, assigned_to) VALUES (:event_id, :title, :due_date, :status, :description, :priority, :category, :assigned_to)";
            $stmt = $this->pdo->prepare($sql);
            $result = $stmt->execute([
                ':event_id' => (int)$data['eventId'],
                ':title' => $data['title'],
                ':due_date' => $data['dueDate'] ?? null,
                ':status' => $data['status'] ?? 'pending',
                ':description' => $data['description'] ?? '',
                ':priority' => $data['priority'] ?? 'medium',
                ':category' => $data['category'] ?? '',
                ':assigned_to' => $data['assignedTo'] ?? ''
            ]);
            if (!$result) {
                throw new Exception('Failed to create task');
            }
            return $this->pdo->lastInsertId();
        } catch (Exception $e) {
            error_log("TaskModel::createTask failed: " . $e->getMessage());
            throw $e;
        }
    }

    public function updateTask($data) {
        try {
            $sql = "UPDATE {$this->table} SET event_id = :event_id, title = :title, due_date = :dueDate, status = :status, description = :description, priority = :priority, category = :category, assigned_to = :assignedTo WHERE id = :id";
            $stmt = $this->pdo->prepare($sql);
            $result = $stmt->execute([
                ':id' => (int)$data['id'],
                ':event_id' => (int)$data['eventId'],
                ':title' => $data['title'],
                ':dueDate' => $data['dueDate'] ?? null,
                ':status' => $data['status'] ?? 'pending',
                ':description' => $data['description'] ?? '',
                ':priority' => $data['priority'] ?? 'medium',
                ':category' => $data['category'] ?? '',
                ':assigned_to' => $data['assignedTo'] ?? ''
            ]);
            if (!$result) {
                throw new Exception('Failed to update task');
            }
        } catch (Exception $e) {
            error_log("TaskModel::updateTask failed for ID {$data['id']}: " . $e->getMessage());
            throw $e;
        }
    }

    public function deleteTask($id) {
        try {
            $sql = "DELETE FROM {$this->table} WHERE id = :id";
            $stmt = $this->pdo->prepare($sql);
            $result = $stmt->execute([':id' => (int)$id]);
            if (!$result) {
                throw new Exception('Failed to delete task');
            }
        } catch (Exception $e) {
            error_log("TaskModel::deleteTask failed for ID $id: " . $e->getMessage());
            throw $e;
        }
    }
}
?>