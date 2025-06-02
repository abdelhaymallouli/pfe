<?php
// backend/src/models/EventModel.php
class EventModel {
    private $pdo;
    private $table = 'event';

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getAllEvents() {
        try {
            $sql = "SELECT e.id_event AS id, e.id_client, e.title, t.type_name AS type, e.id_type, e.event_date, e.location, 
                           e.banner_image, e.description, e.expected_guests, e.budget, e.status 
                    FROM {$this->table} e 
                    JOIN type t ON e.id_type = t.id_type";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $events;
        } catch (Exception $e) {
            error_log("EventModel::getAllEvents failed: " . $e->getMessage());
            throw $e;
        }
    }

    public function getEventsByClientId(int $id_client) {
        try {
            $sql = "SELECT e.id_event AS id, e.id_client, e.title, t.type_name AS type, e.id_type, e.event_date, e.location, 
                           e.banner_image, e.description, e.expected_guests, e.budget, e.status 
                    FROM {$this->table} e 
                    JOIN type t ON e.id_type = t.id_type 
                    WHERE e.id_client = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$id_client]);
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $events;
        } catch (Exception $e) {
            error_log("EventModel::getEventsByClientId failed for client ID $id_client: " . $e->getMessage());
            throw $e;
        }
    }

    public function getEventById(int $id) {
        try {
            $sql = "SELECT e.id_event AS id, e.id_client, e.title, t.type_name AS type, e.id_type, e.event_date, e.location, 
                           e.banner_image, e.description, e.expected_guests, e.budget, e.status 
                    FROM {$this->table} e 
                    JOIN type t ON e.id_type = t.id_type 
                    WHERE e.id_event = ?";
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

            $required = ['id_client', 'title', 'id_type', 'event_date', 'location', 'expected_guests'];
            foreach ($required as $field) {
                if (!isset($data[$field]) || (is_string($data[$field]) && empty(trim($data[$field])))) {
                    throw new Exception("Missing or empty required field: $field");
                }
            }

            $banner_image = isset($data['banner_image']) && !empty($data['banner_image'])
                ? $data['banner_image']
                : null;

            $expected_guests = (int)($data['expected_guests'] ?? 0);
            $budget = (float)($data['budget'] ?? 0);

            $sql = "INSERT INTO {$this->table} (id_client, title, id_type, event_date, location, banner_image, description, expected_guests, budget, status) 
                    VALUES (:id_client, :title, :id_type, :event_date, :location, :banner_image, :description, :expected_guests, :budget, :status)";
            $stmt = $this->pdo->prepare($sql);
            $result = $stmt->execute([
                ':id_client' => (int)$data['id_client'],
                ':title' => $data['title'],
                ':id_type' => (int)$data['id_type'],
                ':event_date' => $data['event_date'],
                ':location' => $data['location'],
                ':banner_image' => $banner_image,
                ':description' => $data['description'] ?? '',
                ':expected_guests' => $expected_guests,
                ':budget' => $budget,
                ':status' => $data['status'] ?? 'Planned'
            ]);

            if (!$result) {
                throw new Exception('Failed to insert event into database');
            }

            $eventId = $this->pdo->lastInsertId();

            if (isset($data['requests']) && is_array($data['requests'])) {
                foreach ($data['requests'] as $request) {
                    $sql = "INSERT INTO transaction (amount, id_event) VALUES (:amount, :id_event)";
                    $stmt = $this->pdo->prepare($sql);
                    $stmt->execute([
                        ':amount' => (float)($request['amount'] ?? 0),
                        ':id_event' => $eventId
                    ]);
                    $transactionId = $this->pdo->lastInsertId();

                    $sql = "INSERT INTO request (title, description, deadline, status, id_event, id_transaction, id_vendor) 
                            VALUES (:title, :description, :deadline, :status, :id_event, :id_transaction, :id_vendor)";
                    $stmt = $this->pdo->prepare($sql);
                    $stmt->execute([
                        ':title' => $request['title'],
                        ':description' => $request['description'] ?? null,
                        ':deadline' => $request['deadline'] ?? null,
                        ':status' => $request['status'] ?? 'Open',
                        ':id_event' => $eventId,
                        ':id_transaction' => $transactionId,
                        ':id_vendor' => isset($request['id_vendor']) ? (int)$request['id_vendor'] : null
                    ]);
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

    public function updateEvent($data) {
        try {
            $this->pdo->beginTransaction();

            $existingEvent = $this->getEventById((int)$data['id']);
            if (!$existingEvent) {
                throw new Exception("Event not found");
            }

            $updateData = array_merge($existingEvent, $data);
            $required = ['id', 'id_client', 'title', 'id_type', 'event_date', 'location', 'expected_guests'];
            foreach ($required as $field) {
                if (!isset($updateData[$field]) || (is_string($updateData[$field]) && empty(trim($updateData[$field])))) {
                    throw new Exception("Missing or empty required field: $field");
                }
            }

            $banner_image = isset($data['banner_image']) && !empty($data['banner_image'])
                ? $data['banner_image']
                : $existingEvent['banner_image'] ?? null;

            $expected_guests = (int)($updateData['expected_guests'] ?? 0);
            $budget = (float)($updateData['budget'] ?? $existingEvent['budget'] ?? 0);

            $sql = "UPDATE {$this->table} 
                    SET id_client = :id_client, title = :title, id_type = :id_type, event_date = :event_date, location = :location, 
                        banner_image = :banner_image, description = :description, expected_guests = :expected_guests, 
                        budget = :budget, status = :status
                    WHERE id_event = :id_event";
            $stmt = $this->pdo->prepare($sql);
            $result = $stmt->execute([
                ':id_client' => (int)$updateData['id_client'],
                ':title' => $updateData['title'],
                ':id_type' => (int)$updateData['id_type'],
                ':event_date' => $updateData['event_date'],
                ':location' => $updateData['location'],
                ':banner_image' => $banner_image,
                ':description' => $updateData['description'] ?? '',
                ':expected_guests' => $expected_guests,
                ':budget' => $budget,
                ':status' => $updateData['status'] ?? 'Planned',
                ':id_event' => (int)$updateData['id']
            ]);

            if (!$result) {
                throw new Exception('Failed to update event in database');
            }

            $sql = "DELETE FROM request WHERE id_event = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([(int)$updateData['id']]);

            $sql = "DELETE FROM transaction WHERE id_event = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([(int)$updateData['id']]);

            if (isset($data['requests']) && is_array($data['requests'])) {
                foreach ($data['requests'] as $request) {
                    $sql = "INSERT INTO transaction (amount, id_event) VALUES (:amount, :id_event)";
                    $stmt = $this->pdo->prepare($sql);
                    $stmt->execute([
                        ':amount' => (float)($request['amount'] ?? 0),
                        ':id_event' => (int)$updateData['id']
                    ]);
                    $transactionId = $this->pdo->lastInsertId();

                    $sql = "INSERT INTO request (id_request, title, description, deadline, status, id_event, id_transaction, id_vendor) 
                            VALUES (:id_request, :title, :description, :deadline, :status, :id_event, :id_transaction, :id_vendor)";
                    $stmt = $this->pdo->prepare($sql);
                    $stmt->execute([
                        ':id_request' => (int)$request['id_request'],
                        ':title' => $request['title'],
                        ':description' => $request['description'] ?? null,
                        ':deadline' => $request['deadline'] ?? null,
                        ':status' => $request['status'] ?? 'Open',
                        ':id_event' => (int)$updateData['id'],
                        ':id_transaction' => $transactionId,
                        ':id_vendor' => isset($request['id_vendor']) ? (int)$request['id_vendor'] : null
                    ]);
                }
            }

            $this->pdo->commit();
        } catch (Exception $e) {
            $this->pdo->rollBack();
            error_log("EventModel::updateEvent failed: " . $e->getMessage());
            error_log("Data received: " . json_encode($data));
            throw $e;
        }
    }

    public function updateEventStatus(int $id, string $status) {
        try {
            $this->pdo->beginTransaction();

            $existingEvent = $this->getEventById($id);
            if (!$existingEvent) {
                throw new Exception("Event not found");
            }

            $sql = "UPDATE {$this->table} SET status = :status WHERE id_event = :id_event";
            $stmt = $this->pdo->prepare($sql);
            $result = $stmt->execute([
                ':status' => $status,
                ':id_event' => $id
            ]);

            if (!$result) {
                throw new Exception('Failed to update event status in database');
            }

            $this->pdo->commit();
        } catch (Exception $e) {
            $this->pdo->rollBack();
            error_log("EventModel::updateEventStatus failed for ID $id: " . $e->getMessage());
            throw $e;
        }
    }

    public function deleteEvent(int $id) {
        try {
            $this->pdo->beginTransaction();

            $sql = "DELETE FROM request WHERE id_event = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$id]);

            $sql = "DELETE FROM transaction WHERE id_event = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$id]);

            $sql = "DELETE FROM {$this->table} WHERE id_event = ?";
            $stmt = $this->pdo->prepare($sql);
            $result = $stmt->execute([$id]);

            if (!$result) {
                throw new Exception('Failed to delete event from database');
            }

            $this->pdo->commit();
        } catch (Exception $e) {
            $this->pdo->rollBack();
            error_log("EventModel::deleteEvent failed for ID $id: " . $e->getMessage());
            throw $e;
        }
    }
}