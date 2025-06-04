<?php
// backend/config/database.php
class Database {
    private $host = "localhost";       // usually localhost for local dev
    private $db_name = "venuvibe";    // your database name
    private $username = "root";        // default local MySQL username
    private $password = "";            // default local MySQL password (empty if none)
    private $conn;

    // Get PDO database connection
    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch (PDOException $e) {
            // Log error instead of outputting it
            error_log("Database connection failed: " . $e->getMessage());
            return null; // Return null to indicate failure
        }

        return $this->conn;
    }
}
?>