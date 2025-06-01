<?php
// backend/src/models/RequeteModel.php
class RequeteModel {
    private $pdo;
    private $table = 'requete';

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getByEventId(int $eventId) {
        try {
            $sql = "SELECT r.id_requete AS id_requete, r.titre, r.description, r.date_limite, r.statut AS status, 
                           t.montant AS transaction_montant, t.date AS transaction_date
                    FROM {$this->table} r
                    LEFT JOIN transaction t ON r.id_transaction = t.id_transaction
                    WHERE r.id_event = :event_id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':event_id' => $eventId]);
            $requetes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $requetes;
        } catch (Exception $e) {
            error_log("RequeteModel::getByEventId failed for event ID $eventId: " . $e->getMessage());
            throw $e;
        }
    }

    public function updateRequeteStatus(int $id, string $status) {
        try {
            $sql = "UPDATE {$this->table} SET statut = :status WHERE id_requete = :id_requete";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':status' => $status,
                ':id_requete' => $id
            ]);
            return $stmt->rowCount() > 0;
        } catch (Exception $e) {
            error_log("RequeteModel::updateRequeteStatus failed for ID $id: " . $e->getMessage());
            throw $e;
        }
    }

    public function addTransactionAndRequete($data) {
        try {
            $this->pdo->beginTransaction();

            $required = ['event_id', 'titre', 'montant'];
            foreach ($required as $field) {
                if (!isset($data[$field]) || (is_string($data[$field]) && empty(trim($data[$field])))) {
                    throw new Exception("Missing or empty required field: $field");
                }
            }

            $sql = "INSERT INTO transaction (montant, id_event, date) VALUES (:montant, :id_event, :date)";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':montant' => (float)$data['montant'],
                ':id_event' => (int)$data['event_id'],
                ':date' => $data['transaction_date'] ?? date('Y-m-d H:i:s')
            ]);
            $transactionId = $this->pdo->lastInsertId();

            $sql = "INSERT INTO {$this->table} (titre, description, date_limite, statut, id_event, id_transaction)
                    VALUES (:titre, :description, :date_limite, :statut, :id_event, :id_transaction)";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':titre' => $data['titre'],
                ':description' => $data['description'] ?? null,
                ':date_limite' => $data['date_limite'] ?? null,
                ':statut' => $data['statut'] ?? 'Open',
                ':id_event' => (int)$data['event_id'],
                ':id_transaction' => (int)$transactionId
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