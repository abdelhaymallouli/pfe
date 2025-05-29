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

            // Validate required fields
            $required = ['user_id', 'title', 'type', 'date', 'location', 'expected_guests'];
            foreach ($required as $field) {
                if (!isset($data[$field]) || (is_string($data[$field]) && empty(trim($data[$field])))) {
                    throw new Exception("Field '$field' is required");
                }
            }

            // Set default values for optional fields
            $data['theme'] = $data['theme'] ?? null;
            $data['description'] = $data['description'] ?? null;
            $data['bannerImage'] = $data['bannerImage'] ?? null;
            $data['budget'] = $data['budget'] ?? 0.00;
            $data['status'] = $data['status'] ?? 'upcoming';

            // Validate numeric fields
            if (!is_numeric($data['user_id'])) {
                throw new Exception('user_id must be numeric');
            }
            if (!is_numeric($data['expected_guests'])) {
                throw new Exception('expected_guests must be numeric');
            }
            if (!is_numeric($data['budget'])) {
                throw new Exception('budget must be numeric');
            }

            // Validate arrays
            if (isset($data['vendors']) && !is_array($data['vendors'])) {
                throw new Exception('vendors must be an array');
            }
            if (isset($data['tasks']) && !is_array($data['tasks'])) {
                throw new Exception('tasks must be an array');
            }

            // Validate status
            if (!in_array($data['status'], ['upcoming', 'cancelled', 'completed'])) {
                throw new Exception('Invalid status value');
            }

            // Create the event
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