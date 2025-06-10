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

    // Client Management
    public function getAllClients($pdo, $limit = null, $offset = null) {
        $sql = "SELECT id_client, name AS nom, email, creation_date FROM client";
        $params = [];
        if ($limit !== null && $offset !== null) {
            $sql .= " LIMIT ? OFFSET ?";
            $params[] = $limit;
            $params[] = $offset;
        }
        $stmt = $pdo->prepare($sql);
        if ($limit !== null && $offset !== null) {
            $stmt->bindValue(1, $limit, PDO::PARAM_INT);
            $stmt->bindValue(2, $offset, PDO::PARAM_INT);
            $stmt->execute();
        } else {
            $stmt->execute();
        }
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getClientById($pdo, $id_client) {
        $stmt = $pdo->prepare("SELECT id_client, name AS nom, email, creation_date FROM client WHERE id_client = ?");
        $stmt->execute([$id_client]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function addClient($pdo, $name, $email, $password) {
        $stmt = $pdo->prepare("INSERT INTO client (name, email, password) VALUES (?, ?, ?)");
        $stmt->execute([$name, $email, $password]);
        return $pdo->lastInsertId();
    }

    public function updateClient($pdo, $id_client, $name, $email, $password = null) {
        if ($password) {
            $stmt = $pdo->prepare("UPDATE client SET name = ?, email = ?, password = ? WHERE id_client = ?");
            return $stmt->execute([$name, $email, $password, $id_client]);
        } else {
            $stmt = $pdo->prepare("UPDATE client SET name = ?, email = ? WHERE id_client = ?");
            return $stmt->execute([$name, $email, $id_client]);
        }
    }

    public function deleteClient($pdo, $id_client) {
        $stmt = $pdo->prepare("DELETE FROM client WHERE id_client = ?");
        return $stmt->execute([$id_client]);
    }

    // Event Management
    public function getAllEvents($pdo, $limit = null, $offset = null) {
        $sql = "SELECT e.id_event, e.title, e.event_date AS date, e.location AS lieu, e.status AS statut, e.budget, e.expected_guests, e.description, c.name AS client_name, t.type_name AS type_name 
                FROM event e 
                LEFT JOIN client c ON e.id_client = c.id_client 
                LEFT JOIN type t ON e.id_type = t.id_type";
        if ($limit !== null && $offset !== null) {
            $sql .= " LIMIT ? OFFSET ?";
        }
        $stmt = $pdo->prepare($sql);
        if ($limit !== null && $offset !== null) {
            $stmt->bindValue(1, $limit, PDO::PARAM_INT);
            $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        }
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addEvent($pdo, $title, $event_date, $location, $description, $expected_guests, $budget, $id_client, $id_type) {
        $stmt = $pdo->prepare("INSERT INTO event (title, event_date, location, description, expected_guests, budget, id_client, id_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$title, $event_date, $location, $description, $expected_guests, $budget, $id_client, $id_type]);
        return $pdo->lastInsertId();
    }

    public function updateEvent($pdo, $id_event, $title, $event_date, $location, $description, $expected_guests, $budget, $status, $id_client, $id_type) {
        $stmt = $pdo->prepare("UPDATE event SET title = ?, event_date = ?, location = ?, description = ?, expected_guests = ?, budget = ?, status = ?, id_client = ?, id_type = ? WHERE id_event = ?");
        return $stmt->execute([$title, $event_date, $location, $description, $expected_guests, $budget, $status, $id_client, $id_type, $id_event]);
    }

    public function deleteEvent($pdo, $id_event) {
        $stmt = $pdo->prepare("DELETE FROM event WHERE id_event = ?");
        return $stmt->execute([$id_event]);
    }

    // Vendor Management
    public function getAllVendors($pdo, $limit = null, $offset = null) {
        $sql = "SELECT id_vendor, name AS nom, email, phone, rating AS note, category, description, image, creation_date FROM vendor";
        if ($limit !== null && $offset !== null) {
            $sql .= " LIMIT ? OFFSET ?";
        }
        $stmt = $pdo->prepare($sql);
        if ($limit !== null && $offset !== null) {
            $stmt->bindValue(1, $limit, PDO::PARAM_INT);
            $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        }
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addVendor($pdo, $name, $email, $phone, $rating, $category, $description, $image) {
        $stmt = $pdo->prepare("INSERT INTO vendor (name, email, phone, rating, category, description, image) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$name, $email, $phone ?: null, $rating, $category, $description, $image]);
        return $pdo->lastInsertId();
    }

    public function updateVendor($pdo, $id_vendor, $name, $email, $phone, $rating, $category, $description, $image) {
        $stmt = $pdo->prepare("UPDATE vendor SET name = ?, email = ?, phone = ?, rating = ?, category = ?, description = ?, image = ? WHERE id_vendor = ?");
        return $stmt->execute([$name, $email, $phone ?: null, $rating, $category, $description, $image, $id_vendor]);
    }

    public function deleteVendor($pdo, $id_vendor) {
        $stmt = $pdo->prepare("DELETE FROM vendor WHERE id_vendor = ?");
        return $stmt->execute([$id_vendor]);
    }

    // Category Management (Type table)
    public function getAllTypes($pdo) {
        $stmt = $pdo->query("SELECT id_type, type_name AS name FROM type");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addType($pdo, $type_name) {
        $stmt = $pdo->prepare("INSERT INTO type (type_name) VALUES (?)");
        $stmt->execute([$type_name]);
        return $pdo->lastInsertId();
    }

    public function updateType($pdo, $id_type, $type_name) {
        $stmt = $pdo->prepare("UPDATE type SET type_name = ? WHERE id_type = ?");
        return $stmt->execute([$type_name, $id_type]);
    }

    public function deleteType($pdo, $id_type) {
        $stmt = $pdo->prepare("DELETE FROM type WHERE id_type = ?");
        return $stmt->execute([$id_type]);
    }

    // Request Management
    public function getAllRequests($pdo, $limit = null, $offset = null) {
        $sql = "
            SELECT 
                r.id_request AS id_request,
                r.title AS title,
                r.description AS description,
                r.status AS status,
                r.deadline AS deadline,
                t.amount AS amount,
                t.transaction_date AS transaction_date,
                e.title AS event_title,
                c.name AS client_name,
                v.name AS vendor_name
            FROM request r
            LEFT JOIN event e ON r.id_event = e.id_event
            LEFT JOIN client c ON e.id_client = c.id_client
            LEFT JOIN vendor v ON r.id_vendor = v.id_vendor
            LEFT JOIN transaction t ON r.id_transaction = t.id_transaction
        ";
        if ($limit !== null && $offset !== null) {
            $sql .= " LIMIT ? OFFSET ?";
        }
        $stmt = $pdo->prepare($sql);
        if ($limit !== null && $offset !== null) {
            $stmt->bindValue(1, $limit, PDO::PARAM_INT);
            $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        }
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addRequest($pdo, $title, $description, $deadline, $id_event, $id_vendor = null) {
        $stmt = $pdo->prepare("INSERT INTO request (title, description, deadline, id_event, id_vendor) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$title, $description, $deadline, $id_event, $id_vendor]);
        return $pdo->lastInsertId();
    }

    public function updateRequest($pdo, $id_request, $title, $description, $deadline, $status, $id_vendor = null) {
        $stmt = $pdo->prepare("UPDATE request SET title = ?, description = ?, deadline = ?, status = ?, id_vendor = ? WHERE id_request = ?");
        return $stmt->execute([$title, $description, $deadline, $status, $id_vendor, $id_request]);
    }

    public function updateRequestStatus($pdo, $id_request, $status) {
        $stmt = $pdo->prepare("UPDATE request SET status = ? WHERE id_request = ?");
        return $stmt->execute([$status, $id_request]);
    }

    public function deleteRequest($pdo, $id_request) {
        $stmt = $pdo->prepare("DELETE FROM request WHERE id_request = ?");
        return $stmt->execute([$id_request]);
    }

    // Transaction Management
    public function getAllTransactions($pdo, $limit = null, $offset = null) {
        $sql = "SELECT t.id_transaction, t.amount AS montant, t.transaction_date AS date, t.id_event, e.title AS event_title 
                FROM transaction t 
                LEFT JOIN event e ON t.id_event = e.id_event";
        if ($limit !== null && $offset !== null) {
            $sql .= " LIMIT ? OFFSET ?";
        }
        $stmt = $pdo->prepare($sql);
        if ($limit !== null && $offset !== null) {
            $stmt->bindValue(1, $limit, PDO::PARAM_INT);
            $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        }
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Analytics Methods
    
    
public function getAnalyticsData($pdo) {
    $data = [];
    
    // --- FIX APPLIED TO THE FOLLOWING QUERIES ---

    // Total counts
    $stmt_clients = $pdo->query("SELECT COUNT(*) as count FROM client");
    $data["total_clients"] = $stmt_clients ? $stmt_clients->fetch(PDO::FETCH_ASSOC)['count'] : 0;

    $stmt_events = $pdo->query("SELECT COUNT(*) as count FROM event");
    $data["total_events"] = $stmt_events ? $stmt_events->fetch(PDO::FETCH_ASSOC)['count'] : 0;

    $stmt_vendors = $pdo->query("SELECT COUNT(*) as count FROM vendor");
    $data["total_vendors"] = $stmt_vendors ? $stmt_vendors->fetch(PDO::FETCH_ASSOC)['count'] : 0;

    $stmt_requests = $pdo->query("SELECT COUNT(*) as count FROM request");
    $data["total_requests"] = $stmt_requests ? $stmt_requests->fetch(PDO::FETCH_ASSOC)['count'] : 0;
    
    // Revenue data
    $stmt_revenue = $pdo->query("SELECT COALESCE(SUM(amount), 0) as total FROM transaction");
    $data["total_revenue"] = $stmt_revenue ? $stmt_revenue->fetch(PDO::FETCH_ASSOC)['total'] : 0;
    
    // --- NO CHANGES NEEDED FOR THE QUERIES BELOW, THEY ARE ALREADY SAFE ---
    
    // Events by status
    $stmt = $pdo->query("SELECT status, COUNT(*) as count FROM event GROUP BY status");
    $data["events_by_status"] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Events by type
    $stmt = $pdo->query("SELECT t.type_name, COUNT(e.id_event) as count FROM type t LEFT JOIN event e ON t.id_type = e.id_type GROUP BY t.id_type, t.type_name");
    $data["events_by_type"] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Monthly revenue
    $stmt = $pdo->query("SELECT DATE_FORMAT(transaction_date, '%Y-%m') as month, SUM(amount) as revenue FROM transaction GROUP BY DATE_FORMAT(transaction_date, '%Y-%m') ORDER BY month");
    $data["monthly_revenue"] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Requests by status
    $stmt = $pdo->query("SELECT status, COUNT(*) as count FROM request GROUP BY status");
    $data["requests_by_status"] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Top vendors by rating
    $stmt = $pdo->query("SELECT name, rating FROM vendor WHERE rating IS NOT NULL ORDER BY rating DESC LIMIT 10");
    $data["top_vendors"] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    return $data;
}

    // Backup functionality
    public function createDatabaseBackup($pdo) {
        $tables = [];
        $stmt = $pdo->query("SHOW TABLES");
        while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $tables[] = $row[0];
        }
        
        $backup = "-- VenuVibe Database Backup\n";
        $backup .= "-- Generated on " . date("Y-m-d H:i:s") . "\n\n";
        $backup .= "SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";\n";
        $backup .= "START TRANSACTION;\n";
        $backup .= "SET time_zone = \"+00:00\";\n\n";
        
        foreach ($tables as $table) {
            // Get table structure
            $stmt = $pdo->query("SHOW CREATE TABLE `$table`");
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $backup .= "\n-- Table structure for table `$table`\n";
            $backup .= "DROP TABLE IF EXISTS `$table`;\n";
            $backup .= $row["Create Table"] . ";\n\n";
            
            // Get table data
            $stmt = $pdo->query("SELECT * FROM `$table`");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (!empty($rows)) {
                $backup .= "-- Dumping data for table `$table`\n";
                $columns = array_keys($rows[0]);
                $backup .= "INSERT INTO `$table` (`" . implode("`, `", $columns) . "`) VALUES\n";
                
                $values = [];
                foreach ($rows as $row) {
                    $rowValues = [];
                    foreach ($row as $value) {
                        if ($value === null) {
                            $rowValues[] = "NULL";
                        } else {
                            $rowValues[] = "\'" . addslashes($value) . "\'";
                        }
                    }
                    $values[] = "(" . implode(", ", $rowValues) . ")";
                }
                $backup .= implode(",\n", $values) . ";\n\n";
            }
        }
        
        $backup .= "COMMIT;\n";
        return $backup;
    }
}


