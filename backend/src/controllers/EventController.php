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
            // Fetch event using EventModel
            $event = $this->model->getEventById($id);
            if (!$event) {
                error_log("Event not found for ID: $id");
                return null;
            }
            return $event;
        } catch (Exception $e) {
            error_log("Error getting event ID $id: " . $e->getMessage());
            throw $e; // Re-throw to let events.php handle the response
        }
    }

    public function addEvent($data) {
        try {
            // Log the incoming data for debugging
            error_log("EventController::addEvent received data: " . json_encode($data));

            // Validate required fields
            $required = ['user_id', 'title', 'type', 'date', 'location'];
            foreach ($required as $field) {
                if (!isset($data[$field]) || (is_string($data[$field]) && empty(trim($data[$field])))) {
                    throw new Exception("Field '$field' is required");
                }
            }

            // Set default values for optional fields
            $data['theme'] = $data['theme'] ?? '';
            $data['description'] = $data['description'] ?? '';
            $data['bannerImage'] = $data['bannerImage'] ?? '';
            $data['budget'] = $data['budget'] ?? 0;
            
            // Handle expectedGuests field name consistency
            if (isset($data['expectedGuests']) && !isset($data['expected_guests'])) {
                $data['expected_guests'] = $data['expectedGuests'];
            }

            // Validate numeric fields
            if (!is_numeric($data['user_id'])) {
                throw new Exception('user_id must be numeric');
            }

            if (isset($data['expected_guests']) && !is_numeric($data['expected_guests'])) {
                throw new Exception('expected_guests must be numeric');
            }

            if (isset($data['budget']) && !is_numeric($data['budget'])) {
                throw new Exception('budget must be numeric');
            }

            // Validate arrays
            if (isset($data['vendors']) && !is_array($data['vendors'])) {
                throw new Exception('vendors must be an array');
            }

            if (isset($data['tasks']) && !is_array($data['tasks'])) {
                throw new Exception('tasks must be an array');
            }

            // The model now handles vendors and tasks insertion internally
            $eventId = $this->model->createEvent($data);

            if (!$eventId) {
                throw new Exception('Failed to create event - no ID returned');
            }

            error_log("Event created successfully with ID: $eventId");
            return $eventId;
            
        } catch (Exception $e) {
            error_log("Error adding event: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw $e; // Re-throw to let the API handle the response
        }
    }
}
?>