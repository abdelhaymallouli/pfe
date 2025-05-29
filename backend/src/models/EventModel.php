<?php
// models/EventModel.php

class EventModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    // Fetch all events with their type name
    public function getAllEvents() {
        $stmt = $this->pdo->prepare("
            SELECT e.*, t.type_name 
            FROM events e 
            LEFT JOIN type t ON e.id_type = t.id_type
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Fetch a single event by ID with its type name
    public function getEventById(int $id) {
        $stmt = $this->pdo->prepare("
            SELECT e.*, t.type_name 
            FROM events e 
            LEFT JOIN type t ON e.id_type = t.id_type 
            WHERE e.id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Create a new event
    public function createEvent($data) {
        try {
            $this->pdo->beginTransaction();

            // Get the id_type from the type table based on type_name
            $stmt = $this->pdo->prepare("SELECT id_type FROM type WHERE type_name = ?");
            $stmt->execute([$data['type']]);
            $type = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$type) {
                throw new Exception("Invalid event type: {$data['type']}");
            }

            // Insert the event
            $stmt = $this->pdo->prepare("
                INSERT INTO events (
                    user_id, title, theme, date, location, bannerImage, 
                    description, status, expected_guests, budget, id_type
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $data['user_id'],
                $data['title'],
                $data['theme'] ?? null,
                $data['date'],
                $data['location'],
                $data['bannerImage'] ?? null,
                $data['description'] ?? null,
                $data['status'] ?? 'upcoming',
                $data['expected_guests'] ?? 0,
                $data['budget'] ?? 0.00,
                $type['id_type']
            ]);

            $eventId = $this->pdo->lastInsertId();

            // Handle vendors (insert into request table if vendors are provided)
            if (!empty($data['vendors']) && is_array($data['vendors'])) {
                $stmt = $this->pdo->prepare("
                    INSERT INTO request (user_id, event_id, vendor_id, status, message)
                    VALUES (?, ?, ?, 'pending', ?)
                ");
                foreach ($data['vendors'] as $vendorId) {
                    if (is_numeric($vendorId)) {
                        $stmt->execute([
                            $data['user_id'],
                            $eventId,
                            $vendorId,
                            'Vendor request for event ' . $eventId
                        ]);
                    }
                }
            }

            $this->pdo->commit();
            return $eventId;

        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }
}