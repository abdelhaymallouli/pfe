<?php
class OAuth {
    private $conn;
    private $table_name = "oauth_providers";

    public function __construct($db) {
        $this->conn = $db;
    }

    // Find user by OAuth provider and provider ID
    public function findUserByOAuth($provider, $provider_id) {
        $query = "SELECT c.id_client, c.name as username, c.email 
                  FROM client c
                  INNER JOIN " . $this->table_name . " o 
                  ON c.id_client = o.id_client 
                  WHERE o.provider = :provider AND o.provider_id = :provider_id 
                  LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":provider", $provider);
        $stmt->bindParam(":provider_id", $provider_id);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }
        return false;
    }

    // Link OAuth provider to an existing user
    public function linkProviderToUser($user_id, $provider, $provider_id, $provider_data) {
        $query = "INSERT INTO " . $this->table_name . " 
                  (id_client, provider, provider_id, provider_data) 
                  VALUES (:id_client, :provider, :provider_id, :provider_data)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id_client", $user_id);
        $stmt->bindParam(":provider", $provider);
        $stmt->bindParam(":provider_id", $provider_id);
        $stmt->bindParam(":provider_data", $provider_data);
        return $stmt->execute();
    }

    // Create a new user with OAuth data
    public function createUserWithOAuth($provider, $provider_id, $email, $username, $provider_data) {
        // First, create the user in the client table
        $user = new User($this->conn);
        $user->name = $username;
        $user->email = $email;
        $user->password = password_hash(bin2hex(random_bytes(16)), PASSWORD_DEFAULT); // Random password
        if (!$user->create()) {
            return false;
        }

        // Link the OAuth provider
        $this->linkProviderToUser($user->id, $provider, $provider_id, $provider_data);
        return $user->id;
    }

    // Get OAuth providers for a user
    public function getUserProviders($user_id) {
        $query = "SELECT provider, provider_id, provider_data 
                  FROM " . $this->table_name . " 
                  WHERE id_client = :id_client";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id_client", $user_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Unlink an OAuth provider
    public function unlinkProvider($user_id, $provider) {
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE id_client = :id_client AND provider = :provider";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id_client", $user_id);
        $stmt->bindParam(":provider", $provider);
        return $stmt->execute();
    }
}
?>