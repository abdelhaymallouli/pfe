<?php
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

    public function addEvent($data) {
        try {
            // Set default values for optional fields
            $data['theme'] = $data['theme'] ?? '';
            $data['description'] = $data['description'] ?? '';
            $data['bannerImage'] = $data['bannerImage'] ?? '';
            
            $eventId = $this->model->createEvent($data);

            if (!$eventId) {
                return false;
            }

            // Insert vendors if provided
            if (!empty($data['vendors'])) {
                foreach ($data['vendors'] as $vendorId) {
                    if (is_numeric($vendorId)) {
                        $this->model->addVendorToEvent($eventId, $vendorId);
                    }
                }
            }

            // Insert tasks if provided
            if (!empty($data['tasks'])) {
                foreach ($data['tasks'] as $task) {
                    if (!empty($task['title'])) {
                        $this->model->addTask($eventId, $task['title']);
                    }
                }
            }

            return $eventId;
        } catch (Exception $e) {
            error_log("Error adding event: " . $e->getMessage());
            return false;
        }
    }
}
?>