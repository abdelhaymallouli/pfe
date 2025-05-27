<?php
// backend/src/models/EventModel.php
class EventModel {
    private $pdo;
    private $table = 'events';

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function createEvent($data) {
        try {
            $this->pdo->beginTransaction();

            // Validate data
            if (!isset($data['user_id']) || !is_numeric($data['user_id'])) {
                throw new Exception('Invalid or missing user_id');
            }

            $bannerImage = isset($data['bannerImage']) && !empty($data['bannerImage']) && filter_var($data['bannerImage'], FILTER_VALIDATE_URL)
                ? $data['bannerImage']
                : null;
            $expectedGuests = isset($data['expectedGuests']) && is_numeric($data['expectedGuests'])
                ? (int)$data['expectedGuests']
                : 0;
            $budget = isset($data['budget']) && is_numeric($data['budget'])
                ? (float)$data['budget']
                : 0;

            // Insert event
            $sql = "INSERT INTO {$this->table} (user_id, title, type, theme, date, location, bannerImage, description, expected_guests, budget, status) VALUES (:user_id, :title, :type, :theme, :date, :location, :bannerImage, :description, :expected_guests, :budget, :status)";
            $stmt = $this->pdo->prepare($sql);
            $result = $stmt->execute([
                ':user_id' => (int)$data['user_id'],
                ':title' => $data['title'],
                ':type' => $data['type'],
                ':theme' => $data['theme'] ?? null,
                ':date' => $data['date'],
                ':location' => $data['location'],
                ':bannerImage' => $bannerImage,
                ':description' => $data['description'] ?? null,
                ':expected_guests' => $expectedGuests,
                ':budget' => $budget,
                ':status' => 'upcoming'
            ]);

            if (!$result) {
                throw new Exception('Failed to insert event into database');
            }

            $eventId = $this->pdo->lastInsertId();

            // Insert vendors
            if (!empty($data['vendors'])) {
                foreach ($data['vendors'] as $vendorId) {
                    if (!is_numeric($vendorId)) {
                        throw new Exception("Invalid vendor ID: $vendorId");
                    }
                    $sql = "INSERT INTO event_vendors (event_id, vendor_id) VALUES (:event_id, :vendor_id)";
                    $stmt = $this->pdo->prepare($sql);
                    if (!$stmt->execute([':event_id' => $eventId, ':vendor_id' => (int)$vendorId])) {
                        throw new Exception("Failed to add vendor ID $vendorId to event");
                    }
                }
            }

            // Insert tasks
            if (!empty($data['tasks'])) {
                foreach ($data['tasks'] as $task) {
                    if (empty($task['title'])) {
                        throw new Exception('Task title is required');
                    }
                    $sql = "INSERT INTO tasks (event_id, title, completed) VALUES (:event_id, :title, :completed)";
                    $stmt = $this->pdo->prepare($sql);
                    if (!$stmt->execute([
                        ':event_id' => $eventId,
                        ':title' => $task['title'],
                        ':completed' => isset($task['completed']) && $task['completed'] ? 1 : 0
                    ])) {
                        throw new Exception("Failed to add task: {$task['title']}");
                    }
                }
            }

            $this->pdo->commit();
            return $eventId;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            error_log("EventModel::createEvent failed: " . $e->getMessage());
            throw $e;
        }
    }
}
?>