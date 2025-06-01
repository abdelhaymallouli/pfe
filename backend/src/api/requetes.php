<?php
// backend/src/api/requetes.php
ob_start();
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../controllers/RequeteController.php';

header('Content-Type: application/json; charset=UTF-8');

try {
    $database = new Database();
    $pdo = $database->getConnection();
    $controller = new RequeteController($pdo);
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            if (!isset($_GET['event_id']) || !is_numeric($_GET['event_id'])) {
                ob_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid or missing event ID']);
                exit;
            }
            $event_id = (int)$_GET['event_id'];
            $user_id = isset($_GET['userId']) && is_numeric($_GET['userId']) ? (int)$_GET['userId'] : null;
            error_log("Fetching requetes for event_id: $event_id" . ($user_id ? " and user_id: $user_id" : ""));
            // Verify event ownership if user_id is provided
            if ($user_id !== null) {
                $sql = "SELECT id_event FROM event WHERE id_event = :event_id AND id_client = :user_id";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([':event_id' => $event_id, ':user_id' => $user_id]);
                if (!$stmt->fetch()) {
                    ob_clean();
                    http_response_code(403);
                    echo json_encode(['success' => false, 'message' => 'Event does not belong to the user']);
                    exit;
                }
            }
            $requetes = $controller->getRequetesByEventId($event_id);
            ob_clean();
            echo json_encode(['success' => true, 'data' => $requetes], JSON_THROW_ON_ERROR);
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                ob_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
                exit;
            }
            if (!isset($input['event_id'], $input['titre'], $input['montant'], $input['user_id'])) {
                ob_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Missing required fields']);
                exit;
            }
            // Verify event ownership
            $sql = "SELECT id_event FROM event WHERE id_event = :event_id AND id_client = :user_id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':event_id' => (int)$input['event_id'], ':user_id' => (int)$input['user_id']]);
            if (!$stmt->fetch()) {
                ob_clean();
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Event does not belong to the user']);
                exit;
            }
            try {
                $requete_id = $controller->addTransactionAndRequete($input);
                ob_clean();
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'id_requete' => $requete_id,
                    'message' => 'Requete created successfully'
                ], JSON_THROW_ON_ERROR);
            } catch (Exception $e) {
                error_log("Requete creation failed: " . $e->getMessage());
                ob_clean();
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to create requete: ' . $e->getMessage()]);
            }
            break;

        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                ob_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
                exit;
            }
            if (!isset($input['id_requete'], $input['statut'], $input['id_event'], $input['user_id'])) {
                ob_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Missing required fields']);
                exit;
            }
            // Verify event ownership
            $sql = "SELECT id_event FROM event WHERE id_event = :event_id AND id_client = :user_id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':event_id' => (int)$input['id_event'], ':user_id' => (int)$input['user_id']]);
            if (!$stmt->fetch()) {
                ob_clean();
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Event does not belong to the user']);
                exit;
            }
            try {
                $pdo->beginTransaction();
                error_log("Updating requete ID: {$input['id_requete']} to status: {$input['statut']}");
                $controller->updateRequeteStatus((int)$input['id_requete'], $input['statut']);

                if (isset($input['montant'], $input['id_event'])) {
                    error_log("Updating/inserting transaction for requete ID: {$input['id_requete']}");
                    $sql = "SELECT id_transaction FROM requete WHERE id_requete = :id_requete";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([':id_requete' => (int)$input['id_requete']]);
                    $id_transaction = $stmt->fetchColumn();

                    if ($id_transaction) {
                        $sql = "UPDATE transaction SET montant = :montant, date = :date WHERE id_transaction = :id_transaction AND id_event = :id_event";
                        $stmt = $pdo->prepare($sql);
                        $stmt->execute([
                            ':montant' => (float)$input['montant'],
                            ':date' => $input['transaction_date'] ?? date('Y-m-d H:i:s'),
                            ':id_transaction' => (int)$id_transaction,
                            ':id_event' => (int)$input['id_event']
                        ]);
                    } else {
                        $sql = "INSERT INTO transaction (montant, id_event, date) VALUES (:montant, :id_event, :date)";
                        $stmt = $pdo->prepare($sql);
                        $stmt->execute([
                            ':montant' => (float)$input['montant'],
                            ':id_event' => (int)$input['id_event'],
                            ':date' => $input['transaction_date'] ?? date('Y-m-d H:i:s')
                        ]);
                        $new_transaction_id = $pdo->lastInsertId();

                        $sql = "UPDATE requete SET id_transaction = :id_transaction WHERE id_requete = :id_requete";
                        $stmt = $pdo->prepare($sql);
                        $stmt->execute([
                            ':id_transaction' => (int)$new_transaction_id,
                            ':id_requete' => (int)$input['id_requete']
                        ]);
                    }
                }

                $pdo->commit();
                ob_clean();
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Requete updated successfully'
                ], JSON_THROW_ON_ERROR);
            } catch (Exception $e) {
                $pdo->rollBack();
                error_log("Requete update failed for ID {$input['id_requete']}: " . $e->getMessage());
                ob_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Failed to update requete: ' . $e->getMessage()]);
            }
            break;

        default:
            ob_clean();
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    error_log("Server error in requetes.php: " . $e->getMessage());
    ob_clean();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
ob_end_flush();
?>