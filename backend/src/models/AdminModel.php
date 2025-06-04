<?php
// backend/src/models/AdminModel.php
class AdminModel {
    public function getAdmins($pdo) {
        $stmt = $pdo->query("SELECT id_admin, name AS nom, email FROM admin");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAdminByEmail($pdo, $email) {
        $stmt = $pdo->prepare("SELECT id_admin, name AS nom, email, password FROM admin WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getAllClients($pdo, $limit, $offset) {
        $stmt = $pdo->prepare("SELECT id_client, name AS nom, email FROM client LIMIT ? OFFSET ?");
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAllEvents($pdo, $limit, $offset) {
        $stmt = $pdo->prepare("SELECT id_event, title, event_date AS date, location AS lieu, status AS statut, budget FROM event LIMIT ? OFFSET ?");
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAllVendors($pdo, $limit, $offset) {
        $stmt = $pdo->prepare("SELECT id_vendor, name AS nom, email, phone, rating AS note FROM vendor LIMIT ? OFFSET ?");
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAllRequests($pdo, $limit, $offset) {
        $stmt = $pdo->prepare("SELECT id_request AS id_requete, title AS titre, status AS statut, id_event FROM request LIMIT ? OFFSET ?");
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAllTransactions($pdo, $limit, $offset) {
        $stmt = $pdo->prepare("SELECT id_transaction, amount AS montant, transaction_date AS date, id_event FROM transaction LIMIT ? OFFSET ?");
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAllTypes($pdo) {
        $stmt = $pdo->query("SELECT id_type, type_name AS name FROM type");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addVendor($pdo, $nom, $email, $phone, $note) {
        $stmt = $pdo->prepare("INSERT INTO vendor (name, email, phone, rating) VALUES (?, ?, ?, ?)");
        $stmt->execute([$nom, $email, $phone ?: null, $note]);
        return $pdo->lastInsertId();
    }

    public function updateVendor($pdo, $id_vendor, $nom, $email, $phone, $note) {
        $stmt = $pdo->prepare("UPDATE vendor SET name = ?, email = ?, phone = ?, rating = ? WHERE id_vendor = ?");
        return $stmt->execute([$nom, $email, $phone ?: null, $note, $id_vendor]);
    }

    public function deleteVendor($pdo, $id_vendor) {
        $stmt = $pdo->prepare("DELETE FROM vendor WHERE id_vendor = ?");
        return $stmt->execute([$id_vendor]);
    }
}