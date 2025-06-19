<?php
class User {
    private $conn;
    private $table_name = "client";

    public $id;
    public $name;
    public $email;
    public $password;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

public function create() {
        $query = "INSERT INTO " . $this->table_name . " (name, email, password) 
                  VALUES (:name, :email, :password)";
        $stmt = $this->conn->prepare($query);

        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->email = htmlspecialchars(strip_tags($this->email));

        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password", $this->password);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            error_log("User created with ID: " . $this->id); // Debug log
            return true;
        }

        error_log("Failed to create user with email: " . $this->email);
        return false;
    }

public function emailExists() {
        try {
            $query = "SELECT id_client, name FROM " . $this->table_name . " WHERE email = :email LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $this->email = htmlspecialchars(strip_tags($this->email));
            $stmt->bindParam(':email', $this->email);
            $stmt->execute();

            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $this->id_client = $row['id_client'];
                $this->name = $row['name'];
                error_log("emailExists found user: id=" . $this->id_client . ", email=" . $this->email);
                return true;
            }
            return false;
        } catch (PDOException $e) {
            error_log("emailExists error: " . $e->getMessage());
            return false;
        }
    }
    public function getById($id) {
        $query = "SELECT id_client, name, email, creation_date 
                  FROM " . $this->table_name . " 
                  WHERE id_client = :id_client LIMIT 1";
        $stmt = $this->conn->prepare($query);

        $id = htmlspecialchars(strip_tags($id));
        $stmt->bindParam(":id_client", $id);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            $this->id = $row['id_client'];
            $this->name = $row['name'];
            $this->email = $row['email'];
            $this->created_at = $row['creation_date'];

            return true;
        }

        return false;
    }

    public function verifyPassword($password) {
        $query = "SELECT password FROM " . $this->table_name . " 
                  WHERE id_client = :id_client LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id_client", $this->id);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return password_verify($password, $row['password']);
        }
        return false;
    }

    public function updatePassword() {
        $query = "UPDATE " . $this->table_name . " 
                  SET password = :password 
                  WHERE id_client = :id_client";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':password', $this->password);
        $stmt->bindParam(':id_client', $this->id);

        return $stmt->execute();
    }
}
?>