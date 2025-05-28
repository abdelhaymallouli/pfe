<?php
// backend/src/models/EventModel.php
class EventModel {
    private $pdo;
    private $table = 'events';

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getAllEvents() {
        try {
            $sql = "SELECT id, user_id, title, type, theme, date, location, bannerImage, description, expected_guests AS expectedGuests, budget, status FROM {$this->table}";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $events;
        } catch (Exception $e) {
            error_log("EventModel::getAllEvents failed: " . $e->getMessage());
            throw $e;
        }
    }

    public function getEventById(int $id) {
        try {
            $sql = "SELECT id, user_id, title, type, theme, date, location, bannerImage, description, expected_guests AS expectedGuests, budget, status FROM events WHERE id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$id]);
            $event = $stmt->fetch(PDO::FETCH_ASSOC);
            return $event === false ? null : $event;
        } catch (Exception $e) {
            error_log("Error fetching event ID $id: " . $e->getMessage());
            throw new Exception("Failed to fetch event");
        }
    }

    public function createEvent($data) {
        try {
            $this->pdo->beginTransaction();

            // Validate data
            if (!isset($data['user_id']) || !is_numeric($data['user_id'])) {
                throw new Exception('Invalid or missing user_id');
            }

            // Handle banner image - check both possible field names
            $bannerImage = null;
            if (isset($data['bannerImage']) && !empty($data['bannerImage'])) {
                $bannerImage = $data['bannerImage'];
            } elseif (isset($data['banner_image']) && !empty($data['banner_image'])) {
                $bannerImage = $data['banner_image'];
            }

            // Handle expected guests - check both possible field names
            $expectedGuests = 0;
            if (isset($data['expectedGuests']) && is_numeric($data['expectedGuests'])) {
                $expectedGuests = (int)$data['expectedGuests'];
            } elseif (isset($data['expected_guests']) && is_numeric($data['expected_guests'])) {
                $expectedGuests = (int)$data['expected_guests'];
            }

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
                ':theme' => $data['theme'] ?? '',
                ':date' => $data['date'],
                ':location' => $data['location'],
                ':bannerImage' => $bannerImage,
                ':description' => $data['description'] ?? '',
                ':expected_guests' => $expectedGuests,
                ':budget' => $budget,
                ':status' => 'upcoming'
            ]);

            if (!$result) {
                throw new Exception('Failed to insert event into database');
            }

            $eventId = $this->pdo->lastInsertId();

            // Insert vendors
            if (!empty($data['vendors']) && is_array($data['vendors'])) {
                foreach ($data['vendors'] as $vendorId) {
                    if (!is_numeric($vendorId)) {
                        error_log("Skipping invalid vendor ID: $vendorId");
                        continue;
                    }
                    $sql = "INSERT INTO event_vendors (event_id, vendor_id) VALUES (:event_id, :vendor_id)";
                    $stmt = $this->pdo->prepare($sql);
                    if (!$stmt->execute([':event_id' => $eventId, ':vendor_id' => (int)$vendorId])) {
                        error_log("Failed to add vendor ID $vendorId to event");
                    }
                }
            }

            // Insert tasks
            if (!empty($data['tasks']) && is_array($data['tasks'])) {
                foreach ($data['tasks'] as $task) {
                    if (empty($task['title'])) {
                        error_log('Skipping task with empty title');
                        continue;
                    }
                    $sql = "INSERT INTO tasks (event_id, title, is_done) VALUES (:event_id, :title, :is_done)";
                    $stmt = $this->pdo->prepare($sql);
                    if (!$stmt->execute([
                        ':event_id' => $eventId,
                        ':title' => $task['title'],
                        ':is_done' => isset($task['completed']) && $task['completed'] ? 1 : 0
                    ])) {
                        error_log("Failed to add task: {$task['title']}");
                    }
                }
            }

            $this->pdo->commit();
            return $eventId;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            error_log("EventModel::createEvent failed: " . $e->getMessage());
            error_log("Data received: " . json_encode($data));
            throw $e;
        }
    }

    public function addVendorToEvent($eventId, $vendorId) {
        try {
            $sql = "INSERT INTO event_vendors (event_id, vendor_id) VALUES (:event_id, :vendor_id)";
            $stmt = $this->pdo->prepare($sql);
            return $stmt->execute([':event_id' => $eventId, ':vendor_id' => $vendorId]);
        } catch (Exception $e) {
            error_log("EventModel::addVendorToEvent failed: " . $e->getMessage());
            throw $e;
        }
    }

    public function addTask($eventId, $title) {
        try {
            $sql = "INSERT INTO tasks (event_id, title, is_done) VALUES (:event_id, :title, :is_done)";
            $stmt = $this->pdo->prepare($sql);
            return $stmt->execute([
                ':event_id' => $eventId,
                ':title' => $title,
                ':is_done' => 0
            ]);
        } catch (Exception $e) {
            error_log("EventModel::addTask failed: " . $e->getMessage());
            throw $e;
        }
    }
}
?>