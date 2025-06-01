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
            $sql = "SELECT e.id_event AS id, e.id_client AS user_id, e.title, t.name AS type, e.id_type AS id_type, e.date, e.lieu AS location, 
                           e.image_banniere AS bannerImage, e.description, e.expected_guests AS expectedGuests, 
                           e.budget, e.statut AS status 
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

    public function getEventsByUserId(int $userId) {
        try {
            $sql = "SELECT e.id_event AS id, e.id_client AS user_id, e.title, t.name AS type, e.id_type AS id_type, e.date, e.lieu AS location, 
                           e.image_banniere AS bannerImage, e.description, e.expected_guests AS expectedGuests, 
                           e.budget, e.statut AS status 
                    FROM {$this->table} e 
                    JOIN type t ON e.id_type = t.id_type 
                    WHERE e.id_client = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$userId]);
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $events;
        } catch (Exception $e) {
            error_log("EventModel::getEventsByUserId failed for user ID $userId: " . $e->getMessage());
            throw $e;
        }
    }

    public function getEventById(int $id) {
        try {
            $sql = "SELECT e.id_event AS id, e.id_client AS user_id, e.title, t.name AS type, e.id_type AS id_type, e.date, e.lieu AS location, 
                           e.image_banniere AS bannerImage, e.description, e.expected_guests AS expectedGuests, 
                           e.budget, e.statut AS status 
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

            // Validate required fields
            $required = ['user_id', 'title', 'type_id', 'date', 'location', 'expected_guests'];
            foreach ($required as $field) {
                if (!isset($data[$field]) || (is_string($data[$field]) && empty(trim($data[$field])))) {
                    throw new Exception("Missing or empty required field: $field");
                }
            }

            // Handle banner image
            $bannerImage = isset($data['image_banniere']) && !empty($data['image_banniere'])
                ? $data['image_banniere']
                : null;

            // Handle numeric fields
            $expectedGuests = (int)($data['expected_guests'] ?? 0);
            $budget = (float)($data['budget'] ?? 0);

            // Insert event
            $sql = "INSERT INTO {$this->table} (id_client, title, id_type, date, lieu, image_banniere, description, expected_guests, budget, statut) 
                    VALUES (:id_client, :title, :id_type, :date, :lieu, :image_banniere, :description, :expected_guests, :budget, :statut)";
            $stmt = $this->pdo->prepare($sql);
            $result = $stmt->execute([
                ':id_client' => (int)$data['user_id'],
                ':title' => $data['title'],
                ':id_type' => (int)$data['type_id'],
                ':date' => $data['date'],
                ':lieu' => $data['location'],
                ':image_banniere' => $bannerImage,
                ':description' => $data['description'] ?? '',
                ':expected_guests' => $expectedGuests,
                ':budget' => $budget,
                ':statut' => $data['status'] ?? 'Planned'
            ]);

            if (!$result) {
                throw new Exception('Failed to insert event into database');
            }

            $eventId = $this->pdo->lastInsertId();

            // Insert requetes and transactions
            if (isset($data['requetes']) && is_array($data['requetes'])) {
                foreach ($data['requetes'] as $requete) {
                    // Insert transaction
                    $sql = "INSERT INTO transaction (montant, id_event) VALUES (:montant, :id_event)";
                    $stmt = $this->pdo->prepare($sql);
                    $stmt->execute([
                        ':montant' => (float)($requete['montant'] ?? 0),
                        ':id_event' => $eventId
                    ]);
                    $transactionId = $this->pdo->lastInsertId();

                    // Insert requete with transaction_id
                    $sql = "INSERT INTO requete (titre, description, date_limite, statut, id_event, id_transaction) 
                            VALUES (:titre, :description, :date_limite, :statut, :id_event, :id_transaction)";
                    $stmt = $this->pdo->prepare($sql);
                    $stmt->execute([
                        ':titre' => $requete['titre'],
                        ':description' => $requete['description'] ?? null,
                        ':date_limite' => $requete['date_limite'] ?? null,
                        ':statut' => $requete['statut'] ?? 'Open',
                        ':id_event' => $eventId,
                        ':id_transaction' => $transactionId
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

            // Validate required fields
            $required = ['id', 'user_id', 'title', 'type_id', 'date', 'location', 'expected_guests'];
            foreach ($required as $field) {
                if (!isset($data[$field]) || (is_string($data[$field]) && empty(trim($data[$field])))) {
                    throw new Exception("Missing or empty required field: $field");
                }
            }

            // Handle banner image
            $bannerImage = isset($data['image_banniere']) && !empty($data['image_banniere'])
                ? $data['image_banniere']
                : null;

            // Handle numeric fields
            $expectedGuests = (int)($data['expected_guests'] ?? 0);
            $budget = (float)($data['budget'] ?? 0);

            // Update event
            $sql = "UPDATE {$this->table} 
                    SET id_client = :id_client, title = :title, id_type = :id_type, date = :date, lieu = :lieu, 
                        image_banniere = :image_banniere, description = :description, expected_guests = :expected_guests, 
                        budget = :budget, statut = :statut
                    WHERE id_event = :id_event";
            $stmt = $this->pdo->prepare($sql);
            $result = $stmt->execute([
                ':id_client' => (int)$data['user_id'],
                ':title' => $data['title'],
                ':id_type' => (int)$data['type_id'],
                ':date' => $data['date'],
                ':lieu' => $data['location'],
                ':image_banniere' => $bannerImage,
                ':description' => $data['description'] ?? '',
                ':expected_guests' => $expectedGuests,
                ':budget' => $budget,
                ':statut' => $data['status'] ?? 'Planned',
                ':id_event' => (int)$data['id']
            ]);

            if (!$result) {
                throw new Exception('Failed to update event in database');
            }

            // Delete existing requetes and transactions for the event
            $sql = "DELETE FROM requete WHERE id_event = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([(int)$data['id']]);

            $sql = "DELETE FROM transaction WHERE id_event = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([(int)$data['id']]);

            // Insert new requetes and transactions
            if (isset($data['requetes']) && is_array($data['requetes'])) {
                foreach ($data['requetes'] as $requete) {
                    // Insert transaction
                    $sql = "INSERT INTO transaction (montant, id_event) VALUES (:montant, :id_event)";
                    $stmt = $this->pdo->prepare($sql);
                    $stmt->execute([
                        ':montant' => (float)($requete['montant'] ?? 0),
                        ':id_event' => (int)$data['id']
                    ]);
                    $transactionId = $this->pdo->lastInsertId();

                    // Insert requete
                    $sql = "INSERT INTO requete (titre, description, date_limite, statut, id_event, id_transaction) 
                            VALUES (:titre, :description, :date_limite, :statut, :id_event, :id_transaction)";
                    $stmt = $this->pdo->prepare($sql);
                    $stmt->execute([
                        ':titre' => $requete['titre'],
                        ':description' => $requete['description'] ?? null,
                        ':date_limite' => $requete['date_limite'] ?? null,
                        ':statut' => $requete['statut'] ?? 'Open',
                        ':id_event' => (int)$data['id'],
                        ':id_transaction' => $transactionId
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
}
?>