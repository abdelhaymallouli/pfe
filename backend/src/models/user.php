<?php
class User {
    private $conn;
    private $table_name = "client";

    // User properties
    public $id;
    public $name;
    public $email;
    public $password;
    public $created_at;

    // Constructor
    public function __construct($db) {
        $this->conn = $db;
    }

    // Create a new user
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " (nom, email, mot_de_passe) 
                  VALUES (:nom, :email, :mot_de_passe)";
        $stmt = $this->conn->prepare($query);

        // Clean data
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->email = htmlspecialchars(strip_tags($this->email));

        $stmt->bindParam(":nom", $this->name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":mot_de_passe", $this->password);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    // Check if email exists
    public function emailExists() {
        $query = "SELECT id_client, nom, email, mot_de_passe, date_creation 
                  FROM " . $this->table_name . " 
                  WHERE email = :email 
                  LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $this->email = htmlspecialchars(strip_tags($this->email));
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            $this->id = $row['id_client'];
            $this->name = $row['nom'];
            $this->email = $row['email'];
            $this->password = $row['mot_de_passe'];
            $this->created_at = $row['date_creation'];

            return true;
        }

        return false;
    }

    // Get user by ID
    public function getById($id) {
        $query = "SELECT id_client, nom, email, date_creation 
                  FROM " . $this->table_name . " 
                  WHERE id_client = :id_client LIMIT 1";
        $stmt = $this->conn->prepare($query);

        $id = htmlspecialchars(strip_tags($id));
        $stmt->bindParam(":id_client", $id);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            $this->id = $row['id_client'];
            $this->name = $row['nom'];
            $this->email = $row['email'];
            $this->created_at = $row['date_creation'];

            return true;
        }

        return false;
    }
}
?>
