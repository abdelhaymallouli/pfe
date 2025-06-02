<?php
// backend/src/models/AdminModel.php
class AdminModel {
    public function getAdmins($pdo) {
        $stmt = $pdo->query("SELECT id_admin, nom, email FROM admin");
        return $stmt->fetchAll();
    }

    public function getAllClients($pdo) {
        $stmt = $pdo->query("SELECT id_client, nom, email FROM client");
        return $stmt->fetchAll();
    }

    public function getAllEvents($pdo) {
        $stmt = $pdo->query("SELECT id_event, title, date, lieu, statut, budget FROM event");
        return $stmt->fetchAll();
    }

    public function getAllVendors($pdo) {
        $stmt = $pdo->query("SELECT id_vendor, nom, email, phone, note FROM vendor");
        return $stmt->fetchAll();
    }

    public function getAllRequests($pdo) {
        $stmt = $pdo->query("SELECT id_requete, titre, statut, id_event FROM requete");
        return $stmt->fetchAll();
    }

    public function getAllTransactions($pdo) {
        $stmt = $pdo->query("SELECT id_transaction, montant, date, id_event FROM transaction");
        return $stmt->fetchAll();
    }

    public function getAllTypes($pdo) {
        $stmt = $pdo->query("SELECT id_type, name FROM type");
        return $stmt->fetchAll();
    }

    public function addVendor($pdo, $nom, $email, $phone, $note) {
        $stmt = $pdo->prepare("INSERT INTO vendor (nom, email, phone, note) VALUES (?, ?, ?, ?)");
        $stmt->execute([$nom, $email, $phone ?: null, $note]);
        return $pdo->lastInsertId();
    }

    public function updateVendor($pdo, $id_vendor, $nom, $email, $phone, $note) {
        $stmt = $pdo->prepare("UPDATE vendor SET nom = ?, email = ?, phone = ?, note = ? WHERE id_vendor = ?");
        return $stmt->execute([$nom, $email, $phone ?: null, $note, $id_vendor]);
    }

    public function deleteVendor($pdo, $id_vendor) {
        $stmt = $pdo->prepare("DELETE FROM vendor WHERE id_vendor = ?");
        return $stmt->execute([$id_vendor]);
    }
}
?>
