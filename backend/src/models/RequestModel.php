```php
<?php
// backend/src/models/RequestModel.php
class RequestModel {
    private $pdo;
    private $table = 'request';

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getByEventId(int $id_event) {
        try {
            $sql = "SELECT r.id_request, r.title, r.description, r.deadline, r.status, 
                           r.id_vendor, t.amount, t.transaction_date, v.name AS vendor_name
                    FROM {$this->table} r
                    LEFT JOIN transaction t ON r.id_transaction = t.id_transaction
                    LEFT JOIN vendor v ON r.id_vendor = v.id_vendor
                    WHERE r.id_event = :id_event";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':id_event' => $id_event]);
            $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return array_map(function($request) {
                return [
                    'id_request' => (int)$request['id_request'],
                    'title' => $request['title'],
                    'description' => $request['description'],
                    'deadline' => $request['deadline'],
                    'status' => $request['status'],
                    'id_vendor' => $request['id_vendor'] ? (int)$request['id_vendor'] : null,
                    'amount' => $request['amount'] ? (float)$request['amount'] : null,
                    'transaction_date' => $request['transaction_date'],
                    'vendor_name' => $request['vendor_name'] ?? null
                ];
            }, $requests);
        } catch (Exception $e) {
            error_log("RequestModel::getByEventId failed for event ID $id_event: " . $e->getMessage());
            throw $e;
        }
    }

    public function addTransactionAndRequest($data) {
        try {
            $this->pdo->beginTransaction();

            $sql = "INSERT INTO transaction (amount, id_event, transaction_date) 
                    VALUES (:amount, :id_event, :transaction_date)";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':amount' => (float)$data['amount'],
                ':id_event' => (int)$data['id_event'],
                ':transaction_date' => $data['transaction_date'] ?? date('Y-m-d H:i:s')
            ]);
            $transaction_id = $this->pdo->lastInsertId();

            $sql = "INSERT INTO {$this->table} (title, description, deadline, status, id_event, id_transaction, id_vendor)
                    VALUES (:title, :description, :deadline, :status, :id_event, :id_transaction, :id_vendor)";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':title' => $data['title'],
                ':description' => $data['description'] ?? null,
                ':deadline' => $data['deadline'] ?? null,
                ':status' => $data['status'] ?? 'Open',
                ':id_event' => (int)$data['id_event'],
                ':id_transaction' => (int)$transaction_id,
                ':id_vendor' => isset($data['id_vendor']) ? (int)$data['id_vendor'] : null
            ]);
            $request_id = $this->pdo->lastInsertId();

            $this->pdo->commit();
            return $request_id;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            error_log("RequestModel::addTransactionAndRequest failed: " . $e->getMessage());
            throw $e;
        }
    }

    public function updateRequest($data) {
        try {
            $this->pdo->beginTransaction();

            $sql = "SELECT id_transaction, id_event FROM {$this->table} WHERE id_request = :id_request";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':id_request' => (int)$data['id_request']]);
            $request = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$request) {
                throw new Exception('Request not found');
            }

            $setClauses = [];
            $params = [':id_request' => (int)$data['id_request']];

            if (isset($data['title'])) {
                $setClauses[] = 'title = :title';
                $params[':title'] = $data['title'];
            }
            if (isset($data['description'])) {
                $setClauses[] = 'description = :description';
                $params[':description'] = $data['description'];
            }
            if (isset($data['deadline'])) {
                $setClauses[] = 'deadline = :deadline';
                $params[':deadline'] = $data['deadline'];
            }
            if (isset($data['status'])) {
                $setClauses[] = 'status = :status';
                $params[':status'] = $data['status'];
            }
            if (isset($data['id_vendor'])) {
                $setClauses[] = 'id_vendor = :id_vendor';
                $params[':id_vendor'] = (int)$data['id_vendor'];
            }

            if (empty($setClauses)) {
                // No fields to update, commit and return success
                $this->pdo->commit();
                return true;
            }

            $sql = "UPDATE {$this->table} SET " . implode(', ', $setClauses) . " WHERE id_request = :id_request";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);

            // Handle transaction amount update if present
            if (isset($data['amount'])) {
                if ($request['id_transaction']) {
                    $sql = "UPDATE transaction 
                            SET amount = :amount, transaction_date = :transaction_date 
                            WHERE id_transaction = :id_transaction AND id_event = :id_event";
                    $stmt = $this->pdo->prepare($sql);
                    $stmt->execute([
                        ':amount' => (float)$data['amount'],
                        ':transaction_date' => $data['transaction_date'] ?? date('Y-m-d H:i:s'),
                        ':id_transaction' => (int)$request['id_transaction'],
                        ':id_event' => (int)$data['id_event']
                    ]);
                } else {
                    $sql = "INSERT INTO transaction (amount, id_event, transaction_date) 
                            VALUES (:amount, :id_event, :transaction_date)";
                    $stmt = $this->pdo->prepare($sql);
                    $stmt->execute([
                        ':amount' => (float)$data['amount'],
                        ':id_event' => (int)$data['id_event'],
                        ':transaction_date' => $data['transaction_date'] ?? date('Y-m-d H:i:s')
                    ]);
                    $new_transaction_id = $this->pdo->lastInsertId();

                    $sql = "UPDATE {$this->table} 
                            SET id_transaction = :id_transaction 
                            WHERE id_request = :id_request";
                    $stmt = $this->pdo->prepare($sql);
                    $stmt->execute([
                        ':id_transaction' => (int)$new_transaction_id,
                        ':id_request' => (int)$data['id_request']
                    ]);
                }
            }

            $this->pdo->commit();
            return true;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            error_log("RequestModel::updateRequest failed for ID {$data['id_request']}: " . $e->getMessage());
            throw $e;
        }
    }

    public function deleteRequest(int $id_request, int $id_event) {
        try {
            $this->pdo->beginTransaction();

            $sql = "SELECT id_transaction FROM {$this->table} WHERE id_request = :id_request AND id_event = :id_event";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':id_request' => $id_request, ':id_event' => $id_event]);
            $request = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$request) {
                throw new Exception('Request not found');
            }

            if ($request['id_transaction']) {
                $sql = "DELETE FROM transaction WHERE id_transaction = :id_transaction AND id_event = :id_event";
                $stmt = $this->pdo->prepare($sql);
                $stmt->execute([
                    ':id_transaction' => (int)$request['id_transaction'],
                    ':id_event' => $id_event
                ]);
            }

            $sql = "DELETE FROM {$this->table} WHERE id_request = :id_request AND id_event = :id_event";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':id_request' => $id_request,
                ':id_event' => $id_event
            ]);

            if ($stmt->rowCount() === 0) {
                throw new Exception('No request found to delete');
            }

            $this->pdo->commit();
            return true;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            error_log("RequestModel::deleteRequest failed for ID $id_request: " . $e->getMessage());
            throw $e;
        }
    }
}
?>