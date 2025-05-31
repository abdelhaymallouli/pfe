<?php
// backend/src/models/RequeteModel.php
class RequeteModel {
    private $pdo;
    private $table = 'requete';

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getRequetesByEventId(int $eventId) {
        try {
            $sql = "SELECT r.id_requete AS id, r.titre, r.description, r.date_limite, r.statut, 
                           t.id_transaction, t.montant AS transaction_montant, t.date AS transaction_date, 
                           v.nom AS vendor_name
                    FROM {$this->table} r
                    LEFT JOIN transaction t ON r.id_transaction = t.id_transaction
                    LEFT JOIN vendor v ON r.titre LIKE CONCAT('%', v.nom, '%')
                    WHERE r.id_event = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$eventId]);
            $requetes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $requetes;
        } catch (Exception $e) {
            error_log("RequeteModel::getRequetesByEventId failed: " . $e->getMessage());
            throw $e;
        }
    }

    public function updateRequeteStatus(int $id, string $status) {
        try {
            $sql = "UPDATE {$this->table} SET statut = :statut WHERE id_requete = :id";
            $stmt = $this->pdo->prepare($sql);
            return $stmt->execute([
                ':statut' => $status,
                ':id' => $id
            ]);
        } catch (Exception $e) {
            error_log("RequeteModel::updateRequeteStatus failed for ID $id: " . $e->getMessage());
            throw $e;
        }
    }

    public function addTransactionAndRequete($data) {
        try {
            $this->pdo->beginTransaction();

            // Validate required fields
            $required = ['event_id', 'titre', 'montant'];
            foreach ($required as $field) {
                if (!isset($data[$field])) {
                    throw new Exception("Missing required field: $field");
                }
            }

            // Insert transaction
            $sql = "INSERT INTO transaction (montant, id_event) VALUES (:montant, :id_event)";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':montant' => (float)$data['montant'],
                ':id_event' => (int)$data['event_id']
            ]);
            $transactionId = $this->pdo->lastInsertId();

            // Insert requete
            $sql = "INSERT INTO requete (titre, description, date_limite, statut, id_event, id_transaction) 
                    VALUES (:titre, :description, :date_limite, :statut, :id_event, :id_transaction)";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':titre' => $data['titre'],
                ':description' => $data['description'] ?? null,
                ':date_limite' => $data['date_limite'] ?? null,
                ':statut' => $data['statut'] ?? 'Open',
                ':id_event' => (int)$data['event_id'],
                ':id_transaction' => $transactionId
            ]);
            $requeteId = $this->pdo->lastInsertId();

            $this->pdo->commit();
            return $requeteId;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            error_log("RequeteModel::addTransactionAndRequete failed: " . $e->getMessage());
            throw $e;
        }
    }
}
?>