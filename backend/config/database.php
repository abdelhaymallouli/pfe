<?php
class Database {
    private $host = "localhost";       // usually localhost for local dev
    private $db_name = "venuvibe";      // your database name
    private $username = "root";         // default local MySQL username
    private $password = "";             // default local MySQL password (empty if none)
    private $conn;

    // Get PDO database connection
    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );

            // Set error mode to exceptions
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Fetch results as associative arrays by default
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            echo "Connection error: " . $e->getMessage();
            exit; // stop script if connection fails
        }

        return $this->conn;
    }
}
?>
