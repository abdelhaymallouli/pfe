<?php
// backend/src/api/requetes.php
ob_start();
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../controllers/RequeteController.php';

header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');

try {
    $database = new Database();
    $pdo = $database->getConnection();
    $controller = new RequeteController($pdo);
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        if (isset($_GET['event_id']) && is_numeric($_GET['event_id'])) {
            $requetes = $controller->getRequetesByEventId((int)$_GET['event_id']);
            ob_clean();
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => array_map(function($requete) {
                    $requete['transaction_montant'] = isset($requete['transaction_montant']) ? (float)$requete['transaction_montant'] : null;
                    return $requete;
                }, $requetes)
            ], JSON_THROW_ON_ERROR);
            exit;
        }
        ob_clean();
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Event ID is required'
        ], JSON_THROW_ON_ERROR);
        exit;
    }

    if ($method === 'POST') {
        $rawInput = file_get_contents('php://input');
        error_log('POST raw input: ' . $rawInput);
        $input = json_decode($rawInput, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            ob_clean();
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid JSON: ' . json_last_error_msg()
            ], JSON_THROW_ON_ERROR);
            exit;
        }

        error_log('Parsed POST input: ' . json_encode($input));

        $required = ['event_id', 'titre', 'montant', 'vendor_id'];
        foreach ($required as $field) {
            if (!isset($input[$field]) || (is_string($input[$field]) && empty(trim($input[$field])))) {
                ob_clean();
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => "Field '$field' is missing or empty"
                ], JSON_THROW_ON_ERROR);
                exit;
            }
        }

        if ((float)$input['montant'] <= 0) {
            ob_clean();
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Amount must be greater than zero'
            ], JSON_THROW_ON_ERROR);
            exit;
        }

        try {
            $result = $controller->addTransactionAndRequete($input);
            ob_clean();
            if ($result) {
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Transaction and requete created successfully',
                    'id_requete' => $result
                ], JSON_THROW_ON_ERROR);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Failed to create transaction and requete'
                ], JSON_THROW_ON_ERROR);
            }
        } catch (Exception $e) {
            error_log('Transaction creation failed: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            ob_clean();
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to create transaction: ' . $e->getMessage()
            ], JSON_THROW_ON_ERROR);
        }
        exit;
    }

    if ($method === 'PUT') {
        $rawInput = file_get_contents('php://input');
        error_log('PUT raw input: ' . $rawInput);
        $input = json_decode($rawInput, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            ob_clean();
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid JSON: ' . json_last_error_msg()
            ], JSON_THROW_ON_ERROR);
            exit;
        }

        if (!isset($input['id_requete']) || !isset($input['statut'])) {
            ob_clean();
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'id_requete and statut are required'
            ], JSON_THROW_ON_ERROR);
            exit;
        }

        $validStatuses = ['Open', 'In Progress', 'Completed', 'Cancelled'];
        if (!in_array($input['statut'], $validStatuses)) {
            ob_clean();
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid status value'
            ], JSON_THROW_ON_ERROR);
            exit;
        }

        $result = $controller->updateRequeteStatus((int)$input['id_requete'], $input['statut']);
        error_log('Update result: ' . ($result ? 'true' : 'false'));
        ob_clean();
        if ($result) {
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Requete status updated successfully'
            ], JSON_THROW_ON_ERROR);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to update requete status'
            ], JSON_THROW_ON_ERROR);
        }
        exit;
    }

    ob_clean();
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ], JSON_THROW_ON_ERROR);

} catch (Exception $e) {
    error_log('Server error in requetes.php: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ], JSON_THROW_ON_ERROR);
}
exit;
?>