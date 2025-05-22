<?php
class EventModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getAllEvents() {
        $stmt = $this->pdo->prepare("SELECT * FROM events");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createEvent($data) {
        $sql = "INSERT INTO " . $this->table . " 
            (user_id, title, type, date, location, theme, description, expectedGuests, bannerImage)
            VALUES 
            (:user_id, :title, :type, :date, :location, :theme, :description, :expectedGuests, :bannerImage)";
    
        $stmt = $this->conn->prepare($sql);
    
        // Bind parameters
        $stmt->bindParam(':user_id', $data['user_id'], PDO::PARAM_INT);
        $stmt->bindParam(':title', $data['title']);
        $stmt->bindParam(':type', $data['type']);
        $stmt->bindParam(':date', $data['date']); // make sure date is in correct format (YYYY-MM-DD or DATETIME)
        $stmt->bindParam(':location', $data['location']);
        $stmt->bindParam(':theme', $data['theme']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':expectedGuests', $data['expectedGuests'], PDO::PARAM_INT);
        $stmt->bindParam(':bannerImage', $data['bannerImage']);
    
        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        } else {
            return false;
        }
    }
    
}
