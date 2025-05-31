<?php
// backend/src/controllers/EventController.php
require_once __DIR__ . '/../models/EventModel.php';

class EventController {
    private $model;

    public function __construct($db) {
        $this->model = new EventModel($db);
    }

    public function getEvents() {
        try {
            return $this->model->getAllEvents();
        } catch (Exception $e) {
            error_log("Error getting events: " . $e->getMessage());
            return [];
        }
    }

    public function getEventById(int $id) {
        try {
            $event = $this->model->getEventById($id);
            if (!$event) {
                error_log("Event not found for ID: $id");
                return null;
            }
            return $event;
        } catch (Exception $e) {
            error_log("Error getting event ID $id: " . $e->getMessage());
            throw $e;
        }
    }

    public function addEvent($data) {
        try {
            error_log("EventController::addEvent received data: " . json_encode($data));

            $required = ['user_id', 'title', 'type_id', 'date', 'location', 'expected_guests'];
            foreach ($required as $field) {
                if (!isset($data[$field]) || (is_string($data[$field]) && empty(trim($data[$field])))) {
                    throw new Exception("Field '$field' is required");
                }
            }

            $data['description'] = $data['description'] ?? '';
            $data['image_banniere'] = $data['image_banniere'] ?? '';
            $data['budget'] = $data['budget'] ?? 0;
            $data['status'] = $data['status'] ?? 'Planned';
            $data['expected_guests'] = (int)$data['expected_guests'];

            if (!is_numeric($data['user_id'])) {
                throw new Exception('user_id must be numeric');
            }
            if (!is_numeric($data['type_id'])) {
                throw new Exception('type_id must be numeric');
            }
            if (!is_numeric($data['expected_guests'])) {
                throw new Exception('expected_guests must be numeric');
            }
            if (isset($data['budget']) && !is_numeric($data['budget'])) {
                throw new Exception('budget must be numeric');
            }

            $eventId = $this->model->createEvent($data);

            if (!$eventId) {
                throw new Exception('Failed to create event - no ID returned');
            }

            error_log("Event created successfully with ID: $eventId");
            return $eventId;
        } catch (Exception $e) {
            error_log("Error adding event: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }
}
?>