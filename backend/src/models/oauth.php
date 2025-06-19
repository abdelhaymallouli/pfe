<?php
class OAuth {
    private $conn;
    private $table_name = "oauth_providers";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function findUserByOAuth($provider, $providerId) {
        try {
            $query = "SELECT c.id_client, c.name AS username FROM oauth_providers op 
                      JOIN clients c ON op.id_client = c.id_client 
                      WHERE op.provider = :provider AND op.provider_id = :provider_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':provider', $provider);
            $stmt->bindParam(':provider_id', $providerId);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            error_log("findUserByOAuth: provider=$provider, provider_id=$providerId, result=" . json_encode($result));
            return $result;
        } catch (PDOException $e) {
            error_log("findUserByOAuth error: " . $e->getMessage());
            return false;
        }
    }

    public function linkProviderToUser($userId, $provider, $providerId, $providerData) {
        try {
            $query = "INSERT INTO oauth_providers (id_client, provider, provider_id, provider_data) 
                      VALUES (:id_client, :provider, :provider_id, :provider_data)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id_client', $userId, PDO::PARAM_INT);
            $stmt->bindParam(':provider', $provider);
            $stmt->bindParam(':provider_id', $providerId);
            $stmt->bindParam(':provider_data', $providerData);
            $result = $stmt->execute();
            error_log("linkProviderToUser: userId=$userId, provider=$provider, result=" . ($result ? 'success' : 'failed'));
            return $result;
        } catch (PDOException $e) {
            error_log("linkProviderToUser error: " . $e->getMessage());
            return false;
        }
    }

    public function createUserWithOAuth($provider, $providerId, $email, $username, $providerData) {
        try {
            $this->conn->beginTransaction();

            $query = "INSERT INTO clients (email, name) VALUES (:email, :name)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':name', $username);
            $stmt->execute();
            $userId = $this->conn->lastInsertId();

            $query = "INSERT INTO oauth_providers (id_client, provider, provider_id, provider_data) 
                      VALUES (:id_client, :provider, :provider_id, :provider_data)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id_client', $userId, PDO::PARAM_INT);
            $stmt->bindParam(':provider', $provider);
            $stmt->bindParam(':provider_id', $providerId);
            $stmt->bindParam(':provider_data', $providerData);
            $stmt->execute();

            $this->conn->commit();
            error_log("createUserWithOAuth: userId=$userId, email=$email, provider=$provider");
            return $userId;
        } catch (PDOException $e) {
            $this->conn->rollback();
            error_log("createUserWithOAuth error: " . $e->getMessage());
            return false;
        }
    }

    public function getUserProviders($userId) {
        try {
            $query = "SELECT provider FROM oauth_providers WHERE id_client = :id_client";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id_client', $userId, PDO::PARAM_INT);
            error_log("getUserProviders: userId=$userId, query=$query");
            if (!$stmt->execute()) {
                error_log("getUserProviders: Execute failed for userId=$userId");
                return [];
            }
            $providers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log("getUserProviders: userId=$userId, raw providers=" . json_encode($providers));
            $result = array_map(function($provider) {
                return ['provider' => $provider['provider']];
            }, $providers);
            error_log("getUserProviders: userId=$userId, mapped providers=" . json_encode($result));
            return $result;
        } catch (PDOException $e) {
            error_log("getUserProviders error: userId=$userId, message=" . $e->getMessage());
            return [];
        }
    }
}
?>