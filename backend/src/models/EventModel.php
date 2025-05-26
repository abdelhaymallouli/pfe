<?php
class EventModel {
    private $pdo;
    private $table = 'events';

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getAllEvents() {
        try {
            $stmt = $this->pdo->prepare("
                SELECT e.*, 
                       GROUP_CONCAT(DISTINCT v.name) as vendor_names,
                       COUNT(DISTINCT t.id) as task_count
                FROM events e 
                LEFT JOIN event_vendors ev ON e.id = ev.event_id 
                LEFT JOIN vendors v ON ev.vendor_id = v.id 
                LEFT JOIN tasks t ON e.id = t.event_id 
                GROUP BY e.id 
                ORDER BY e.created_at DESC
            ");
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Database error in getAllEvents: " . $e->getMessage());
            throw $e;
        }
    }

    public function createEvent($data) {
        try {
            $sql = "INSERT INTO {$this->table} 
                   (user_id, title, type, theme, date, location, bannerImage, description, expectedGuests)
                   VALUES 
                   (:user_id, :title, :type, :theme, :date, :location, :bannerImage, :description, :expectedGuests)";

            $stmt = $this->pdo->prepare($sql);

            // Convert expectedGuests to integer if it's a string
            $expectedGuests = is_string($data['expectedGuests']) ? 
                             intval($data['expectedGuests']) : 
                             $data['expectedGuests'];

            $result = $stmt->execute([
                ':user_id' => $data['user_id'],
                ':title' => $data['title'],
                ':type' => $data['type'],
                ':theme' => $data['theme'] ?? '',
                ':date' => $data['date'],
                ':location' => $data['location'],
                ':bannerImage' => $data['bannerImage'] ?? '',
                ':description' => $data['description'] ?? '',
                ':expectedGuests' => $expectedGuests
            ]);

            if ($result) {
                return $this->pdo->lastInsertId();
            }
            return false;
        } catch (PDOException $e) {
            error_log("Database error in createEvent: " . $e->getMessage());
            throw $e;
        }
    }

    public function addVendorToEvent($eventId, $vendorId) {
        try {
            $stmt = $this->pdo->prepare("INSERT INTO event_vendors (event_id, vendor_id) VALUES (?, ?)");
            return $stmt->execute([$eventId, $vendorId]);
        } catch (PDOException $e) {
            error_log("Database error in addVendorToEvent: " . $e->getMessage());
            return false;
        }
    }

    public function addTask($eventId, $title) {
        try {
            $stmt = $this->pdo->prepare("INSERT INTO tasks (event_id, title) VALUES (?, ?)");
            return $stmt->execute([$eventId, $title]);
        } catch (PDOException $e) {
            error_log("Database error in addTask: " . $e->getMessage());
            return false;
        }
    }

    public function getAllVendors() {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM vendors ORDER BY name");
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Database error in getAllVendors: " . $e->getMessage());
            throw $e;
        }
    }
}
?>