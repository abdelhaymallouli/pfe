<?php
// backend/src/api/requetes.php
ob_start();
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';

header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');

try {
    $database = new Database();
    $pdo = $database->getConnection();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        if (!isset($_GET['id_event']) || !is_numeric($_GET['id_event'])) {
            ob_clean();
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Event ID is required and must be numeric'
            ], JSON_THROW_ON_ERROR);
            exit;
        }

        $eventId = (int)$_GET['id_event'];
        $sql = "SELECT id, titre, description, date_limite, statut 
                FROM requete 
                WHERE id_event = :id_event";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id_event' => $eventId]);
        $requetes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        ob_clean();
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $requetes
        ], JSON_THROW_ON_ERROR);
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